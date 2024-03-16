const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const iduser = new Schema(
    {
        id: { type: ObjectId },
        iduser: { type: ObjectId, ref: "users" }
    },
    {
        versionKey: false,
    }
);

const listchat = new Schema(
    {
        id: { type: ObjectId },

        idsender: { type: ObjectId, ref: "users" },
        iduser: [iduser]
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.models.listchat || mongoose.model("listchat", listchat);
