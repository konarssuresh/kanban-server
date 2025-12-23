const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 100,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual to populate columns: Board.find().populate('columns')
boardSchema.virtual("columns", {
  ref: "Column",
  localField: "_id",
  foreignField: "board",
  justOne: false,
});

// cascade delete columns when a board document is deleted
boardSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await mongoose.model("Column").deleteMany({ board: this._id });
      next();
    } catch (err) {
      next(err);
    }
  }
);

const Board = mongoose.model("Board", boardSchema, "Board");

module.exports = { Board };
