const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const cookie = require("cookie");

exports.register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res
        .status(400)
        .json({ message: "userName email and password are required" });
    }
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "You Already Have An Account" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    if (!hashPassword) {
      return res.status(400).json({ message: "error in password hashing" });
    }
    const user = new User({
      userName,
      email,
      password: hashPassword,
    });

    const result = await user.save();
    if (!result) {
      return res.status(400).json({ message: "error while serving user" });
    }

    const accessToken = jwt.sign(
      { token: result._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    if (!accessToken) {
      return res.status(400).json({ message: "error while generating token" });
    }
    res.cookie("token_register", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
    });
    res
      .status(201)
      .json({ message: `user sign sucessfully Hello ${result?.userName}` });
  } catch (error) {
    res.status(400).json({ message: "error in signIn", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const userExist = await User.findOne({ email }).select("+password");
    if (!userExist) {
      return res.status(400).json({ message: "Please register account" });
    }

    const PasswordValid = await bcrypt.compare(password, userExist.password);
    if (!PasswordValid) {
      return res.status(400).json({ message: "Enter correct password" });
    }

    const loginToken = jwt.sign(
      { userId: userExist._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("token_login", loginToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
    });

    res
      .status(200)
      .json({ message: `User login successfully. Hello ${userExist?.email}` });
  } catch (error) {
    res.status(500).json({ message: "Error in Login", error: error.message });
  }
};

// samne wale user ki detail sari password ko chodkar
exports.userDetails = async (req, res) => {
  try {
    const { id } = req.params; //  id utha li user ki search krke
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }
    const user = await User.findById(id) // all detail samne wala user bas paaswar ni uth rhe hum
      .select("-password")
      .populate("followers")
      .populate({
        path: "postId",
        populate: [{ path: "likes" }, { path: "comments" }, { path: "admin" }], // post ki nesting
      })
      .populate({
        path: "reposts",
        populate: [{ path: "likes" }, { path: "comments" }, { path: "admin" }],
      })
      .populate({ path: "replies", populate: { path: "admin" } });
    res.status(200).json({ message: "user details fetch", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in userDetails", error: error.message });
  }
};

// samne wale user k follower and following mein khud ko check kr rhe hai
exports.followUser = async (req, res) => {
  try {
    const { id } = req.params; // search
    if (!id) {
      return res.status(400).json({ message: "Id is Required" });
    }
    const userExist = await User.findById(id); // find krre samne wale user ko
    if (!userExist) {
      return res.status(400).json({ message: "User Don`t Exist" });
    }
    if (userExist.followers.includes(req.user._id)) // khud ko samne wale k{User}. follower mein check kar rhe hai  
      
      {
      await User.findByIdAndUpdate(
        userExist._id,
        {
          $pull: { followers: req.user._id }, // unfollow krr rhe hai || pull matlb nikalna
        },
        { new: true }
      );
      res.status(201).json({ message: `unfollowed ${userExist.userName}` });
    }

    await User.findByIdAndUpdate(
      userExist._id,
      {
        $push: { followers: req.user._id }, // follow kar rhe hai || push matlb add krna
      },
      { new: true }
    );
    res.status(201).json({ message: `following ${userExist.userName}` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in followUser", error: error.message });
  }
};
