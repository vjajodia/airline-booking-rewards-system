const router = require('express').Router();
const ifGuest = require('../middleware/ifGuest');
const ifRegisteredCustomer = require('../middleware/ifRegisteredCustomer');
const CustomerController = require('../controllers/customerController');
const FlightController = require('../controllers/flightController');

router.post('/register', ifGuest, CustomerController.register);
router.post('/login', ifGuest, CustomerController.login);
router.get('/logout', ifRegisteredCustomer, CustomerController.logout);
router.get('/viewFlights', FlightController.getFlightByFilter);
router.post('/viewFlights', FlightController.getFlightByFilter);

//router.get('/createReview',ifRegisteredCustomer, CustomerController.getReview);
//router.post('/createReview/created', ifRegisteredCustomer, CustomerController.createReview);

router.get('/editProfile', ifRegisteredCustomer, CustomerController.viewEditProfile);
router.post('/editProfile', ifRegisteredCustomer, CustomerController.editProfile);
router.post('/changePassword', ifRegisteredCustomer, CustomerController.changePassword);


module.exports = router;