const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Article = require('../models/articleModel');

// ==========================================
// 1. Génération du token JWT
// ==========================================
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '10s' }
    );
};

// ==========================================
// 2. Inscription d'un utilisateur
// POST /api/users/register
// ==========================================
const registerUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Nom, email et mot de passe requis'
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).json({
                message: 'Cet email est déjà utilisé'
            });
        }

        // Hachage sécurisé du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Le rôle est défini côté serveur
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            age,
            role: 'user'
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            age: user.age,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 3. Connexion d'un utilisateur
// POST /api/users/login
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email et mot de passe requis'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: 'Identifiants invalides'
            });
        }

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Identifiants invalides'
            });
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            age: user.age,
            role: user.role,
            token: generateToken(user._id, user.role)
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 4. Créer un utilisateur (ancienne fonction)
// POST /api/users
// ==========================================
const createUser = async (req, res) => {
    try {
        const { name, email, age, role } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Le nom et l'email sont requis"
            });
        }

        const exists = await User.findOne({ email });

        if (exists) {
            return res.status(409).json({
                message: 'Cet email est déjà utilisé'
            });
        }

        // Cette ancienne fonction ne gère pas le mot de passe.
        // Le rôle administrateur doit être réservé aux personnes autorisées.
        const user = await User.create({
            name,
            email,
            age,
            role: role === 'admin' ? 'user' : (role || 'user')
        });

        return res.status(201).json(user);

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 5. Récupérer tous les utilisateurs
// GET /api/users
// ==========================================
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        return res.status(200).json(users);

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 6. Récupérer un utilisateur par son ID
// GET /api/users/:id
// ==========================================
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        return res.status(200).json(user);

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant de ressource invalide (format ObjectId attendu)'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 7. Supprimer un utilisateur
// DELETE /api/users/:id
// ==========================================
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier si l'utilisateur possède des articles
        const article = await Article.findOne({
            author: req.params.id
        });

        if (article) {
            return res.status(400).json({
                message: 'Impossible de supprimer un utilisateur ayant des articles publiés'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: 'Utilisateur supprimé avec succès'
        });

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant de ressource invalide'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 8. Récupérer le profil de l'utilisateur connecté
// GET /api/users/profile
// Nécessite le middleware protect
// ==========================================
const getUserProfile = async (req, res) => {
    try {
        return res.status(200).json(req.user);

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 9. Récupérer tous les utilisateurs (admin)
// GET /api/users/admin
// Nécessite protect + adminOnly
// ==========================================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        return res.status(200).json(users);

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// Modifier le rôle d'un utilisateur (admin)
// PUT /api/users/:id/role
// ==========================================
const promoteUserToAdmin = async (req, res) => {
    try {
        if (!req.body || req.body.role !== 'admin') {
            return res.status(400).json({
                message: 'Le rôle doit être admin'
            });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        user.role = 'admin';
        await user.save();

        return res.status(200).json({
            message: 'Rôle administrateur attribué avec succès',
            user
        });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant de ressource invalide'
            });
        }

        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// Renouveler le mot de passe de l'utilisateur connecté
// PUT /api/users/update-password
// ==========================================
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body || {};

        if (
            typeof oldPassword !== 'string' ||
            !oldPassword ||
            typeof newPassword !== 'string' ||
            !newPassword
        ) {
            return res.status(400).json({
                message: 'Ancien et nouveau mots de passe requis'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'Le nouveau mot de passe doit comporter au moins 6 caractères'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'Utilisateur non trouvé'
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Ancien mot de passe incorrect'
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({
            message: 'Mot de passe mis à jour avec succès'
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 11. Exporter toutes les fonctions
// ==========================================
module.exports = {
    generateToken,
    registerUser,
    loginUser,
    createUser,
    getUsers,
    getUserById,
    deleteUser,
    getUserProfile,
    getAllUsers,
    promoteUserToAdmin,
    updatePassword
};