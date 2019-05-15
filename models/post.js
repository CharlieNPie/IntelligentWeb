const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  author: String,
  avatar: String,
  comments: Array,
  date: Date,
  image: String,
  location: String,
  text: String
});

module.exports = mongoose.model("PostObject", postSchema);