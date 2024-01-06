const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const relationSSchema = new Schema(
  {
    id: { type: ObjectId }, 
    name: { type: String },
    userId1: [{ type: ObjectId, ref: "user" }],
    userId2: [{ type: ObjectId , ref: "user"}],
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.models.relationSSchema || mongoose.model("relationSSchema", relationSSchema);
