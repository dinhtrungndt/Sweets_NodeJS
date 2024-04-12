const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const friend = new Schema(
  {
    id: { type: ObjectId },
    idFriendSender: { type: ObjectId, ref: "users" },
    idFriendReceiver: { type: ObjectId, ref: "users" },
    time: { type: Date, default: Date.now },
    status: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.friend || mongoose.model("friend", friend);
