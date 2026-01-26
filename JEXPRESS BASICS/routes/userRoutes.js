const express = require('express');

const {
  getAllUsers,
  createUser,
  updateUser,
  getUser,
  deleteUser,
} = require('../controllers/userControllers');
// 4) ROUTER
// 4.2) User router
const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
