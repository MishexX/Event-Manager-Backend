const Event = require('../models/Event');
const Registration = require('../models/Registration');




exports.createRegistration = async (req, res) => {
    try {
      const { userEmail, eventName} = req.body;

//  check if registatrion already available for the user 
      const existingRegistration = await Registration.findOne({ userEmail, eventName });

      if (existingRegistration) {
        return res.status(400).json({ message: 'You are already registered for this event.' });
      }

      //  check if registatrion already available for the user 
  
      // Fetch the event to get the image path
      const event = await Event.findOne({ eventName});
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      const registration = new Registration({
        userEmail,
        eventName : event.eventName,
        time : event.time,
        location : event.location,
        image: event.image,
        admin : event.admin,
        date : event.date
      });
  
      await registration.save();
       

      event.registeredUsers += 1;
      await event.save();


      res.status(201).json(registration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// Get all registrations for a specific user email
exports.getRegistrationsByEmail = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const registrations = await Registration.find({ userEmail });
    res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};
