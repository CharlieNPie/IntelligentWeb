const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  author: String,
  text: String,
  avatar: String,
  date: String
});

module.exports = mongoose.model("CommentObject", commentSchema);