const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const cookie = require("cookie");

exports.signIn = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res
        .status(400)
        .json({ message: "userName email and password are required" });
    }
    const userExist = await User.findOne({email});
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
    });
    res.status(201).json({message:`user sign sucessfully Hello ${result?.userName}`});
  } catch (error) {
    res.status(400).json({ message: "error in signIn", error: error.message });
  }
};
