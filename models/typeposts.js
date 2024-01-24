const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const typePosts = new Schema(
  {
    id: { type: ObjectId },
    name: { type: String, required: true},
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.typePosts || mongoose.model("typePosts", typePosts);
