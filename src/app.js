const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDb } = require("./config/database");
const path = require("path");
const dotenv = require("dotenv");

const authRouter = require("./routes/authRouter");
const boardRouter = require("./routes/boardRouter");
const taskRouter = require("./routes/taskRouter");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", boardRouter);
app.use("/", taskRouter);

connectDb()
  .then(() => {
    app.listen(process.env.PORT, (err) => {
      if (!err) {
        console.log("app listening on port " + process.env.PORT);
      } else {
        console.log(err);
      }
    });
  })
  .catch((e) => {
    console.log(e);
    console.log("connection to db failed");
  });
