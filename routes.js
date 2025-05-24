const express = require("express");
const {
  register,
  login,
  userDetails,
  followUser,
} = require("./controllers/user-controller");
const {auth}= require("./middleware/auth");

const router = express.Router();

router.post("/api/register", register);
router.post("/api/login", login);
router.get("/api/user/:id", userDetails);
const testing = async (req, res) => {
  res.status(200).json({message:"access"});
};
router.get("/api/demo", auth, testing);
router.put("/api/followuser/:id", followUser);



module.exports = router;
