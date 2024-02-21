const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const settinguserSchema = new Schema(
  {
    id: { type: ObjectId }, // Khóa chính
    title: { type: String },
    icon: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.models.settinguser || mongoose.model("settinguser", settinguserSchema);
