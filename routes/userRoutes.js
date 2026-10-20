const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const {
  createUser,
  getUsers,
  getUserById
} = require('../controllers/userController');

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.delete('/:id', userController.deleteUser);

module.exports = router;
