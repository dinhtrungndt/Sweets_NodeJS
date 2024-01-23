const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const message = new Schema(
  {
    id: { type: ObjectId },
    idSender: { type: ObjectId, ref: "users" },
    idReceiver: { type: ObjectId, ref: "users" },
    content: { type: String },
    status: { type: String },
    time: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.message || mongoose.model("message", message);
