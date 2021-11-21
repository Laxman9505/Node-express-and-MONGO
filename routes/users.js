const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { updateMe, deleteMe, getOne, getUser } = require('../controllers/users');

const {
  getAllUsers,

  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');
const authController = require('../controllers/authController');
const { restrictTo } = require('../middleware/restrict');

router.post('/signup', authController.singUp);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updatePassword', authMiddleware, authController.updatePassword);

router.get('/me', authMiddleware, getOne, getUser);
router.patch('/updateMe', authMiddleware, updateMe);
router.delete('/deleteMe', authMiddleware, deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
