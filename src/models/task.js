const mongoose = require("mongoose");

const { Schema } = mongoose;
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxLength: 200,
      required: true,
    },
    description: {
      type: String,
      maxLength: 1000,
      default: "",
    },
    column: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    position: {
      type: Number,
      default: 0,
    },
    subtasks: [
      {
        title: { type: String, required: true, maxLength: 200 },
        isDone: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ column: 1, position: 1 });
taskSchema.index({ board: 1 });

const Task = mongoose.model("Task", taskSchema, "Task");

module.exports = { Task };
