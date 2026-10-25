const express = require('express');
const router = express.Router();

const articleController = require('../controllers/articleController');
const { protect } = require('../middlewares/authMiddleware');

// GET : récupérer tous les articles (public)
router.get('/', articleController.getAllArticles);

// GET : récupérer les articles de l'utilisateur connecté
router.get('/my-articles', protect, articleController.getMyArticles);

// GET : récupérer un article par son ID (public)
router.get('/:id', articleController.getArticleById);

// POST : créer un article (protégé par JWT)
router.post('/', protect, articleController.createArticle);

// PUT : modifier un article par son ID (protégé par JWT)
router.put('/:id', protect, articleController.updateArticle);

// DELETE : supprimer un article par son ID (protégé par JWT)
router.delete('/:id', protect, articleController.deleteArticle);

module.exports = router;