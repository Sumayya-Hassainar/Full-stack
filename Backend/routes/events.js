const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Event, STATUS } = require('../models/Event');

// Create event
router.post('/', auth, async (req,res) => {
  const { title, startTime, endTime, status } = req.body;
  if(!title || !startTime || !endTime) return res.status(400).json({ message: 'Missing fields' });
  try {
    const ev = new Event({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: status || STATUS.BUSY,
      owner: req.user.id
    });
    await ev.save();
    res.json(ev);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events for current user
router.get('/', auth, async (req,res) => {
  try {
    const events = await Event.find({ owner: req.user.id }).sort({ startTime: 1 });
    res.json(events);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (including changing status)
router.put('/:id', auth, async (req,res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if(!ev) return res.status(404).json({ message: 'Not found' });
    if(ev.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not owner' });
    const up = ['title','startTime','endTime','status'].reduce((acc, k) => {
      if(req.body[k] !== undefined) acc[k] = req.body[k];
      return acc;
    }, {});
    if(up.startTime) up.startTime = new Date(up.startTime);
    if(up.endTime) up.endTime = new Date(up.endTime);
    Object.assign(ev, up);
    await ev.save();
    res.json(ev);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req,res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if(!ev) return res.status(404).json({ message: 'Not found' });
    if(ev.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not owner' });
    await ev.deleteOne();
    res.json({ message: 'Deleted' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
