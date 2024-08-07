// routes/events.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Create a new event
router.post('/events', eventController.createEvent);

// Edit an event
router.put('/events/:id', eventController.editEvent);

// Delete an event
router.delete('/events/:id', eventController.deleteEvent);

// Get all events (current and future)
router.get('/events', eventController.getAllEvents);

// Get events by name (current and future)
// router.get('/events/search/:name', eventController.getEventsByName);


router.get('/events/:adminEmail', eventController.getEventsByAdmin);

router.get('/events/search/:search', eventController.searchEvents);

// router.get('/events', eventController.getEventsByDateOrRange);
router.post('/events/fordate', eventController.getEventsByDateOrRange);


router.put('/events/:id', eventController.editEvent);
router.delete('/events/:id', eventController.deleteEvent);

module.exports = router;
