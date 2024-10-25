const Task = require("../models/task.schema");
const User = require("../models/user.schema");
const ErrorHandler = require("../utils/error");

const createTask = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { title, priority, checklist, dueDate, assigneeId } = req.body;

    if (!title || !priority || !dueDate) {
      return next(
        ErrorHandler(400, "Title, Priority, and Due Date are required")
      );
    }

    let assignee = null;
    if (assigneeId) {
      assignee = await User.findById(assigneeId);
      if (!assignee) {
        return next(ErrorHandler(404, "Assignee not found"));
      }
    }

    const newTask = new Task({
      title,
      priority,
      checklist,
      dueDate,
      createdBy: id,
      assignee: assignee ? assignee._id : null,
    });

    await newTask.save();

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

    const createdTasks = await Task.find({ createdBy: id });

    const assignedTasks = await Task.find({ assignee: id });

    res.status(200).json({
      success: true,
      tasks: {
        createdTasks,
        assignedTasks,
      },
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
      !task.assignee.includes(userId)
    ) {
      return next(ErrorHandler(403, "Unauthorized to delete this task"));
    }

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
    const allEmails = await User.find({ email: { $neq: userId } });

    res.status(200).json({
      success: true,
      allEmails,
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
};
