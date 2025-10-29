const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Event, STATUS } = require('../models/Event');
const { SwapRequest, STATUS: SWAP_STATUS } = require('../models/SwapRequest');
const mongoose = require('mongoose');

/**
 * GET /api/swappable-slots
 * returns all SWAPPABLE events from other users
 */
router.get('/swappable-slots', auth, async (req, res) => {
  try {
    const slots = await Event.find({ status: STATUS.SWAPPABLE, owner: { $ne: req.user.id } }).populate('owner', 'name email');
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/swap-request
 * body: { mySlotId, theirSlotId }
 * Creates a swap request, sets both slots to SWAP_PENDING
 */
router.post('/swap-request', auth, async (req,res) => {
  const { mySlotId, theirSlotId } = req.body;
  if(!mySlotId || !theirSlotId) return res.status(400).json({ message: 'Missing slot ids' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // load slots with locks (using session)
    const mySlot = await Event.findById(mySlotId).session(session);
    const theirSlot = await Event.findById(theirSlotId).session(session);
    if(!mySlot || !theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'One of the slots not found' });
    }
    // verify ownership and status
    if(mySlot.owner.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'You do not own mySlotId' });
    }
    if(mySlot.status !== STATUS.SWAPPABLE || theirSlot.status !== STATUS.SWAPPABLE) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Both slots must be SWAPPABLE' });
    }

    // Create request
    const swap = new SwapRequest({
      requester: req.user.id,
      responder: theirSlot.owner,
      mySlot: mySlot._id,
      theirSlot: theirSlot._id,
      status: SWAP_STATUS.PENDING
    });
    await swap.save({ session });

    // set both events to SWAP_PENDING
    mySlot.status = STATUS.SWAP_PENDING;
    theirSlot.status = STATUS.SWAP_PENDING;
    await mySlot.save({ session });
    await theirSlot.save({ session });

    await session.commitTransaction();
    session.endSession();
    const populated = await SwapRequest.findById(swap._id)
      .populate('mySlot').populate('theirSlot').populate('requester','name email').populate('responder','name email');
    res.json(populated);
  } catch(err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/swap-response/:requestId
 * body: { accept: true/false }
 * Only responder can accept/reject.
 */
router.post('/swap-response/:requestId', auth, async (req,res) => {
  const { requestId } = req.params;
  const { accept } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const swap = await SwapRequest.findById(requestId).session(session);
    if(!swap) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Swap request not found' });
    }
    if(swap.responder.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'You are not authorized to respond' });
    }
    if(swap.status !== SWAP_STATUS.PENDING) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Swap already resolved' });
    }

    // fetch events
    const mySlot = await Event.findById(swap.mySlot).session(session);
    const theirSlot = await Event.findById(swap.theirSlot).session(session);
    if(!mySlot || !theirSlot) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Event(s) not found' });
    }

    if(accept) {
      // verify both are still SWAP_PENDING (to avoid races)
      if(mySlot.status !== STATUS.SWAP_PENDING || theirSlot.status !== STATUS.SWAP_PENDING) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Slots no longer pending' });
      }

      // swap owners
      const tmpOwner = mySlot.owner;
      mySlot.owner = theirSlot.owner;
      theirSlot.owner = tmpOwner;

      // after swap, set both events to BUSY
      mySlot.status = STATUS.BUSY;
      theirSlot.status = STATUS.BUSY;

      swap.status = SWAP_STATUS.ACCEPTED;
      await mySlot.save({ session });
      await theirSlot.save({ session });
      await swap.save({ session });

      await session.commitTransaction();
      session.endSession();

      const populated = await SwapRequest.findById(swap._id).populate('mySlot').populate('theirSlot').populate('requester','name email').populate('responder','name email');
      return res.json(populated);
    } else {
      // Rejected: set both events back to SWAPPABLE and mark swap rejected
      mySlot.status = STATUS.SWAPPABLE;
      theirSlot.status = STATUS.SWAPPABLE;
      swap.status = SWAP_STATUS.REJECTED;
      await mySlot.save({ session });
      await theirSlot.save({ session });
      await swap.save({ session });

      await session.commitTransaction();
      session.endSession();

      const populated = await SwapRequest.findById(swap._id).populate('mySlot').populate('theirSlot').populate('requester','name email').populate('responder','name email');
      return res.json(populated);
    }
  } catch(err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/requests
 * Returns both incoming and outgoing requests for the logged in user.
 */
router.get('/requests', auth, async (req,res) => {
  try {
    const incoming = await SwapRequest.find({ responder: req.user.id }).populate('mySlot theirSlot requester responder');
    const outgoing = await SwapRequest.find({ requester: req.user.id }).populate('mySlot theirSlot requester responder');
    res.json({ incoming, outgoing });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
