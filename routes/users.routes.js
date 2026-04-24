const express = require('express');
const userController = require('../controllers/user.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(requireRole(['ADMIN']));

router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.post('/:id/update', userController.updateUser);
router.post('/:id/delete', userController.deleteUser);

module.exports = router;
