const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
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
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

columnSchema.index({ board: 1, position: 1 });

// virtual to populate tasks for a column
columnSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "column",
  justOne: false,
});

// cascade delete tasks when column is removed
columnSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await mongoose.model("Task").deleteMany({ column: this._id });
      next();
    } catch (err) {
      next(err);
    }
  }
);

const Column = mongoose.model("Column", columnSchema, "Column");

module.exports = { Column };
