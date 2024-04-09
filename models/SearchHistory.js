const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SearchHistory = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  searchText: { type: String }, 
  createdAt: { type: Date, default: Date.now }, 
},
{
  versionKey: false,
}
);

module.exports = mongoose.model("SearchHistory", SearchHistory);
