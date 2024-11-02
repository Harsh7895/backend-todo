const Task = require("../models/task.schema");
const User = require("../models/user.schema");
const ErrorHandler = require("../utils/error");

const createTask = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { title, priority, checklist, dueDate, assignee } = req.body;

    if (!title || !priority) {
      return next(ErrorHandler(400, "Title and Priority are required"));
    }

    if (assignee) {
      const assigneeUser = await User.findOne({ email: assignee });
      if (!assigneeUser) {
        return next(ErrorHandler(404, "Assignee not found"));
      }
    }

    const newTask = new Task({
      title,
      priority,
      checklist,
      dueDate: dueDate ? dueDate : null,
      createdBy: id,
      assignee,
      addedToBoard: [],
    });

    await newTask.save();

    await User.findByIdAndUpdate(
      id,
      { $addToSet: { tasks: newTask._id } },
      { new: true }
    );

    const creator = await User.findById(id).populate("shareBoardTo");
    const sharedUsers = creator.shareBoardTo;

    const updatePromises = sharedUsers.map((user) =>
      User.findByIdAndUpdate(
        user._id,
        { $addToSet: { tasks: newTask._id } },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    next(ErrorHandler(500, "Server error while creating task"));
  }
};
const getUserTasks = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { filter } = req.query;
    const user = await User.findById(id);
    const userTasks = await Task.find({ _id: { $in: user.tasks } });

    res.status(200).json({
      success: true,
      tasks: userTasks,
    });
  } catch (error) {
    next(ErrorHandler(500, "Server error while fetching tasks"));
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, title, priority, checklist, dueDate, assignee } = req.body;

    const validStatuses = ["Backlog", "In progress", "To do", "Done"];
    if (status && !validStatuses.includes(status)) {
      return next(ErrorHandler(400, "Invalid task status"));
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        ...(status && { status }),
        ...(title && { title }),
        ...(priority && { priority }),
        ...(checklist && { checklist }),
        ...(dueDate && { dueDate }),
        ...(assignee && { assignee }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return next(ErrorHandler(404, "Task not found"));
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
    });
  } catch (error) {
    next(ErrorHandler(500, "Server error while updating task"));
  }
};

const shareBoard = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { email } = req.body;

    const recipient = await User.findOne({ email });
    if (!recipient) {
      return next(ErrorHandler(404, "User not found"));
    }

    if (!recipient.shareBoardWith.includes(userId)) {
      recipient.shareBoardWith.push(userId);
      await recipient.save();
    }

    const user = await User.findById(userId);
    if (!user.shareBoardTo.includes(recipient._id)) {
      user.shareBoardTo.push(recipient._id);
      await user.save();
    }

    const createdTasks = await Task.find({ createdBy: userId });
    const assignedTasks = await Task.find({ assignee: user.email });

    const taskIdsToUpdate = [
      ...new Set([...createdTasks, ...assignedTasks].map((task) => task._id)),
    ];

    await User.findByIdAndUpdate(userId, {
      $addToSet: { tasks: { $each: taskIdsToUpdate } },
    });

    await User.findByIdAndUpdate(recipient._id, {
      $addToSet: { tasks: { $each: taskIdsToUpdate } },
    });

    await Task.updateMany(
      { _id: { $in: taskIdsToUpdate } },
      { $addToSet: { addedToBoard: recipient._id } }
    );

    res.status(200).json({
      success: true,
      message: "Board and assigned tasks shared successfully",
    });
  } catch (error) {
    next(ErrorHandler(500, "Server error while sharing board"));
  }
};

const updateChecklistItem = async (req, res) => {
  const { taskId, itemIndex } = req.params;
  const { isCompleted } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return next(ErrorHandler(400, "Task not found"));

    task.checklist[itemIndex].isCompleted = isCompleted;
    await task.save();

    res.status(200).json({ message: "Checklist item updated", task });
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { id: userId } = req.user;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(ErrorHandler(404, "Task not found"));
    }

    if (
      task.createdBy.toString() !== userId &&
      task.assignee !== req.user.email &&
      !task.addedToBoard.includes(userId)
    ) {
      return next(ErrorHandler(403, "Unauthorized to delete this task"));
    }

    await User.updateMany({ tasks: taskId }, { $pull: { tasks: taskId } });

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(ErrorHandler(500, "Server error while deleting task"));
  }
};

const getEmailsForAssign = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const allEmails = await User.find({ _id: { $ne: userId } });

    res.status(200).json({
      success: true,
      emails: allEmails.map((user) => user.email),
    });
  } catch (error) {
    return next(error);
  }
};

const getTask = async (req, res, next) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return next(ErrorHandler(400, "Task not found"));
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTask,
  getUserTasks,
  updateTask,
  updateChecklistItem,
  deleteTask,
  getEmailsForAssign,
  shareBoard,
  getTask,
};
