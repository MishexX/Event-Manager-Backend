// controllers/eventController.js
const Event = require('../models/Event');

// Create a new event
// const Event = require('../models/Event');
const path = require('path');

const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create a new event
// exports.createEvent = async (req, res) => {
//     try {
//       console.log('Request Body:', req.body);
//       console.log('Request Files:', req.files);
  
//       const { date, eventName, time, location } = req.body;
  
//       if (!req.files || !req.files.eventImage) {
//         return res.status(400).json({ error: 'Image is required' });
//       }
  
//       const eventImage = req.files.eventImage;
//       const imagePath = path.join(uploadDir, eventImage.name);
  
//       eventImage.mv(imagePath, async (err) => {
//         if (err) {
//           console.error('Failed to upload image:', err);
//           return res.status(500).json({ error: 'Failed to upload image' });
//         }
  
//         const event = new Event({
//           date,
//           eventName,
//           time,
//           location,
//           image: `/uploads/${eventImage.name}`,
//           registeredUsers: 0
//         });
  
//         await event.save();
//         res.status(201).json(event);
//       });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   };

exports.createEvent = async (req, res) => {
    try {
      console.log('Request Body:', req.body);
      console.log('Request Files:', req.files);
  
      // const { date: dateString, eventName, time, location, admin } = req.body;
      const { date ,  eventName, time, location, admin } = req.body;
  
      if (!req.files || !req.files.eventImage) {
        return res.status(400).json({ error: 'Image is required' });
      }
  
      // Convert date string to Date object
      // const [day, month, year] = dateString.split('.');
      // const date = new Date(`${year}-${month}-${day}`); // format as YYYY-MM-DD
  
      // if (isNaN(date.getTime())) {
      //   return res.status(400).json({ error: 'Invalid date format' });
      // }
  
      const eventImage = req.files.eventImage;
      const imagePath = path.join(uploadDir, eventImage.name);
  
      eventImage.mv(imagePath, async (err) => {
        if (err) {
          console.error('Failed to upload image:', err);
          return res.status(500).json({ error: 'Failed to upload image' });
        }
  
        const event = new Event({
          date,
          eventName,
          time,
          location,
          image: `/uploads/${eventImage.name}`,
          registeredUsers: 0,
          admin
        });
  
        await event.save();
        res.status(201).json(event);
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


// Edit an event
exports.editEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updates = req.body;
    const event = await Event.findByIdAndUpdate(eventId, updates, { new: true });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all events (current and future)
exports.getAllEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({ date: { $gte: currentDate } }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get events by name (current and future)
exports.getEventsByName = async (req, res) => {
  try {
    const currentDate = new Date();
    const eventName = req.params.name;
    const events = await Event.find({
      date: { $gte: currentDate },
      eventName: new RegExp(eventName, 'i')
    }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




// get all the events of admin 
exports.getEventsByAdmin = async (req, res) => {
    const { adminEmail } = req.params; // Assuming the admin email is passed as a URL parameter
  
    try {
      // Get today's date at midnight to filter events from today onwards
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to start of the day
  
      // Find events based on admin email and date filter
      const events = await Event.find({
        admin: adminEmail,
        date: { $gte: today }
      });
  
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  };
// get all the events of admin ends



// search events based on keyword 
exports.searchEvents = async (req, res) => {
  console.log("hi hello");
  try {
      // const query = req.query.query || '';
      const query = req.params.search || '';
      console.log("hello");

      console.log('Search Query:', query); // Log the query

      // Search for events where the eventName includes the query string
      const events = await Event.find({
          eventName: { $regex: query, $options: 'i' } // Case-insensitive search
      });

      res.status(200).json({ events });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};



// Get events for a specific date or date range
exports.getEventsByDateOrRange = async (req, res) => {
  const { date, start, end } = req.body;

  // console.log('Received request body:', req.body);
  // console.log("hello");
  try {
    let events;
    if (date) {
      // Single date filter
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1); // End of the day
      console.log('Fetching events with:', { startDate, endDate });
      events = await Event.find({
        date: { $gte: startDate, $lt: endDate }
      });
    } else if (start && end) {
      // Date range filter
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setDate(endDate.getDate() + 1); // End of the day
      console.log('Fetching events with:', { startDate, endDate });
      events = await Event.find({
        date: { $gte: startDate, $lt: endDate }
      });
    } else {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error });
  }
};



// search events for date or range ends 









// edit event data 
exports.editEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { eventName } = req.body; 

    
    const event = await Event.findByIdAndUpdate(eventId, { eventName }, { new: true });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// edit event data 



// delete event 
// controllers/eventController.js
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete event 