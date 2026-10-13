const { isValidName, isValidEmail } = require('../utils/validators');
let users = [
  { id: 1, name: 'Darine', email: 'darine@example.com', role: 'admin' },
  { id: 2, name: 'Aya', email: 'aya@example.com', role: 'user' },
  { id: 3, name: 'Youssef', email: 'youssef@example.com', role: 'user' }
];

let prochainId = 4;

// GET : récupérer tous les utilisateurs ou filtrer par rôle
const getAllUsers = (req, res) => {
  const { role } = req.query;
  let resultat = users;

  if (role) {
    resultat = users.filter(u => u.role === role);
  }

  res.status(200).json({
    total: resultat.length,
    users: resultat
  });
};

// POST : ajouter un utilisateur
const createUser = (req, res) => {
  const { name, email, role } = req.body;


if (!name || !email || !role) {
  return res.status(400).json({
    error: 'Le nom, l’email et le rôle sont obligatoires'
  });
}

if (!isValidName(name)) {
  return res.status(400).json({
    error: 'Le nom doit contenir au moins 2 caractères'
  });
}

if (!isValidEmail(email)) {
  return res.status(400).json({
    error: 'Adresse email invalide'
  });
}


  const nouvelUtilisateur = {
    id: prochainId++,
    name,
    email,
    role
  };

  users.push(nouvelUtilisateur);

  res.status(201).json({
    message: 'Utilisateur créé',
    user: nouvelUtilisateur
  });
};

// DELETE : supprimer un utilisateur
const deleteUser = (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Utilisateur ${id} introuvable`
    });
  }

  const utilisateurSupprime = users.splice(index, 1)[0];

  res.status(200).json({
    message: 'Utilisateur supprimé',
    user: utilisateurSupprime
  });
};

module.exports = {
  getAllUsers,
  createUser,
  deleteUser
};
