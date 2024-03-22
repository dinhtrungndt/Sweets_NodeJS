const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const reaction = new Schema(
  {
    id: { type: ObjectId },
    idUsers: { type: ObjectId, ref: "users" },
    idPosts: { type: Number, required: true, unique: true , ref: "posts" },
    type: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.reaction || mongoose.model("reaction", reaction);
