const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Admin login
router.post('/login', adminAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin panelga xush kelibsiz',
      token: req.adminToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Login xatoligi' });
  }
});

// Admin statistikasi
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const ustalar = await User.countDocuments({ role: 'usta' });
    const clients = await User.countDocuments({ role: 'client' });
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const activePremiumUsers = await User.countDocuments({
      isPremium: true,
      premiumExpiry: { $gt: new Date() }
    });
    const pendingPayments = await User.countDocuments({
      'paymentHistory.status': 'pending'
    });

    // Region statistics
    const regionStats = await User.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Profession statistics
    const professionStats = await User.aggregate([
      { $match: { role: 'usta' } },
      { $group: { _id: '$profession', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent users
    const recentUsers = await User.find()
      .select('-password -paymentHistory')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent payments
    const allUsers = await User.find({ 'paymentHistory.0': { $exists: true } })
      .select('name phone paymentHistory')
      .sort({ 'paymentHistory.date': -1 });

    const recentPayments = allUsers
      .map(user => {
        const payments = user.paymentHistory.map(p => ({
          userId: user._id,
          userName: user.name,
          userPhone: user.phone,
          ...p.toObject()
        }));
        return payments;
      })
      .flat()
      .sort((a, b) => b.date - a.date)
      .slice(0, 20);

    res.json({
      success: true,
      stats: {
        totalUsers,
        ustalar,
        clients,
        premiumUsers,
        activePremiumUsers,
        pendingPayments
      },
      regionStats,
      professionStats,
      recentUsers,
      recentPayments
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Statistikani olishda xatolik' });
  }
});

// Barcha foydalanuvchilarni olish
router.get('/users', async (req, res) => {
  try {
    const { role, region, search, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    
    if (role) filter.role = role;
    if (region) filter.region = region;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Foydalanuvchilarni olishda xatolik' });
  }
});

// To'lovni tasdiqlash
router.put('/payment/approve/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const pendingPayment = user.paymentHistory.find(p => p.status === 'pending');
    
    if (!pendingPayment) {
      return res.status(400).json({ error: 'Tasdiqlanishi kerak bo\'lgan to\'lov topilmadi' });
    }

    pendingPayment.status = 'approved';
    pendingPayment.processedDate = new Date();
    pendingPayment.adminNote = req.body.note || 'Admin tomonidan tasdiqlandi';
    
    user.isPremium = true;
    user.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 kunlik premium
    
    await user.save();

    res.json({ 
      success: true,
      message: 'To\'lov muvaffaqiyatli tasdiqlandi',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isPremium: user.isPremium,
        premiumExpiry: user.premiumExpiry
      }
    });
  } catch (error) {
    console.error('Payment approval error:', error);
    res.status(500).json({ error: 'To\'lovni tasdiqlashda xatolik' });
  }
});

// To'lovni rad etish
router.put('/payment/reject/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const pendingPayment = user.paymentHistory.find(p => p.status === 'pending');
    
    if (!pendingPayment) {
      return res.status(400).json({ error: 'Rad etiladigan to\'lov topilmadi' });
    }

    pendingPayment.status = 'rejected';
    pendingPayment.processedDate = new Date();
    pendingPayment.adminNote = req.body.note || 'Admin tomonidan rad etildi. Admin bilan bog\'laning: ' + process.env.ADMIN_PHONE;
    
    await user.save();

    res.json({ 
      success: true,
      message: 'To\'lov rad etildi',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'To\'lovni rad etishda xatolik' });
  }
});

// Foydalanuvchini bloklash/aktivlashtirish
router.put('/user/toggle-status/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      success: true,
      message: `Foydalanuvchi ${user.isActive ? 'aktivlashtirildi' : 'bloklandi'}`,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Status o\'zgartirishda xatolik' });
  }
});

// Foydalanuvchini o'chirish
router.delete('/user/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    res.json({ 
      success: true,
      message: 'Foydalanuvchi o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({ error: 'O\'chirishda xatolik' });
  }
});

module.exports = router;