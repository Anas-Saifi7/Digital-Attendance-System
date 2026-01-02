// // controllers/notificationController.js
// import Notification from "../models/Notification.js";

// export const createNotification = async (req, res) => {
//   try {
//     const { userId, message, type } = req.body;

//     if (!userId || !message)
//       return res.status(400).json({ error: "userId and message required" });

//     const notif = await Notification.create({
//       userId,
//       message,
//       type: type || "info",
//     });

//     // Emit notification to that user's room
//     req.io.to(userId.toString()).emit("new_notification", notif);

//     res.json(notif);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getStudentNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({
//       userId: req.user.id,
//     }).sort({ createdAt: -1 });

//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


import Notification from "../models/Notification.js";

// CREATE
export const createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    if (!userId || !message)
      return res.status(400).json({ error: "userId and message required" });

    const notif = await Notification.create({
      userId,
      message,
      type: type || "info",
    });

    // real-time
    req.io.to(userId.toString()).emit("new_notification", notif);

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET STUDENT NOTIFICATIONS
export const getStudentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK ONE READ ✅
export const markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { unread: false },
      { new: true }
    );

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK ALL READ ✅
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, unread: true },
      { $set: { unread: false } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
