const pool = require('../config/db');

class Customer {
    static async getTypeCustomerById(id) {
        const query = 'SELECT type FROM customer WHERE customer_id=$1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async getRegisteredCustomerByEmail(email) {
        const query = 'SELECT * FROM Registered_Customer INNER JOIN Customer USING(customer_id) WHERE email=$1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async getRegisteredCustomerByID(id) {
        const query = 'SELECT * FROM Registered_Customer WHERE customer_id=$1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async getRegisteredCustomerCategoryByID(id) {
        const query = 'SELECT c.cat_name,c.discount_percentage FROM Registered_Customer r, customer_category c WHERE r.category = c.cat_name and r.customer_id=$1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async registerCustomer(
        // name, dob, gender, email, contactNo, nationality, passportNo, password,
        email, password, firstName, lastName, dob,
        gender, contactNo, passportNo, addressLine1, addressLine2, city, country,
    ) {
        const query = 'CALL registerCustomer ( $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)';
        await pool.query(query, [email, password, firstName, lastName, dob,
            gender, contactNo, passportNo, addressLine1, addressLine2, city, country
        ]);
    }

    static async isEmailRegistered(email) {
        const query = 'SELECT customer_id FROM Registered_Customer WHERE email=$1 LIMIT 1';
        const result = await pool.query(query, [email]);
        return result.rows[0] != null;
    }


    /*static async getReviews() {
        const query = `SELECT customer_id,review,first_name,last_name,category FROM customer_review NATURAL JOIN registered_customer WHERE customer_review.customer_id=registered_customer.customer_id;`;
        const result = await pool.query(query, []);
        return result.rows;
    }

    static async createReview(custID, review) {
        const query = `INSERT INTO customer_review(customer_id,review) VALUES($1,$2);`;
        const result = await pool.query(query, [custID, review]);
        return result.rows;
    }*/

    static async editProfile(
        firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, addressLine2, city, country, custID
    ) {
        const query = 'UPDATE registered_customer SET first_name=$1, last_name=$2, dob=$3, gender=$4, contact_no=$5,' +
            'passport_no=$6, address_line1=$7, address_line2=$8, city=$9, country=$10 WHERE customer_id=$11 ';
        await pool.query(query, [firstName, lastName, dob, gender, contactNo, passportNo, addressLine1, addressLine2, city, country, custID]);
    }

    static async changePassword(custID, hashedPassword) {
        const query = 'UPDATE registered_customer SET password=$1 WHERE customer_id=$2 ';
        await pool.query(query, [hashedPassword, custID]);
    }
}

module.exports = Customer;