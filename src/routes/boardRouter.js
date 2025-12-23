const express = require("express");
const { validateUser } = require("../middleware/auth");
const { Board } = require("../models/board");
const { Column } = require("../models/column");
const { Task } = require("../models/task");
const { validateAddBoardRequest } = require("../utils/utils");
const boardRouter = express.Router();
const { maxBy } = require("lodash");

const findBoard = async (queryObj) =>
  Board.find(queryObj).populate({
    path: "columns",
    options: { sort: { position: 1 } }, // optional: order columns
    populate: {
      path: "tasks",
      options: { sort: { position: 1 } },
    },
  });

// helper that returns single populated board document
const findBoardOne = async (queryObj) =>
  Board.findOne(queryObj).populate({
    path: "columns",
    options: { sort: { position: 1 } },
    populate: {
      path: "tasks",
      options: { sort: { position: 1 } },
    },
  });

boardRouter.get("/boards", validateUser, async (req, res) => {
  try {
    const user = req.user;
    const boards = await findBoard({ createdBy: user._id });
    res.json(boards);
  } catch (e) {
    res.status(403).send({ message: e?.message, isSuccess: false });
  }
});

boardRouter.get("/boards/:boardId", validateUser, async (req, res) => {
  try {
    const user = req.user;
    const { boardId } = req.params;
    const board = await findBoardOne({ createdBy: user._id, _id: boardId });
    if (board) {
      res.json(board);
    } else {
      res.status(404).json(null);
    }
  } catch (e) {
    res.status(403).send({ message: e?.message, isSuccess: false });
  }
});

boardRouter.post(
  "/boards/:boardId/changeBoardName",
  validateUser,
  async (req, res) => {
    try {
      const user = req.user;
      const { boardId } = req.params;
      const { name = "" } = req.body;
      if (!name) {
        throw new Error("name is required");
      }
      if (!boardId) {
        throw new Error("board is required");
      }
      const queryObj = { _id: boardId, createdBy: user._id };

      const data = await Board.findOneAndUpdate(
        queryObj,
        {
          name,
        },
        { new: true, runValidators: true }
      ).populate({
        path: "columns",
        options: { sort: { position: 1 } },
        populate: {
          path: "tasks",
          options: { sort: { position: 1 } },
        },
      });

      if (!data) return res.status(404).json({ message: "Board not found" });
      return res.json(data);
    } catch (e) {
      res.status(403).send({ message: e?.message, isSuccess: false });
    }
  }
);

boardRouter.delete("/boards/:boardId", validateUser, async (req, res) => {
  try {
    const user = req.user;
    const { boardId } = req.params;
    if (!boardId) {
      throw new Error("Board is required");
    }
    const resp = await Board.deleteOne({ _id: boardId, createdBy: user?.id });
    if (resp?.deletedCount > 0) {
      res.json({ message: "board deleted successfully" });
    } else {
      res.status(404).json({ message: "board not found" });
    }
  } catch (e) {
    res.status(403).send({ message: e?.message, isSuccess: false });
  }
});

boardRouter.post("/board", validateUser, async (req, res) => {
  try {
    const user = req.user;
    validateAddBoardRequest(req);
    const { columns = [], name } = req.body;
    const board = new Board({
      name,
      createdBy: user._id,
    });
    const savedBoard = await board.save();
    if (columns?.length > 0) {
      const promiseArr = columns.map((col, i) => {
        const column = new Column({
          name: col,
          board: savedBoard._id,
          createdBy: user._id,
          position: i + 1,
        });
        return column.save();
      });

      await Promise.all(promiseArr);
    }

    const storedBoard = await findBoard({ _id: savedBoard?._id });

    res.status(201).json(storedBoard[0]);
  } catch (e) {
    res.status(403).send({ message: e?.message, isSuccess: false });
  }
});

boardRouter.post("/board/:boardId/column", validateUser, async (req, res) => {
  try {
    const { boardId } = req.params;
    const user = req.user;
    const { name } = req.body;
    if (!name) {
      throw new Error("name is required");
    }
    if (!boardId) {
      throw new Error("boardId is required in param");
    }
    let board = await findBoard({ _id: boardId, createdBy: user._id });
    board = board?.length > 0 ? board[0] : null;
    if (!board) {
      throw new Error("not a valid board");
    }
    const maxCol = maxBy(board.columns, "position");
    const nextPos = (maxCol ? maxCol.position : 0) + 1;
    const column = new Column({
      board: boardId,
      name: name,
      position: nextPos,
      createdBy: user._id,
    });
    const columnData = await column.save();
    const data = await columnData.populate({
      path: "tasks",
      options: { sort: { position: 1 } },
    });
    res.status(201).json(data);
  } catch (e) {
    res.status(403).send({ message: e?.message, isSuccess: false });
  }
});

boardRouter.post(
  "/board/:boardId/column/:columnId/changeColumnName",
  validateUser,
  async (req, res) => {
    try {
      const { boardId, columnId } = req.params;
      const { name } = req.body;
      if (!name) {
        throw new Error("Name is required");
      }
      if (!boardId) {
        throw new Error("boardId is required");
      }
      if (!columnId) {
        throw new Error("columnId is required");
      }

      const column = await Column.findOne({
        board: boardId,
        createdBy: req.user.id,
        _id: columnId,
      });

      if (!column) {
        throw new Error("column not valid");
      }

      column.name = name;
      const data = await column.save({ new: true });
      res.json(data);
    } catch (e) {
      res.status(403).send({ message: e?.message, isSuccess: false });
    }
  }
);

boardRouter.delete(
  "/board/:boardId/column/:columnId",
  validateUser,
  async (req, res) => {
    try {
      const { boardId, columnId } = req.params;
      if (!boardId) {
        throw new Error("boardId is required");
      }
      if (!columnId) {
        throw new Error("columnId is required");
      }

      const column = await Column.findOne({
        board: boardId,
        createdBy: req.user.id,
        _id: columnId,
      });

      if (!column) {
        throw new Error("column not valid");
      }

      const resp = await Column.deleteOne({
        board: boardId,
        createdBy: req.user.id,
        _id: columnId,
      });

      if (resp.deletedCount > 0) {
        res.json({ message: "Column deleted successfully" });
      } else {
        res.json({ message: "Column not deleted" });
      }
    } catch (e) {
      res.status(403).send({ message: e?.message, isSuccess: false });
    }
  }
);

module.exports = boardRouter;
