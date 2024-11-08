const express = require("express");
const router = express.Router();
const {
  createTask,
  getUserTasks,
  updateTask,
  updateChecklistItem,
  deleteTask,
  getEmailsForAssign,
  shareBoard,
  getTask,
  getAnalytics,
} = require("../controllers/task.controller");
const verifyUser = require("../utils/verifyuser");

router.post("/create", verifyUser, createTask);
router.get("/user-tasks", verifyUser, getUserTasks);
router.patch("/update-task/:taskId", verifyUser, updateTask);
router.patch(
  "/update-task/:taskId/checklist/:itemIndex",
  verifyUser,
  updateChecklistItem
);
router.delete("/delete/:taskId", verifyUser, deleteTask);
router.get("/allAssigneeEmails", verifyUser, getEmailsForAssign);
router.post("/share-board", verifyUser, shareBoard);
router.get("/:taskId", getTask);
module.exports = router;
