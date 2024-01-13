const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const commentSchema = new Schema({
  user: { type: ObjectId, ref: 'user' },
  content: { type: String },
  replies: [
    {
      user: { type: ObjectId, ref: 'user' },
      content: { type: String },
    },
  ],
})

const postSchema = new Schema(
  {
    id: { type: ObjectId },
    avatar: { type: String },
    name: { type: String },
    time: { type: String },
    content: { type: String },
    image: [{ type: String }],
    likedBy: [{ type: ObjectId, ref: 'user' }], 
    comments: [commentSchema],
  },
  {
    versionKey: false,
  }
);

const storySchema = new Schema(
  {
    id: { type: ObjectId }, // Khóa chính
    title: { type: String },
    file: { type: String },
  },
  {
    versionKey: false,
  }
);

const userSchema = new Schema(
  {
    id: { type: ObjectId },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    gioitinh: { type: String },
    ngaysinh: { type: String },
    avatar: { type: String },
    anhbia: { type: String },
    posts: [postSchema],
    stories: [storySchema], // Mảng story
    friends: [{ type: ObjectId, ref: 'user' }], // Mảng friends với kiểu ObjectId và tham chiếu đến model 'user'
  },
  {
    versionKey: false,
  }
);

// Đổi tên model từ "login" thành "user"
module.exports = mongoose.models.user || mongoose.model("user", userSchema);
