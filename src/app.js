const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDb } = require("./config/database");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const authRouter = require("./routes/authRouter");
const boardRouter = require("./routes/boardRouter");
const taskRouter = require("./routes/taskRouter");
const { loadOpenApiSpec } = require("./api/openapi");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((u) => u.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy: Origin not allowed"), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(loadOpenApiSpec()));

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
