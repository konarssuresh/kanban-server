const express = require("express");
const { validateUser } = require("../middleware/auth");
const { Board } = require("../models/board");
const { Column } = require("../models/column");
const { Task } = require("../models/task");
const { validateAddBoardRequest } = require("../utils/utils");
const boardRouter = express.Router();

const findBoard = async (queryObj) =>
  Board.find(queryObj).populate({
    path: "columns",
    options: { sort: { position: 1 } }, // optional: order columns
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

    res.status(201).json(storedBoard);
  } catch (e) {
    res.status(403).send({ message: e?.message, isSuccess: false });
  }
});

boardRouter.post("/board/:boardId/column", validateUser, async (req, res) => {
  try {
    const { boardId } = req.params;
  } catch (e) {
    res.status(403).send({ message: e?.message, isSuccess: false });
  }
});

module.exports = boardRouter;
