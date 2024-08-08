const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  date: { type: Date, },
  eventName: { type: String,  },
  time: { type: String,  },
  location: { type: String,  },
  image: { type: String, },
  registeredUsers: { type: Number,  },
  admin : {type:String}
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
