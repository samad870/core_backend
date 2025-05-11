const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDatabase = require("./config/database");
const app = express();
connectDatabase();
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("server");
});

app.listen(port, () => {
  console.log(`server connected on : ${port}`);
});
