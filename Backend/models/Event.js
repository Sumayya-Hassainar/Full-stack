const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const STATUS = {
  BUSY: 'BUSY',
  SWAPPABLE: 'SWAPPABLE',
  SWAP_PENDING: 'SWAP_PENDING'
};

const eventSchema = new Schema({
  title: { type: String, required:true },
  startTime: { type: Date, required:true },
  endTime: { type: Date, required:true },
  status: { type: String, enum: Object.values(STATUS), default: STATUS.BUSY },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required:true },
  // optional: original metadata
}, { timestamps: true });

module.exports = {
  Event: mongoose.model('Event', eventSchema),
  STATUS
};
