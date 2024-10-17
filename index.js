const express = require("express");
const mongoose = require("mongoose");
const { configDotenv } = require("dotenv");

configDotenv();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
  res.end();
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
