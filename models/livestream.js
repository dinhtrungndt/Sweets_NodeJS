const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const livestreamSchema = new Schema(
  {
    id: { type: ObjectId },
    liveid: { type: ObjectId, ref: "users" },
    username: { type: String },
    avatar: { type: String }
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.models.livestream || mongoose.model("livestream", livestreamSchema);
