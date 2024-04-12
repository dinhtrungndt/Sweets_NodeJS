const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const location = new Schema(
  {
    id: { type: ObjectId },
    idUsers: { type: ObjectId, ref: "users" },
    idPosts: { type: Number, ref: "posts" },
    location: {type: String}
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.location || mongoose.model("location", location);
