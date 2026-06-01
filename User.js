const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    default: 60000
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  cardNumber: {
    type: String,
    default: '9860036601075512'
  },
  transactionNote: {
    type: String,
    default: ''
  },
  processedDate: {
    type: Date
  },
  adminNote: {
    type: String
  }
});

const reviewSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ism-familiya kiritilishi shart'],
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  phone: {
    type: String,
    required: [true, 'Telefon raqam kiritilishi shart'],
    unique: true,
    trim: true,
    match: [/^\+998\d{9}$/, 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak']
  },
  password: {
    type: String,
    required: [true, 'Parol kiritilishi shart'],
    minlength: 6
  },
  role: {
    type: String,
    enum: {
      values: ['usta', 'client'],
      message: 'Rol faqat "usta" yoki "client" bo\'lishi mumkin'
    },
    required: [true, 'Rol tanlanishi shart']
  },
  profession: {
    type: String,
    required: [function() { return this.role === 'usta'; }, 'Kasb tanlanishi shart'],
    trim: true
  },
  region: {
    type: String,
    required: [true, 'Viloyat tanlanishi shart'],
    enum: {
      values: [
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
      ],
      message: '{VALUE} - noto\'g\'ri viloyat nomi'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  experience: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },
  avatar: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: {
    type: Date
  },
  paymentHistory: [paymentHistorySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for premium status check
userSchema.virtual('isPremiumActive').get(function() {
  if (!this.isPremium || !this.premiumExpiry) return false;
  return this.premiumExpiry > new Date();
});

module.exports = mongoose.model('User', userSchema);