const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const notifications = new Schema(
    {
      id: { type: ObjectId },
      recipient: { type: ObjectId, ref: "users" }, 
      sender: { type: ObjectId, ref: "users" },
      type: { type: String },
      content: { type: String },
      createdAt: { type: Date, default: Date.now }, 
      read: { type: Boolean, default: false }, 
      link: { type: String }, 
    },
    {
      versionKey: false,
    }
  );
  

module.exports =
  mongoose.models.notifications || mongoose.model("notifications", notifications);
