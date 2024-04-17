const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const birthday = new Schema(
  {
    id: { type: ObjectId },
    idSender: { type: ObjectId, ref: "users" },
    idReceiver: { type: ObjectId, ref: "users" },
    time: { type: Date, default: Date.now },
    content: { type: String },
    image: { type: String, default: null},
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.birthday || mongoose.model("birthday", birthday);
