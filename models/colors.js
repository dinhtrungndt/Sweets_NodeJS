const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const colors = new Schema(
  {
    id: { type: ObjectId },
    idUsers: { type: ObjectId, ref: "users" },
    idPosts: { type: Number, ref: "posts" },
    colors: {type: String}
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.colors || mongoose.model("colors", colors);
