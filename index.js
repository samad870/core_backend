const express = require("express");
var cookieParser = require('cookie-parser')
const router = require("./routes");
const dotenv = require("dotenv");
dotenv.config();
const connectDatabase = require("./config/database");
const app = express();
app.use(express.json());
app.use(cookieParser())
connectDatabase();
app.use("", router);
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`server connected on : ${port}`);
});
