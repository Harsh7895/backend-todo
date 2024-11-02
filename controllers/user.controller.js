const Task = require("../models/task.schema");
const User = require("../models/user.schema");
const ErrorHandler = require("../utils/error");
const bcryptjs = require("bcryptjs");

const getUserName = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(ErrorHandler(400, "User not found"));
    res.status(200).json({
      success: true,
      userName: user.name,
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  const { name, email, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(ErrorHandler(400, "User not found"));

    if (name) user.name = name;
    if (email) {
      const emailUser = await User.findOne({ email });
      if (emailUser)
        return next(ErrorHandler(400, "This Email is already Exist"));
      else user.email = email;
    }

    if (oldPassword && newPassword) {
      const isMatch = await bcryptjs.compare(oldPassword, user.password);
      if (!isMatch) return next(ErrorHandler(400, "Old password is incorrect"));

      const salt = await bcryptjs.genSalt(10);
      user.password = await bcryptjs.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    return next(error);
  }
};

const getUserAnalytics = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    const allTasks = await Task.find({ _id: { $in: user.tasks } });

    const analytics = {
      backlogCount: allTasks.filter((task) => task.status === "Backlog").length,
      todoCount: allTasks.filter((task) => task.status === "To do").length,
      inProgressCount: allTasks.filter((task) => task.status === "In progress")
        .length,
      completedCount: allTasks.filter((task) => task.status === "Done").length,
      lowPriorityCount: allTasks.filter((task) => task.priority === "LOW")
        .length,
      moderatePriorityCount: allTasks.filter(
        (task) => task.priority === "MODERATE"
      ).length,
      highPriorityCount: allTasks.filter((task) => task.priority === "HIGH")
        .length,
      dueDateCount: allTasks.filter((task) => task.dueDate !== null).length,
    };

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { updateUser, getUserName, getUserAnalytics };
