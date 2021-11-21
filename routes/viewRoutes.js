const router = require('express').Router();
const viewController = require('../controllers/viewController');

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.login);
module.exports = router;
