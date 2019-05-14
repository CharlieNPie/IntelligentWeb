const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  date: Date,
  description: String,
  image: String,
  location: String,
  name: String,
  organiser: String,
  posts: Array
});

module.exports = mongoose.model("Event", eventSchema);
