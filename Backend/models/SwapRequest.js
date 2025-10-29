const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
};

const swapRequestSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required:true }, // who initiated the swap
  responder: { type: Schema.Types.ObjectId, ref: 'User', required:true }, // owner of desired slot
  mySlot: { type: Schema.Types.ObjectId, ref: 'Event', required:true },
  theirSlot: { type: Schema.Types.ObjectId, ref: 'Event', required:true },
  status: { type: String, enum: Object.values(STATUS), default: STATUS.PENDING }
}, { timestamps: true });

module.exports = {
  SwapRequest: mongoose.model('SwapRequest', swapRequestSchema),
  STATUS
};
