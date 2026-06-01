const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Registratsiya
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      password, 
      role, 
      profession, 
      region, 
      description, 
      experience 
    } = req.body;

    // Validation
    if (!name || !phone || !password || !role || !region) {
      return res.status(400).json({ 
        error: 'Barcha majburiy maydonlarni to\'ldiring' 
      });
    }

    // Phone format validation
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        error: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' 
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' 
      });
    }

    // Validate role-specific fields
    if (role === 'usta' && !profession) {
      return res.status(400).json({ 
        error: 'Ustalar uchun kasb tanlash majburiy' 
      });
    }

    // Create user
    const user = new User({
      name,
      phone,
      password,
      role,
      profession: role === 'usta' ? profession : undefined,
      region,
      description: description || '',
      experience: experience || 0,
      lastLogin: new Date()
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profession: user.profession,
      region: user.region,
      description: user.description,
      experience: user.experience,
      rating: user.rating,
      isPremium: user.isPremium,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Ro\'yxatdan o\'tish muvaffaqiyatli',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' 
      });
    }
    
    res.status(500).json({ error: 'Ro\'yxatdan o\'tishda xatolik yuz berdi' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ 
        error: 'Telefon raqam va parolni kiriting' 
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ 
        error: 'Telefon raqam yoki parol noto\'g\'ri' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Telefon raqam yoki parol noto\'g\'ri' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Hisobingiz bloklangan. Admin bilan bog\'laning: ' + process.env.ADMIN_PHONE 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profession: user.profession,
      region: user.region,
      description: user.description,
      experience: user.experience,
      rating: user.rating,
      isPremium: user.isPremium,
      avatar: user.avatar
    };

    res.json({
      success: true,
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Tizimga kirishda xatolik yuz berdi' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password -paymentHistory');
    
    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Profil ma\'lumotlarini olishda xatolik' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'description', 'experience', 'avatar'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -paymentHistory');

    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    res.json({ 
      success: true, 
      message: 'Profil yangilandi',
      user 
    });
  } catch (error) {
    res.status(500).json({ error: 'Profilni yangilashda xatolik' });
  }
});

module.exports = router;