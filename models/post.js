const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const postSchema = new Schema(
  {
    id: { type: ObjectId }, // Khóa chính
    title: { type: String },
    image: { type: String },
    avatar: { type: String },
    time: { type: String },
    actionType: { type: String },
    userID: { type: ObjectId, ref: 'user' }, 
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.models.post || mongoose.model("post", postSchema);
