
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Invalid email format (e.g., aya@polytechnique.tn)'
      ]
    },
    
    password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Le mot de passe doit comporter au moins 6 caractères']
},

    age: {
      type: Number,
      min: [4, 'Minimum age is 4 years old']
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not an authorized role'
      },
      default: 'user'
    },

    // Optional biography, maximum 200 characters
    bio: {
      type: String,
      maxlength: [
        200,
        'La biographie ne peut pas dépasser 200 caractères'
      ]
    },

    // Phone number must contain exactly 8 digits
    phone: {
      type: String,
      match: [
        /^\d{8}$/,
        'Numéro de 8 chiffres requis'
      ]
    }
  },
  { timestamps: true }
);

// Automatically adds createdAt and updatedAt
module.exports = mongoose.model('User', userSchema);
