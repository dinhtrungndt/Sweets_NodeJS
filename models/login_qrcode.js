const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const loginQRCodeSchema = new Schema(
  {
    id: { type: ObjectId },
    iduser: { type: String },
    deviceid: { type: String }
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.login_qrcode || mongoose.model("login_qrcode", loginQRCodeSchema);
