const Post = require("../models/post-model");
const User = require("../models/user-model");
const Comment = require("../models/comment-model");
const mongoose = require("mongoose");

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!id) {
      return res.status(400).json({ msg: "id is required" });
    }
    if (!text) {
      return res.status(400).json({ msg: "no comment is added" });
    }
    const postExist = await Post.findById(id);
    if (!postExist) {
      return res.status(400).json({ msg: "no such post" });
    }
    const comment = new Comment({
      text,
      admin: req.user._id,
      post: postExist._id,
    });
    const newComment = await comment.save();
    await Post.findByIdAndUpdate(
      id,
      { $push: { comments: newComment._id } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { replies: newComment._id } },
      { new: true }
    );
    res.status(201).json({ msg: "commented" });
  } catch (error) {
    res.status(400).json({ msg: "Error in Add Comment", error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { postId, id } = req.params;
    if (!postId || !id) {
      return res.status(400).json({ msg: "postId and commentId is required" });
    }
    const postExist = await Post.findById(postId);
    if (!postExist) {
      return res.status(400).json({ msg: "No such post" });
    }
    const commentExist = await Comment.findById(id);
    if (!commentExist) {
      return res.status(400).json({ msg: "No such comment" });
    }
    const newId = new mongoose.Types.ObjectId(id);
    if (postExist.comments.includes(newId)) {
      const user1 = commentExist.admin._id.toString();
      const user2 = req.user._id.toString();
      if (user1 !== user2) {
        return res
          .status(400)
          .json({ msg: "you are not allowed to delete this comment" });
      }
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { comments: id },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.user._id,
        { 
          $pull: { replies: id },
        },
        { new: true }
      );
      await Comment.findByIdAndDelete(id);
      return res.status(400).json({ msg: "Comment Delete" });
    }
    res.status(200).json({ msg: "this post does not include the comment" });
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Error in deleteComment", error: error.message });
  }
};
