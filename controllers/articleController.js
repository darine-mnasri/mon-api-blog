
let articles = [
  { id: 1, title: 'Bienvenue sur le blog', author: 'Admin' },
  { id: 2, title: 'Mon premier serveur Express', author: 'Aya' },
  { id: 3, title: 'Tester une API avec Postman', author: 'Aya' }
];

let prochainId = 4;

// 1. Récupérer tous les articles
const getAllArticles = (req, res) => {
  const { author } = req.query;
  let resultat = articles;

  if (author) {
    resultat = articles.filter(a => a.author === author);
  }

  res.status(200).json({
    total: resultat.length,
    articles: resultat
  });
};

// 2. Récupérer un article par son ID
const getArticleById = (req, res) => {
  const id = Number(req.params.id);
  const article = articles.find(a => a.id === id);

  if (!article) {
    return res.status(404).json({
      error: `Article ${id} introuvable`
    });
  }

  res.status(200).json(article);
};

// 3. Créer un nouvel article
const createArticle = (req, res) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      error: "Le titre et l'auteur sont obligatoires"
    });
  }

  const nouvelArticle = {
    id: prochainId++,
    title,
    author
  };

  articles.push(nouvelArticle);

  res.status(201).json({
    message: 'Article créé',
    article: nouvelArticle
  });
};

const updateArticle = (req, res) => {
  const id = Number(req.params.id);
  const { title, author } = req.body;

  const index = articles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Article ${id} introuvable`
    });
  }

  if (title) articles[index].title = title;
  if (author) articles[index].author = author;

  res.status(200).json({
    message: 'Article mis à jour',
    article: articles[index]
  });
};

const deleteArticle = (req, res) => {
  const id = Number(req.params.id);

  const index = articles.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Article ${id} introuvable`
    });
  }

  const articleSupprime = articles.splice(index, 1)[0];

  res.status(200).json({
    message: 'Article supprimé',
    article: articleSupprime
  });
};
 



// Exporter les fonctions pour les utiliser dans routes/
module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle

};


