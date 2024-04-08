const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const media = new Schema(
  {
    id: { type: ObjectId },
    url: [{ type: String }],
    type: { type: String },
    idPosts: {  type: Number , ref: "posts" },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.media || mongoose.model("media", media);
