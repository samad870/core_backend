const express = require("express");
const router = require("./routes")
const dotenv = require("dotenv");
dotenv.config();
const connectDatabase = require("./config/database");
const app = express();  
app.use(express.json());
connectDatabase();
app.use("", router)
const port = process.env.PORT;



app.listen(port, () => {
  console.log(`server connected on : ${port}`);
});
