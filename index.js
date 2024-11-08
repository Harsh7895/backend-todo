const express = require("express");
const mongoose = require("mongoose");
const { configDotenv } = require("dotenv");
const AuthRouter = require("./routes/auth.route");
const TaskRouter = require("./routes/task.route");
const UserRouter = require("./routes/user.route");
const cors = require("cors");

configDotenv();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://frontend-todo-nu.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello world");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDb is connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/task", TaskRouter);
app.use("/api/v1/user", UserRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
