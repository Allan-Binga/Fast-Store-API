const Notification = require("../models/notification");

// Activity notifications must not turn successful authentication into an error.
async function notifyUser(userId, message, type) {
  try { await Notification.create({ userId, message, type }); }
  catch { console.error("Activity notification could not be saved."); }
}
module.exports = { notifyUser };
