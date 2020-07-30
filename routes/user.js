const express = require('express');

const router = express.Router();

const { protect, restrictTo } = require('../middleware/auth');

const userController = require('../controllers/user');

router.use(protect);
router.use(restrictTo('admin'));

router.route('/').get(userController.getUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
