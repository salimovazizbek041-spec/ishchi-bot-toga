const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Xabar yuborish
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Xabar matni va qabul qiluvchi kiritilishi shart' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Qabul qiluvchi topilmadi' });
    }

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      content: content.trim()
    });
    
    await message.save();

    // Populate sender info
    await message.populate('sender', 'name phone role profession avatar');

    res.status(201).json({
      success: true,
      message: 'Xabar yuborildi',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Xabar yuborishda xatolik' });
  }
});

// Bitta foydalanuvchi bilan xabarlashuv tarixi
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.userId }
      ]
    })
    .populate('sender', 'name phone role profession avatar')
    .populate('receiver', 'name phone role profession avatar')
    .sort({ createdAt: 1 })
    .limit(100);

    // O'qilmagan xabarlarni belgilash
    await Message.updateMany(
      { 
        sender: req.params.userId, 
        receiver: req.userId, 
        read: false 
      },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({ error: 'Xabarlarni olishda xatolik' });
  }
});

// Barcha suhbatlar ro'yxati
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get all unique conversations
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user info
    const conversations = await User.populate(messages, {
      path: '_id',
      select: 'name phone role profession avatar isPremium'
    });

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ error: 'Suhbatlarni olishda xatolik' });
  }
});

// O'qilmagan xabarlar soni
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.userId,
      read: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Xabarlar sonini olishda xatolik' });
  }
});

module.exports = router;