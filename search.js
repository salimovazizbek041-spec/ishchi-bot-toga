const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Ustalarni qidirish
router.get('/ustalar', async (req, res) => {
  try {
    const { 
      profession, 
      region, 
      query, 
      minRating,
      isPremium,
      page = 1, 
      limit = 12 
    } = req.query;
    
    let filter = { 
      role: 'usta',
      isActive: true 
    };
    
    if (profession && profession !== 'all') {
      filter.profession = profession;
    }
    
    if (region && region !== 'all') {
      filter.region = region;
    }

    if (isPremium === 'true') {
      filter.isPremium = true;
      filter.premiumExpiry = { $gt: new Date() };
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { profession: { $regex: query, $options: 'i' } }
      ];
    }
    
    const total = await User.countDocuments(filter);
    
    const ustalar = await User.find(filter)
      .select('-password -paymentHistory')
      .sort({ 
        isPremium: -1, 
        rating: -1, 
        totalReviews: -1,
        createdAt: -1 
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      ustalar,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Qidirishda xatolik yuz berdi' });
  }
});

// Barcha kasblar ro'yxati
router.get('/professions', async (req, res) => {
  try {
    const professions = await User.distinct('profession', { 
      role: 'usta',
      isActive: true 
    });
    
    // Kasblar sonini hisoblash
    const professionCounts = await User.aggregate([
      { 
        $match: { 
          role: 'usta',
          isActive: true,
          profession: { $exists: true, $ne: null, $ne: '' }
        } 
      },
      { 
        $group: { 
          _id: '$profession', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      professions,
      professionCounts
    });
  } catch (error) {
    res.status(500).json({ error: 'Kasblarni olishda xatolik' });
  }
});

// Barcha viloyatlar ro'yxati
router.get('/regions', async (req, res) => {
  try {
    const regions = [
      'Toshkent shahri',
      'Toshkent viloyati',
      'Samarqand',
      'Buxoro',
      'Navoiy',
      'Xorazm',
      'Qashqadaryo',
      'Surxondaryo',
      'Jizzax',
      'Sirdaryo',
      'Farg\'ona',
      'Andijon',
      'Namangan'
    ];
    
    // Har bir viloyatdagi ustalar soni
    const regionCounts = await User.aggregate([
      { 
        $match: { 
          role: 'usta',
          isActive: true 
        } 
      },
      { 
        $group: { 
          _id: '$region', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      regions,
      regionCounts
    });
  } catch (error) {
    res.status(500).json({ error: 'Viloyatlarni olishda xatolik' });
  }
});

// Usta profilini ko'rish
router.get('/usta/:id', async (req, res) => {
  try {
    const usta = await User.findOne({ 
      _id: req.params.id,
      role: 'usta',
      isActive: true
    })
    .select('-password -paymentHistory')
    .populate('reviews.clientId', 'name avatar');
    
    if (!usta) {
      return res.status(404).json({ error: 'Usta topilmadi' });
    }
    
    res.json({
      success: true,
      usta
    });
  } catch (error) {
    res.status(500).json({ error: 'Usta profilini olishda xatolik' });
  }
});

// Sharh qoldirish
router.post('/review/:ustaId', async (req, res) => {
  try {
    const { clientId, rating, comment } = req.body;
    
    const usta = await User.findOne({ 
      _id: req.params.ustaId,
      role: 'usta' 
    });
    
    if (!usta) {
      return res.status(404).json({ error: 'Usta topilmadi' });
    }
    
    // Check if already reviewed
    const existingReview = usta.reviews.find(
      r => r.clientId.toString() === clientId
    );
    
    if (existingReview) {
      return res.status(400).json({ error: 'Siz allaqachon sharh qoldirgansiz' });
    }
    
    usta.reviews.push({ clientId, rating, comment });
    usta.totalReviews = usta.reviews.length;
    
    // Recalculate rating
    const totalRating = usta.reviews.reduce((sum, r) => sum + r.rating, 0);
    usta.rating = totalRating / usta.reviews.length;
    
    await usta.save();
    
    res.json({
      success: true,
      message: 'Sharh qoldirildi',
      rating: usta.rating
    });
  } catch (error) {
    res.status(500).json({ error: 'Sharh qoldirishda xatolik' });
  }
});

module.exports = router;