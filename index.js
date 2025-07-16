const express = require("express");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();
const app = express();
connectDatabase();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server connected on : ${port}`);
});
