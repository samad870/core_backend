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
const {
  addPost,
  allPost,
  deletePost,
  likePost,
  singlePost,
  repost,
} = require("./controllers/post-controller");

const { addComment } = require("./controllers/comment-controller");

const auth = require("./middleware/auth");

const router = express.Router();
// user model route
router.post("/register", register);
router.post("/login", login);
router.get("/user/:id", userDetails);
router.put("/follow/:id", auth, followUser);
router.put("/update", auth, updateProfile);
router.get("/me", auth, myInfo);
router.post("/logout", auth, logout);
router.get("/users/search/:query", auth, searchUser);

// post model route
router.post("/post", auth, addPost);
router.get("/post", auth, allPost);
router.delete("/delete/:id", auth, deletePost);
router.put("/like/:id", auth, likePost);
router.get("/single/:id", auth, singlePost);
router.put("/repost/:id", auth, repost);

// comment model route
router.post("/comment/:id", auth, addComment);  

module.exports = router;
