const router = require('express').Router();
const tourController = require('../controllers/tours');
const authMiddleware = require('../middleware/auth');
const { restrictTo } = require('../middleware/restrict');
/* const reviewController = require('../controllers/reviewController'); */
const reviewRouter = require('./reviews');
router
  .route('/5-cheap-tours')
  .get(tourController.getCheapTours, tourController.getTours);
router.route('/tour-stats').get(tourController.getToursStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/monthly-plan/:year')
  .get(
    restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router
  .route('/')
  .get(tourController.getTours)
  .post(
    authMiddleware,
    restrictTo('admin', 'lead-guide'),
    tourController.addTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(restrictTo('admin', 'lead-guide'), tourController.updateTour)
  .delete(
    authMiddleware,
    restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
/* router
  .route('/:tourId/reviews')
  .post(
    authMiddleware,
    restrictTo('user', 'admin'),
    reviewController.createReview
  ); */

router.use('/:tourId/reviews', reviewRouter);
module.exports = router;
