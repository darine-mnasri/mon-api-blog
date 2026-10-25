const Article = require('../models/articleModel');
const User = require('../models/userModel');

// ==========================================
// 1. Récupérer tous les articles
// GET /api/articles
// ==========================================
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find()
            .populate('author', 'name email role');

        return res.status(200).json(articles);

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// Récupérer les articles de l'utilisateur connecté
// GET /api/articles/my-articles
// ==========================================
const getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({ author: req.user._id });

        return res.status(200).json(articles);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 2. Créer un article (route protégée)
// POST /api/articles
// L'auteur est récupéré depuis le JWT
// ==========================================
const createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Titre et contenu obligatoires'
            });
        }

        // Vérifier que le middleware protect a identifié l'utilisateur
        if (!req.user) {
            return res.status(401).json({
                message: 'Non autorisé : connexion requise'
            });
        }

        // L'auteur provient du token vérifié, pas du body
        const newArticle = await Article.create({
            title,
            content,
            author: req.user._id
        });

        const populatedArticle = await newArticle.populate(
            'author',
            'name email role'
        );

        return res.status(201).json(populatedArticle);

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
// 3. Récupérer un article par son ID
// GET /api/articles/:id
// ==========================================
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'name email role');

        if (!article) {
            return res.status(404).json({
                message: 'Article non trouvé'
            });
        }

        return res.status(200).json(article);

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant invalide (format ObjectId attendu)'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 4. Modifier un article
// PUT /api/articles/:id
// Autorisé : auteur de l'article ou administrateur
// ==========================================
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: 'Article introuvable pour la mise à jour'
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message: 'Non autorisé : connexion requise'
            });
        }

        // Vérifier si l'utilisateur est l'auteur ou un administrateur
        const isAuthor =
            article.author.toString() === req.user._id.toString();

        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                message: "Action interdite : vous n'êtes pas l'auteur de cet article"
            });
        }

        // Modifier uniquement les champs autorisés
        if (req.body.title !== undefined) {
            article.title = req.body.title;
        }

        if (req.body.content !== undefined) {
            article.content = req.body.content;
        }

        const updatedArticle = await article.save();

        const populatedArticle = await updatedArticle.populate(
            'author',
            'name email role'
        );

        return res.status(200).json(populatedArticle);

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant invalide'
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
// 5. Supprimer un article
// DELETE /api/articles/:id
// Autorisé : auteur de l'article ou administrateur
// ==========================================
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({
                message: 'Article introuvable pour la suppression'
            });
        }

        if (!req.user) {
            return res.status(401).json({
                message: 'Non autorisé : connexion requise'
            });
        }

        // Vérifier les droits de propriété
        const isAuthor =
            article.author.toString() === req.user._id.toString();

        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                message: "Action interdite : vous n'êtes pas l'auteur de cet article"
            });
        }

        await Article.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: 'Article supprimé avec succès',
            id: req.params.id
        });

    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Identifiant invalide'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// ==========================================
// 6. Exporter toutes les fonctions
// ==========================================
module.exports = {
    getAllArticles,
    getMyArticles,
    createArticle,
    getArticleById,
    updateArticle,
    deleteArticle
};
