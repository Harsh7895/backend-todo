const express = require("express");
const mongoose = require("mongoose");
const { configDotenv } = require("dotenv");
const AuthRouter = require("./routes/auth.route");
const cors = requir("cors");

configDotenv();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
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

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
