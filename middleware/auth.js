const User = require("../models/user-model");
const jwt = require("jsonwebtoken");

exports.auth =  (req, res, next) => {
  console.log(req.cookies.token)
  try {
    const token = req.cookies.token;
    // console.log("cookies?????????", req.cookies);

    if (!token) {
      return res.status(400).json({ message: "No Token provide" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Invalid token
      }});
    console.log("decoded>>>>>>>>>>>>>>>>>>>>", decodedToken);

    if (!decodedToken) {
      return res
        .status(400)
        .json({
          message: "error while decoding in auth",
          error: error.message,
        });
    }
    const user = await User.findById(decodedToken.token).populate("followers")
    .populate("postId")
    .populate("replies")
    .populate("reposts");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Error in auth", error: error.message });
  }
};
