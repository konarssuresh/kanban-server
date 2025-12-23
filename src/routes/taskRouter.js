const express = require("express");
const { validateUser } = require("../middleware/auth");

const { Task } = require("../models/task");
const { Column } = require("../models/column");
const { Board } = require("../models/board");

const taskRouter = express.Router();

taskRouter.post(
  "/board/:boardId/column/:columnId/task",
  validateUser,
  async (req, res) => {
    try {
      const { boardId, columnId } = req.params;
      const user = req.user;
      const { title, description = "", subtasks = [], position } = req.body;

      if (!title) throw new Error("title is required");
      if (!boardId) throw new Error("boardId is required");
      if (!columnId) throw new Error("columnId is required");

      // verify board belongs to user
      const board = await Board.findOne({ _id: boardId, createdBy: user._id });
      if (!board) throw new Error("board not found or not accessible");

      // verify column belongs to the board
      const column = await Column.findOne({ _id: columnId, board: boardId });
      if (!column) throw new Error("column not found in board");

      // sanitize subtasks array (no separate schema)
      const cleanedSubtasks = Array.isArray(subtasks)
        ? subtasks
            .filter((s) => s && s.title)
            .map((s) => ({ title: String(s.title), isDone: !!s.isDone }))
        : [];

      // compute position if not provided (simple max+1). Consider transactions to avoid races.
      let pos = position;
      if (pos === undefined || pos === null) {
        const maxTask = await Task.findOne({ column: columnId })
          .sort({ position: -1 })
          .select("position")
          .lean();
        pos = (maxTask ? maxTask.position : 0) + 1;
      }

      const task = new Task({
        title,
        description,
        column: columnId,
        board: boardId,
        createdBy: user._id,
        position: pos,
        subtasks: cleanedSubtasks,
      });

      const saved = await task.save();

      const populated = await saved.populate([
        { path: "column", select: "name position" },
        { path: "board", select: "name" },
        { path: "createdBy", select: "name email" },
      ]);

      res.status(201).json(populated);
    } catch (e) {
      res.status(400).send({ message: e?.message, isSuccess: false });
    }
  }
);

taskRouter.delete(
  "/board/:boardId/column/:columnId/task/:taskId",
  validateUser,
  async (req, res) => {
    try {
      const user = req.user;
      const { boardId, columnId, taskId } = req.params;
      if (!taskId) {
        throw new Error("taskId is required");
      }
      if (!columnId) {
        throw new Error("columnId is required");
      }
      if (!taskId) {
        throw new Error("taskId is required");
      }

      const resp = await Task.findOneAndDelete({
        board: boardId,
        column: columnId,
        _id: taskId,
        createdBy: user._id,
      });

      if (resp) {
        res.json({ message: "Task deleted successfully" });
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (e) {
      res.status(403).send({ message: e?.message });
    }
  }
);

module.exports = taskRouter;
