
const User = require('../models/userModel');
const Article = require('../models/articleModel');

// 1. Create a new user (POST /api/users)
const createUser = async (req, res) => {
  try {
    const { name, email, age, role, bio, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    // Check for duplicate email
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({
        message: 'Email already in use'
      });
    }

    const user = await User.create({
      name,
      email,
      age,
      role,
      bio,
      phone
    });

    return res.status(201).json(user);

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: err.message
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Email already in use'
      });
    }

    return res.status(500).json({
      message: err.message
    });
  }
};

// 2. Retrieve all users (GET /api/users)
const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// 3. Retrieve user by ID (GET /api/users/:id)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier (ObjectId expected)'
      });
    }

    return res.status(500).json({
      message: err.message
    });
  }
};

// 4. Delete a user only if they have no articles
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Vérifier si l'utilisateur existe
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable'
      });
    }

    // 2. Vérifier si l'utilisateur possède des articles
    const article = await Article.findOne({
      author: userId
    });

    if (article) {
      return res.status(400).json({
        message: 'Impossible de supprimer un utilisateur ayant des articles publies'
      });
    }

    // 3. Supprimer l'utilisateur s'il n'a aucun article
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier (ObjectId expected)'
      });
    }

    console.error(err);

    return res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  deleteUser
};
