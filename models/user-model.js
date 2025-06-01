const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
    },
    profilePic: {
      type: String,
      default:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.shutterstock.com%2Fsearch%2Fdefault-user&psig=AOvVaw1e2s8IDS6qqGsJga4jaas5&ust=1747047571022000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIjZjcShm40DFQAAAAAdAAAAABAE",
    },
    public_id: {
      type: String,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    postId: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
    reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
