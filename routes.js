const express = require("express");
const {
  register,
  login,
  userDetails,
  followUser,
  updateProfile,
  myInfo,
  logout,
  searchUser,
} = require("./controllers/user-controller");
const auth = require("./middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user/:id", userDetails);
router.put("/follow/:id", auth, followUser);
router.put("/update", auth, updateProfile);
router.get("/me", auth, myInfo);
router.post("/logout", auth, logout);
router.get("/users/search/:query", auth, searchUser);

module.exports = router;
