const router = require('express').Router({ mergeParams: true });
const authMiddleware = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');
const { restrictTo } = require('../middleware/restrict');

router.use(authMiddleware);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    restrictTo('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(restrictTo('user', 'admin'), reviewController.deleteReview)
  .patch(restrictTo('user', 'admin'), reviewController.updateReview);

module.exports = router;
