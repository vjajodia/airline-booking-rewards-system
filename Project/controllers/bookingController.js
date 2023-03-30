const { GuestInfo } = require('./validators/guestInfo');
const BookingService = require('../services/BookingServices');
const FlightService = require('../services/flightServices');
const Booking = require('../models/Booking');
class BookingController {
    static async getBooking(req, res) {
        let schedule_id;
        if (typeof req.body.schedule_id !== 'undefined') {
            schedule_id = req.body.schedule_id;
        } else {
            schedule_id = req.query.schedule_id;
        }

        const flightInfo = await BookingService.getFlightInfo(schedule_id);
        const seat_info = await BookingService.getSeats(schedule_id);

        res.render('booking', {
            schedule_id,
            user: req.session.user,
            seat_info,
            registrationError: req.query.registrationError,
            loginError: req.query.loginError,
            regemail: req.query.email,
            regfirstName: req.query.firstName,
            reglastName: req.query.lastName,
            regdob: req.query.dob,
            reggender: req.query.gender,
            regcontactNo: req.query.contactNo,
            regpassportNo: req.query.passportNo,
            regaddressLine1: req.query.addressLine1,
            regaddressLine2: req.query.addressLine2,
            regcity: req.query.city,
            regcountry: req.query.country,
            custName: req.query.custName,
            address: req.query.address,
            custDob: req.query.custDob,
            custGender: req.query.custGender,
            custPassport: req.query.custPassport,
            mobile: req.query.mobile,
            custEmail: req.query.custEmail,
            flightInfo: flightInfo[0],
            priceInfo: flightInfo[1],
        });
    }

    static async createBooking(req, res) {
        try {
            const booking_id = await BookingService.createBooking(req.body);
            req.session.booking_id = booking_id.insertbooking;
            return res.status(200).send({ result: 'redirect', url: '/payment' });
        } catch (err) {
            return res.status(200).send({
                result: 'redirect',
                url: `/?registrationError=${err}
                &custEmail=${req.body.custEmail}&custName=${req.body.custName}&custDob=${req.body.custDob}&custGender=${req.body.custGender}&mobile=${req.body.mobile}&custPassport=${req.body.custPassport}&address=${req.body.address}&schedule_id=${req.body.schedule_id}
            `,
            });
        }
    }

    static async getPayment(req, res) {
        const paymentstatus = await Booking.getPaymentStatus(req.session.booking_id)
        if (!paymentstatus || paymentstatus.state === 'Paid') {
            return res.status(405).render('405');
        }
        const prices = await BookingService.getPrice(req.session.booking_id);
        if (typeof prices === 'undefined') {
            return res.status(405).render('405');
        } else {
            const seat_prices = await BookingService.getSeatPrices(req.session.booking_id);

            const discount_percentage = Math.floor(100 - 100 * prices.final_price / prices.price_before_discount);

            res.render('payment', {
                user: req.session.user,
                booking_id: req.session.booking_id,
                seat_prices: seat_prices,
                price: prices.final_price,
                priceBeforeDiscount: prices.price_before_discount,
                discount_percentage: discount_percentage,
                registrationError: req.query.registrationError,
                dbError: req.query.dbError,
                loginError: req.query.loginError,
                regemail: req.query.email,
                regfirstName: req.query.firstName,
                reglastName: req.query.lastName,
                regdob: req.query.dob,
                reggender: req.query.gender,
                regcontactNo: req.query.contactNo,
                regpassportNo: req.query.passportNo,
                regaddressLine1: req.query.addressLine1,
                regaddressLine2: req.query.addressLine2,
                regcity: req.query.city,
                regcountry: req.query.country,
            });
        }
    }

    static async cancelPayment(req, res) {
        try {
            await BookingService.cancelBooking(req.session.booking_id);
            res.render('payment_cancel', {
                user: req.session.user,
                registrationError: req.query.registrationError,
                loginError: req.query.loginError,
                regemail: req.query.email,
                regfirstName: req.query.firstName,
                reglastName: req.query.lastName,
                regdob: req.query.dob,
                reggender: req.query.gender,
                regcontactNo: req.query.contactNo,
                regpassportNo: req.query.passportNo,
                regaddressLine1: req.query.addressLine1,
                regaddressLine2: req.query.addressLine2,
                regcity: req.query.city,
                regcountry: req.query.country,
            });
        } catch (error) {
            console.log(error);
            return res.redirect('/booking/payment?dbError=${error}');
        }
    }

