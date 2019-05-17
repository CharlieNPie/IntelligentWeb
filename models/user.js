const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  _id: String,
  username: String,
  email: String,
  password: String,
  avatar: String,
  rank: String
});
userSchema.methods.validPassword = function( pwd ) {
  return ( this.password === pwd );
};

module.exports = mongoose.model("UserObject", userSchema);