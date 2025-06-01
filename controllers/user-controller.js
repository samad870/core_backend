const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const cookie = require("cookie");
const cloudinary = require("../config/cloudinary");
const formidable = require("formidable");
// const userModel = require("../models/user-model");

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
    res.cookie("token", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
      sameSite: "none",
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

    const userExist = await User.findOne({ email });
    // console.log("userExist", userExist);
    if (!userExist) {
      return res.status(400).json({ message: "Please register account" });
    }

    const PasswordMatch = await bcrypt.compare(password, userExist.password);
    // console.log("PasswordMatch", PasswordMatch);

    if (!PasswordMatch) {
      return res.status(400).json({ message: "Enter correct password" });
    }

    const accessToken = jwt.sign(
      { token: userExist._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    if (!accessToken) {
      return res.status(400).json({ message: "Token not Generated in login" });
    }
    //  console.log("logintoken>>>",loginToken)
    res.cookie("token", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
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
      .populate("followers") // populate matlb ki bulana
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
    // console.log("id>>>>>>>>>>>", id);
    if (!id) {
      return res.status(400).json({ message: "Id is Required" });
    }
    const userExist = await User.findById(id); // find krre samne wale user ko
    if (!userExist) {
      return res.status(400).json({ message: "User Don`t Exist" });
    }
    if (userExist.followers.includes(req.user._id)) {
      // khud ko samne wale k{User}. follower mein check kar rhe hai

      await User.findByIdAndUpdate(
        userExist._id,
        {
          $pull: { followers: req.user._id }, // unfollow krr rhe hai || pull matlb nikalna
        },
        { new: true }
      );
      return res
        .status(201)
        .json({ message: `unfollowed ${userExist.userName}` });
    }

    await User.findByIdAndUpdate(
      userExist._id,
      {
        $push: { followers: req.user._id }, // follow kar rhe hai || push matlb add krna
      },
      { new: true }
    );
    res.status(201).json({ message: `followed ${userExist.userName}` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in followUser", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userExist = await User.findById(req.user._id);
    if (!userExist) {
      return res
        .status(500)
        .json({ message: "User not Exist", error: error.message });
    }
    const form = formidable({});
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "error in formidable", err: err });
      }
      if (fields.text) {
        await User.findByIdAndUpdate(
          req.user._id,
          { bio: fields.text },
          { new: true }
        );
      }
      if (files.media) {
        if (userExist.public_id) {
          await cloudinary.uploader.destroy(
            userExist.public_id,
            (error, result) => {
              console.log(error, result);
            }
          );
        }
        const uploadedImage = await cloudinary.uploader.upload(
          files.media.filepath,
          { folder: "insta_clone/Profile" }
        );
        if (!uploadedImage) {
          res.status(500).json({ message: "Error while Uploaded Image" });
        }
        await User.findByIdAndUpdate(
          req.user._id,
          {
            profilePic: uploadedImage.secure_url,
            public_id: uploadedImage.public_id,
          },
          { new: true }
        );
      }
    });
    res.status(201).json({ message: "profile Upload successfull" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in Update Profile", error: error.message });
  }
};

exports.myInfo = async (req, res) => {
  try {
    res.status(200).json({ me: req.user });
  } catch (error) {
    res.status(500).json({ message: "Error in My Info", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
    });
    res.status(200).json({ message: "You Logged Out" });
  } catch (error) {
    res.status(500).json({ message: "Error in Logout", error: error.message });
  }
};

exports.searchUser = async (req, res) => {
  try {
    const { query } = req.params;
    const users = await User.find({
      $or: [
        { userName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });
    res.status(200).json({ message: "search users", users });
  } catch (error) {
    res.status(500).json({ message: "Error in search", error: error.message });
  }
};
