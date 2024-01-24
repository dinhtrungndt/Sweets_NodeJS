const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const friend = new Schema(
  {
    id: { type: ObjectId },
    idUser1: { type: ObjectId, ref: "users" },
    idUser2: { type: ObjectId, ref: "users" },
    time: { type: String },
    status: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.friend || mongoose.model("friend", friend);
