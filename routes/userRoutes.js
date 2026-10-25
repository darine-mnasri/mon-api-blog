

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Routes d'authentification publiques
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Route privée : renouveler le mot de passe (JWT requis)
router.put('/update-password', protect, userController.updatePassword);

// Route privée : consulter son profil (JWT requis)
router.get('/profile', protect, userController.getUserProfile);

// Route administrateur : récupérer tous les utilisateurs
router.get('/', protect, adminOnly, userController.getAllUsers);

// Route administrateur : attribuer le rôle admin à un utilisateur
router.put('/:id/role', protect, adminOnly, userController.promoteUserToAdmin);

// Anciennes routes conservées
router.get('/:id', protect, adminOnly, userController.getUserById);
router.post('/', protect, adminOnly, userController.createUser);
router.delete('/:id', protect, adminOnly, userController.deleteUser);

module.exports = router;