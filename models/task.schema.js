const mongoose = require("mongoose");
const { Schema } = mongoose;

const checklistItemSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  done: {
    type: Boolean,
    default: false,
  },
});

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["HIGH", "MODERATE", "LOW"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Backlog", "In progress", "To do", "Done"],
      default: "To do",
    },
    checklist: [checklistItemSchema],
    dueDate: {
      type: Date,
    },
    assignee: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
