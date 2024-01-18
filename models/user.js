const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const friendRequestSchema = new Schema({
  sender: { type: ObjectId, ref: 'user' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
});

const postSchema = new Schema(
  {
    id: { type: ObjectId },
    avatar: { type: String },
    name: { type: String },
    time: { type: String },
    content: { type: String },
    image: [{ type: String }],
    likedBy: [{ type: ObjectId, ref: 'user' }], 
    comments: [{ type: ObjectId}], 
 
  },
  {
    versionKey: false,
  }
);


const storySchema = new Schema({
  id: { type: ObjectId },
  title: { type: String },
  file: { type: String },
},
{
  versionKey: false,
});

const userSchema = new Schema({
  id: { type: ObjectId },
  name: { type: String },
  email: { type: String },
  password: { type: String },
  gioitinh: { type: String },
  ngaysinh: { type: String },
  avatar: { type: String },
  anhbia: { type: String },
  posts: [postSchema],
  stories: [storySchema],
  friends: [{ type: ObjectId, ref: 'user' }],
  friendRequests: [friendRequestSchema], // Mảng lưu trữ lời mời kết bạn
},
{
  versionKey: false,
});

// Đổi tên model từ "login" thành "user"
module.exports = mongoose.models.user || mongoose.model("user", userSchema);
