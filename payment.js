const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// To'lov qilish
router.post('/pay', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    if (user.role !== 'usta') {
      return res.status(403).json({ error: 'Faqat ustalar to\'lov qila oladi' });
    }

    // Check if already premium and active
    if (user.isPremium && user.premiumExpiry > new Date()) {
      return res.status(400).json({ 
        error: 'Siz allaqachon premium foydalanuvchisiz. Premium muddati: ' + 
               new Date(user.premiumExpiry).toLocaleDateString('uz-UZ') 
      });
    }

    // Check if there's a pending payment
    const hasPendingPayment = user.paymentHistory.some(p => p.status === 'pending');
    if (hasPendingPayment) {
      return res.status(400).json({ 
        error: 'Sizda kutilayotgan to\'lov mavjud. Iltimos admin tasdiqlashini kuting yoki ' +
               process.env.ADMIN_PHONE + ' raqamiga murojaat qiling' 
      });
    }

    const payment = {
      amount: 60000, // 60,000 so'm
      cardNumber: process.env.CARD_NUMBER,
      status: 'pending',
      date: new Date(),
      transactionNote: req.body.note || ''
    };
    
    user.paymentHistory.push(payment);
    await user.save();

    res.json({ 
      success: true,
      message: 'To\'lov so\'rovi yuborildi. 24 soat ichida admin tomonidan tasdiqlanadi.',
      paymentInfo: {
        cardNumber: process.env.CARD_NUMBER,
        amount: '60,000 so\'m',
        adminPhone: process.env.ADMIN_PHONE,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'To\'lov so\'rovida xatolik' });
  }
});

// To'lov tarixini olish
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('paymentHistory isPremium premiumExpiry');
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const paymentHistory = user.paymentHistory.sort((a, b) => b.date - a.date);

    res.json({
      success: true,
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      paymentHistory
    });
  } catch (error) {
    res.status(500).json({ error: 'To\'lov tarixini olishda xatolik' });
  }
});

// Premium statusini tekshirish
router.get('/premium-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('isPremium premiumExpiry');
    
    const isActive = user.isPremium && user.premiumExpiry > new Date();
    
    res.json({
      success: true,
      isPremium: user.isPremium,
      isActive,
      premiumExpiry: user.premiumExpiry,
      daysLeft: isActive ? 
        Math.ceil((user.premiumExpiry - new Date()) / (1000 * 60 * 60 * 24)) : 
        0
    });
  } catch (error) {
    res.status(500).json({ error: 'Status tekshirishda xatolik' });
  }
});

module.exports = router;