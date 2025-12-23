const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDb } = require("./config/database");
const path = require("path");
const dotenv = require("dotenv");

const authRouter = require("./routes/authRouter");
const boardRouter = require("./routes/boardRouter");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", boardRouter);

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
