const Post = require("../models/post-model");
const User = require("../models/user-model");
const Comment = require("../models/comment-model");

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
    const postExist = await Post.findById(id)
    if(!postExist){
      return res.status(400).json({ msg: "no such post" });
    }
    const comment = new Comment({
        text,
        admin:req.user._id,
        post:postExist._id
    })
    const newComment = await comment.save()
    await Post.findByIdAndUpdate(
     id,
     {$push:{comments:newComment._id}},   
     {new:true}
    )
    await User.findByIdAndUpdate(
     req.user._id,
     {$push:{replies:newComment._id}},   
     {new:true}
    )
    res.status(201).json({ msg: "commented" });

  } catch (error) {
    res.status(400).json({ msg: "Error in Add Comment", error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Error in deleteComment", error: error.message });
  }
};
