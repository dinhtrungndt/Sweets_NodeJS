const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const reaction = new Schema(
  {
    id: { type: ObjectId },
    idUsers: { type: ObjectId, ref: "users" },
    idPosts: { type: Number , ref: "posts" },
    idComments: { type: ObjectId, ref: "comments" },
    type: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.reaction || mongoose.model("reaction", reaction);