    static async paymentSuccess(req, res) {
        try {
            await BookingService.successBooking(req.session.booking_id);
            const bookingDetails = await BookingService.getBookingDetails(req.session.booking_id);
            const schedule_id = bookingDetails[0].schedule_id;
            const flight_details = await FlightService.getFlightByID(schedule_id);

            res.render('payment_successful', {
                user: req.session.user,
                flight_details,
                bookingDetails: bookingDetails[1],
                registrationError: req.query.registrationError,
                loginError: req.query.loginError,
                regemail: req.query.email,
                regfirstName: req.query.firstName,
                reglastName: req.query.lastName,
                regdob: req.query.dob,
                reggender: req.query.gender,
                regcontactNo: req.query.contactNo,
                regpassportNo: req.query.passportNo,
                regaddressLine1: req.query.addressLine1,
                regaddressLine2: req.query.addressLine2,
                regcity: req.query.city,
                regcountry: req.query.country,
            });
        } catch (error) {
            console.log(error);
            return res.redirect('/booking/payment?dbError=${error}');
        }
    }

    static async deleteBooking(req, res) {
        try {
            await BookingService.cancelBooking(req.body.booking_id);
            return res.status(200).send({ result: 'redirect', url: '/' });
        } catch (error) {
            console.log(error);
            return res.status(200).send({ result: 'redirect', url: '/' });
        }
    }

    static async cancelReservation(req, res) {
        try {
            req.session.booking_id = req.body.booking_id;
            const upcomingFlights = await FlightService.getAllFlights();
            const bookingDetails = await BookingService.cancelReservation(req.body.booking_id);
            res.render('cancel_reservation', {
                user: req.session.user,
                bookingDetails,
                upcomingFlights,
                registrationError: req.query.registrationError,
                loginError: req.query.loginError,
                regemail: req.query.email,
                regfirstName: req.query.firstName,
                reglastName: req.query.lastName,
                regdob: req.query.dob,
                reggender: req.query.gender,
                regcontactNo: req.query.contactNo,
                regpassportNo: req.query.passportNo,
                regaddressLine1: req.query.addressLine1,
                regaddressLine2: req.query.addressLine2,
                regcity: req.query.city,
                regcountry: req.query.country,
            });
        } catch (error) {
            console.log(error);
            return res.redirect('/');
        }
    }

    static async getPreviousBookings(req, res) {
        try {
            const bookingsDetails = await BookingService.getPreviousBookings(req.session.user.customerData.customer_id);
            const upcomingFlights = await FlightService.getAllFlights();

            res.render('previous_bookings', {
                user: req.session.user,
                bookingsDetails,
                upcomingFlights,
                registrationError: req.query.registrationError,
                loginError: req.query.loginError,
                regemail: req.query.email,
                regfirstName: req.query.firstName,
                reglastName: req.query.lastName,
                regdob: req.query.dob,
                reggender: req.query.gender,
                regcontactNo: req.query.contactNo,
                regpassportNo: req.query.passportNo,
                regaddressLine1: req.query.addressLine1,
                regaddressLine2: req.query.addressLine2,
                regcity: req.query.city,
                regcountry: req.query.country,
            });
        } catch (error) {
            console.log(error);
            return res.redirect('/');
        }
    }


    static async getPreviousBooking(req, res) {
        try {
            req.session.booking_id = req.body.booking_id;
            const bookingDetails = await BookingService.getBookingDetails(req.body.booking_id);
            const schedule_id = bookingDetails[0].schedule_id;
            const flight_details = await FlightService.getFlightByID(schedule_id);

            res.render('previous_booking', {
                user: req.session.user,
                flight_details,
                bookingDetails: bookingDetails[1],
                registrationError: req.query.registrationError,
                loginError: req.query.loginError,
                regemail: req.query.email,
                regfirstName: req.query.firstName,
                reglastName: req.query.lastName,
                regdob: req.query.dob,
                reggender: req.query.gender,
                regcontactNo: req.query.contactNo,
                regpassportNo: req.query.passportNo,
                regaddressLine1: req.query.addressLine1,
                regaddressLine2: req.query.addressLine2,
                regcity: req.query.city,
                regcountry: req.query.country,
            });
        } catch (error) {
            console.log(error);
            return res.redirect('/');
        }
    }
}

module.exports = BookingController;