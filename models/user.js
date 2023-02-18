const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ethereumAddress: { type: String },
  ethereumBalance: { type: SchemaTypes.Double, default: 0 },
  jBonusClaimed: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);