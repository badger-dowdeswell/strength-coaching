//
// DANCESPORT EXPRESS BACK-END
// ===========================
// The back-end server implemented on Node Express.js. This provides the api
// Routes needed between the React Front-End of the Dancesport application and the
// ProgreSQL database that stores the Dancesport database.
//
// Revision History
// ================
// 28.07.2022 BRD Original version.
// 18.08.2022 BRD Added update and delete routes for
//                the Dancer table.
// 05.09.2022 BRD Added a route to look up a dancer using
//                their email address.
// 15.09.2022 BRD Revised database for new Dancesport fields.
// 04.10.2022 BRD Create the insertDancer() route to create new
//                dancer records.
// 09.10.2022 BRD Added the routes for the Configuration table.
// 20.10.2022 BRD Re-structured the Dancer table.
// 15.11.2022 BRD The Dancer table is now the Registrant table since not all users
//                actually dance...
// 05.01.2023 BRD Added final fields for version one of the database.
// 19.01.2023 BRD Re-structured the Configuration table to add all the new age
//                fields.
// 03.03.2023 BRD Upgraded all routes to check for proper authorisation by verifing
//                JSON Web Tokens (JWTs). Also added encryption to the user's
//                password authentication.
//                Changed the listener port for the back-end to be 3005 so that
//                it does not conflict with other back-ends on the same server.
// 06.05.2023 BRD Latest updates from the team meeting on 3rd May. This
//                refined the Pro Am and Qualified Scrutineer classifications.
//                Also includes new fields for World Dance Organisation and
//                the World Dance Council.
// 01.06.2023 BRD Added the new route changeAdminUserPassword() to update an
//                administrators password.
// 04.06.2023 BRD Updated all routes to use JSON web tokens. Removed all unnecessary
//                console log messages. Only errors are logged now.
// 04.07.2023 BRD Added the /api/getAdministrators route to select and manage administrators.
// 27.11.2023 BRD Added boolean newsletter field to manage email distribution lists.
// 20.01.2024 BRD Added support for Registant notes. This includes transactional support
//                including automatic commits and rollbacks.
//
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import {formatDate} from './Utilities/DateLib.js';
const app = express();

const JWT_SECRET = "Obfusticate#*67678#Yale";
const JWT_EXPIRES_IN = {expiresIn: '1d'};
const BCRYPT_SALT = 10; // This sets a ten-cycle salt for use by bcrypt when
                        // encrypting users password.

// The TCP port the back-end will listen on for HTTP requests from the
// front-end.
const PORT = 3005;

// cors is a node.js package that Express uses Cross-Origin Resource
// sharing (CORS) is a mechanism that allows restricted resources on
// a web page to be requested from another domain outside the domain
// from which the first resource was served.
// see: https://expressjs.com/en/resources/middleware/cors.html
//
app.use(cors());

app.use(express.urlencoded({ extended: true }));
// Ensure the server can process JSON-encoded data.
app.use(express.json());

//
// MARK: Create connection pool
// ============================
// The back-end communicates with the ProgreSQL database by using a Pool object.
// It allows it to have a reusable pool of clients it can check out, use, and
// return. In the code below, the name of the pool used in this back-end
// is "db". Refer to https://node-postgres.com/features/pooling for more
// information.
//
const Pool = pg.Pool;
const db = new Pool({
    database: 'Dancesport',
    port: 5432,
    host: 'localhost',
    user: 'badger',
    password: 'siren22',
});

// MARK: app.listen()
// ==================
// Reports that the back-end is listening when it starts.
//
// RA_BRD sort out the current date problem raised on 21.01.2024
//
app.listen(PORT, () => {
    //var startDate = formatDate("DD MMMM YYYY", "now");
    console.log("\nThe Dancesport Back-End started on " +
                " on port " + PORT);
});

//
// MARK: logmsg
// ============
// Writes a date and time stamped log message to record errors.
//
function logmsg(msg) {
    console.log(msg);
}

//
// MARK: verifyJWT()
// =================
// Verifies that the JSON Web Token supplied in the request to a route
// is signed correctly.
//
function verifyJWT(JWT) {
    let status = false;
    jwt.verify(JWT, JWT_SECRET, (err) => {
        if (err) {
            status = false;
        } else {
            status = true;
        }
    });
    return status;
}

//
// MARK: authenticateUser()
// ========================
// Authenticates the user after loading their record from the User table. The bcrypt.compare()
// function is used to compare the encrypted password retrieved from their record with the
// password supplied.
//
// If the user password matches, a JSON Web Token (JWT) is generated and returned to the client.
//
app.get('/api/authenticateUser', async(request, response) => {
    const recvUser_ID = request.query.user_ID;
    const recvPassword = request.query.password;
    var query = "";

    if (/\S+@\S+\.\S+/.test(recvUser_ID)) {
        // The user has entered an email address as their user identification code.
        query = 'SELECT "registrant_ID", "user_authority", "password", "first_name", "last_name" FROM "Registrant" WHERE "email_address" = ' + "'" + recvUser_ID + "';";
    } else {
        // The user has specified their numeric user registrant identification code.
        query = 'SELECT "registrant_ID", "user_authority", "password", "first_name", "last_name" FROM "Registrant" WHERE "registrant_ID" = ' + "'" + recvUser_ID + "';";
    }

    db.query(query, (err, result) => {
        if (!err) {
            if (result.rows[0] !== undefined) {
                response.setHeader("Content-Type", "application/json");
                const registrant_ID = result.rows[0].registrant_ID;
                const user_authority = result.rows[0].user_authority;
                const encryptedPassword = result.rows[0].password;
                const first_name = result.rows[0].first_name;
                const last_name = result.rows[0].last_name;
                // Compare the password submitted and the encrypted password.
                bcrypt.compare(recvPassword , encryptedPassword, function(err, result) {
                    if (err) {
                        logmsg("/api/authenticateUser bcrypt.compare() error " + err.message);
                        response.status(500).send(err.message);
                    } else if (result) {
                        // Generate the JSON Web Token, setting it to expire in the specified time.
                        jwt.sign({registrant_ID}, JWT_SECRET, JWT_EXPIRES_IN , (err, token) => {
                            if (!err) {
                                const packet = {registrant_ID: registrant_ID,
                                                first_name: first_name,
                                                last_name:  last_name,
                                                user_authority: user_authority,
                                                JWT: token};
                                response.status(200).send(packet);
                            } else {
                                logmsg("/api/authenticateUser error " + err.message);
                                response.status(500).json({err});
                            }
                        });
                    } else {
                        // Passwords do not match
                        response.status(404).send('User was not authenticated');
                    }
                });
            } else {
                //console.log("/api/authenticateUser: user was not found");
                response.status(404).send('User was not found');
            }
        } else {
            logmsg("/api/authenticateUser returned error :" + err + "\n" +
                   "query: " + query);
            response.status(500).send('Returned error' + err);
        }
    });
});

//
// MARK: changeAdminUserPassword()
// ===============================
// Changes the user's password. This version is called from within the adminstrator part
// of the Dancesport application. It requires the existing user to supply their current
// JWT along with their User ID and their new password. This route can also change the
// registrants password-status. Refer to the Dancesport Database documentation for more
// information about the password status functionality.
//
app.put('/api/changeAdminUserPassword', async(request, response) => {
    const JWT = request.query.JWT;
    const password = request.body.password

    if (!verifyJWT(JWT)) {
        response.status(403).send("Not authorised");
    } else {
        // Encrypt the password with an appropriate salt.
        var new_password = await bcrypt.hash(password, BCRYPT_SALT);

        const sqlUpdateCmd = 'UPDATE "Registrant" SET ' +
            ' "password" = ' + "'" + new_password + "' , " +
            ' "password_status" = ' + "'" + request.body.password_status + "'" +
            ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'";

        db.query(sqlUpdateCmd, (err, result) => {
            if (!err) {
                response.status(200).send("/api/changeAdminUserPassword: Password updated.");
            } else {
                response.status(500).send("/api/changeAdminUserPassword: Unexpected error " + err.message);
                logmsg("/api/changeAdminUserPasswordreturned an unexpected error :" + err.message +
                            "\nsqlUpdateCmd:\n" + sqlUpdateCmd + " " + result);
            }
        });
    }
});

//
// MARK: getRegistrant()
// =====================
// Route to return an individual Registrant record based on their registrant_ID.
// A join is used to retrieve individual variable length notes records for each
// Age Group from the linked Notes table.
//
app.get('/api/getRegistrant', async (request, response) => {
    const JWT = request.query.JWT;

    if (!verifyJWT(JWT)) {
        response.status(403).send("Not authorised");
    } else {
        const registrant_ID = request.query.registrant_ID;
        const sqlSelectCmd = 'SELECT *, ' +
                  '"Notes1"."note" AS "subjuvenile_note", ' +
                  '"Notes2"."note" AS "juvenile_note", ' +
                  '"Notes3"."note" AS "junior_note", ' +
                  '"Notes4"."note" AS "youth_note", ' +
                  '"Notes5"."note" AS "adult_note", ' +
                  '"Notes6"."note" AS "masters1_note", ' +
                  '"Notes7"."note" AS "masters2_note", ' +
                  '"Notes8"."note" AS "masters3_note", ' +
                  '"Notes9"."note" AS "masters4_note", ' +
                  '"Notes10"."note" AS "masters5_note" ' +
              'FROM "Registrant" ' +
                  'LEFT JOIN "Notes" AS "Notes1" ON "Notes1"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes1"."note_ID" = 1 ' +
                  'LEFT JOIN "Notes" AS "Notes2" ON "Notes2"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes2"."note_ID" = 2 ' +
                  'LEFT JOIN "Notes" AS "Notes3" ON "Notes3"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes3"."note_ID" = 3 ' +
                  'LEFT JOIN "Notes" AS "Notes4" ON "Notes4"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes4"."note_ID" = 4 ' +
                  'LEFT JOIN "Notes" AS "Notes5" ON "Notes5"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes5"."note_ID" = 5 ' +
                  'LEFT JOIN "Notes" AS "Notes6" ON "Notes6"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes6"."note_ID" = 6 ' +
                  'LEFT JOIN "Notes" AS "Notes7" ON "Notes7"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes7"."note_ID" = 7 ' +
                  'LEFT JOIN "Notes" AS "Notes8" ON "Notes8"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes8"."note_ID" = 8 ' +
                  'LEFT JOIN "Notes" AS "Notes9" ON "Notes9"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes9"."note_ID" = 9 ' +
                  'LEFT JOIN "Notes" AS "Notes10" ON "Notes10"."registrant_ID" = "Registrant"."registrant_ID" AND "Notes10"."note_ID" = 10 ' +
              'WHERE "Registrant"."registrant_ID" = ' + "'" + registrant_ID + "';";

        db.query(sqlSelectCmd, (err, result) => {
            if (!err) {
                if (result.rows[0] !== undefined) {
                    response.setHeader("Content-Type", "application/json");
                    response.status(200).json(result.rows[0]);
                } else {
                    response.status(404).send('Registrant not found');
                }
            } else {
                response.status(500).send('Returned error' + err);
                logmsg("/api/getRegistrant: returned error :" + err + "\n" +
                       "query: " + sqlSelectCmd);
            }
        });
    }
});

//
// MARK: getRegistrantByEmail()
// ============================
// Route to return an individual registrant record based on their email address. This
// routine does not require a JSON web token so it is only to be used during login.
//
app.get('/api/getRegistrantByEmail', async (request, response) => {
    const email_address = request.query.email_address;
    const sqlSelectCmd = 'SELECT * FROM "Registrant" WHERE "email_address" = ' + "'" + email_address + "';";
    db.query(sqlSelectCmd, (err, result) => {
        if (!err) {
            if (result.rows[0] !== undefined) {
                response.status(200).json(result.rows[0]);
            } else {
                response.status(404).send('Registrant not found');
            }
        } else {
            response.status(500).send('Returned error' + err);
            logmsg("/api/getRegistrantByEmail returned error" + err + "\n" +
                   "query: " + sqlSelectCmd);
        }
    });
});

//
// MARK: getRegistrantList()
// =========================
// Obtains a list of registrants for use in search windows. The mode parameter supplied
// in the api by the front-end can be used to restrict the list returned.
//
app.get('/api/getRegistrantList', async (request, response) => {
   const JWT = request.query.JWT;
   const searchString = request.query.searchString;

   if (!verifyJWT(JWT)) {
      response.status(403).send("Not authorised");
   } else {
      const mode = request.query.mode;
      let sqlSelectCmd = "";

      switch (mode) {
         case "PR":
            // The list will only contain registrants who are Supervising Professionals.
            if (searchString !== "") {
               sqlSelectCmd = 'Select "registrant_ID", "first_name", "last_name", "email_address" from "Registrant" ' +
               'WHERE (("first_name" ILIKE ' + "'%" + searchString + "%' " +
                  'OR "last_name" ILIKE ' + "'%" + searchString + "%' " +
                  'OR "email_address" ILIKE ' + "'%" + searchString + "%' " +
                  'OR "registrant_ID" ILIKE ' + "'%" + searchString + "%') " +
                  'AND "registrant_type" = '+ "'PR') ORDER BY " + '"registrant_ID"';
            } else {
               sqlSelectCmd = 'Select "registrant_ID", "first_name", "last_name", "email_address" from "Registrant" ' +
                              'WHERE "registrant_type" = ' +
                              "'PR' ORDER BY " + '"registrant_ID"';            }
               break;

         case "GA":
            // The list will only contain registrants who are older than the guardian age (e.g. >16).
            if (searchString !== "") {
               sqlSelectCmd = 'Select "registrant_ID", "first_name", "last_name", "email_address" from "Registrant" ' +
                              'WHERE (("first_name" ILIKE ' + "'%" + searchString + "%' " +
                              'OR "last_name" ILIKE ' + "'%" + searchString + "%' " +
                              'OR "email_address" ILIKE ' + "'%" + searchString + "%' " +
                              'OR "registrant_ID" ILIKE ' + "'%" + searchString + "%') " +
                              "AND (CURRENT_DATE-date_of_birth)>=(16*365.25) ) " +
                              'ORDER BY "registrant_ID"';
            } else {
               sqlSelectCmd = 'Select "registrant_ID", "first_name", "last_name", "email_address" from "Registrant" ' +
                              'WHERE (CURRENT_DATE-date_of_birth)>=(16*365.25) ' +
                              'ORDER BY "registrant_ID"';
            }
            break;

         case "WC":
            // Free-form wildcard search for all registrants
            sqlSelectCmd = 'Select "registrant_ID", "first_name", "last_name", "email_address" from "Registrant" ' +
               'WHERE ("first_name" ILIKE ' + "'%" + searchString + "%' " +
               'OR "last_name" ILIKE ' + "'%" + searchString + "%' " +
               'OR "email_address" ILIKE ' + "'%" + searchString + "%' " +
               'OR "registrant_ID" ILIKE ' + "'%" + searchString + "%') " +
               'ORDER BY "registrant_ID"';

            //console.log(sqlSelectCmd);
            break;

         default:
            sqlSelectCmd = 'Select "registrant_ID", "first_name", "last_name", "email_address" from "Registrant" ORDER BY "registrant_ID"';
            break;
      }

      db.query(sqlSelectCmd, (err, result) => {
         if (!err) {
            if (result.rows[0] !== undefined) {
               response.status(200).json(result.rows);
            } else {
               response.status(404).send('No registrants were found');
            }
         } else {
            logmsg("getRegistrantList() returned an unexpected error" + err.message);
            response.status(500).send('Returned error' + err.message);
         }
      });
   }
});

//
// MARK: getAdministators
// ======================
// Creates a list of registrants who are administrators that can be used
// to manage who is and is not an
//
app.get('/api/getAdministrators', async (request, response) => {
    const JWT = request.query.JWT;

    if (!verifyJWT(JWT)) {
        response.status(403).send("Not authorised");
    } else {
        const sqlSelectCmd = 'Select "registrant_ID", "first_name", "last_name", "user_authority" from "Registrant" WHERE "user_authority"'
                                + "='A' ORDER BY " + '"registrant_ID"';
        db.query(sqlSelectCmd, (err, result) => {
            if (!err) {
                if (result.rows[0] !== undefined) {
                    response.status(200).json(result.rows);
                } else {
                    response.status(404).send('No administrators were found');
                }
            } else {
                logmsg("getAdministrators() returned an unexpected error" + err.message + "\n" +
                       "query " + sqlSelectCmd);
                response.status(500).send('Returned error' + err.message);
            }
        });
    }
});

//
// MARK: updateRegistrant()
// ========================
// Updates the data for an existing registrant record. The separate Age Group overide
// notes are updated via a transaction with commit and rollback.
//
app.put('/api/updateRegistrant', (request, response) => {
    const JWT = request.query.JWT;

    if (!verifyJWT(JWT)) {
        response.status(403).send("Not authorised");
    } else {
        const sqlUpdateCmd = 'DO $$\n' +
            'BEGIN \n' +
               'UPDATE "Registrant" SET ' +
               ' "user_authority" = ' + "'" + request.body.user_authority + "' , " +
               ' "password" = ' + "'" + request.body.password + "' , " +
               ' "password_status" = ' + "'" + request.body.password_status + "' , " +
               ' "salutation" = ' + "'" + request.body.salutation + "' , " +
               ' "first_name" = ' + "'" + request.body.first_name.replace(/'/g, "''") + "' , " +
               ' "middle_name" = ' + "'" + request.body.middle_name.replace(/'/g, "''") + "' , " +
               ' "last_name" = ' + "'" + request.body.last_name.replace(/'/g, "''") + "' , " +
               ' "gender" = ' + "'" + request.body.gender + "' , " +
               ' "pronouns" = ' + "'" + request.body.pronouns.replace(/'/g, "''") + "' , " +
               ' "phone_number" = ' + "'" + request.body.phone_number.replace(/'/g, "''") + "' , " +
               ' "email_address" = ' + "'" + request.body.email_address.replace(/'/g, "''") + "' , " +
               ' "address_1" = ' + "'" + request.body.address_1.replace(/'/g, "''") + "' , " +
               ' "address_2" = ' + "'" + request.body.address_2.replace(/'/g, "''") + "' , " +
               ' "address_3" = ' + "'" + request.body.address_3.replace(/'/g, "''") + "' , " +
               ' "suburb" = ' + "'" + request.body.suburb.replace(/'/g, "''") + "' , " +
               ' "city" = ' + "'" + request.body.city.replace(/'/g, "''") + "' ," +
               ' "postcode" = ' + "'" + request.body.postcode.replace(/'/g, "''") + "' ," +
               ' "country" = ' + "'" + request.body.country.replace(/'/g, "''") + "' ," +
               ' "date_of_birth" = ' + "'" + request.body.date_of_birth.replace(/'/g, "''") + "', " +
               ' "studio_name" = ' + "'" + request.body.studio_name.replace(/'/g, "''") + "', " +
               ' "newsletter" = ' + request.body.newsletter + ", " +
               ' "registrant_type" = ' + "'" + request.body.registrant_type + "', " +
               ' "is_pro_am" = ' + request.body.is_pro_am + ", " +
               ' "is_qualified_scrutineer" = ' + request.body.is_qualified_scrutineer + ", " +
               ' "registrant_status" = ' + "'" + request.body.registrant_status + "', " +
               ' "annual_reg_amt_paid" = ' + request.body.annual_reg_amt_paid + ", " +
               ' "annual_reg_date_paid" = ' + "'" + request.body.annual_reg_date_paid + "', " +
               ' "amateur_teacher" = ' + request.body.amateur_teacher + ", " +
               ' "teacher_status" = ' + "'" + request.body.teacher_status + "', " +
               ' "teacher_reg_amt_paid" = ' + request.body.teacher_reg_amt_paid + ", " +
               ' "teacher_reg_date_paid" = ' + "'" + request.body.teacher_reg_date_paid + "', " +
               ' "teacher_approval_date" = ' + "'" + request.body.teacher_approval_date + "', " +
               ' "supervising_professional_ID" = ' + "'" + request.body.supervising_professional_ID.replace(/'/g, "''") +  "', " +
               ' "supervising_professional_name" = ' + "'" + request.body.supervising_professional_name.replace(/'/g, "''") + "', " +
               ' "supervising_professional_phone" = ' + "'" + request.body.supervising_professional_phone.replace(/'/g, "''") + "', " +
               ' "supervising_professional_email_address" = ' + "'" + request.body.supervising_professional_email_address.replace(/'/g, "''") + "' , " +

               ' "ag_sub_juvenile" = ' + request.body.ag_sub_juvenile + " , " +
               ' "ag_sub_juvenile_override" = ' + request.body.ag_sub_juvenile_override + " , " +
               ' "ag_juvenile" = ' + request.body.ag_juvenile + " , " +
               ' "ag_juvenile_override" = ' + request.body.ag_juvenile_override + " , " +
               ' "ag_junior" = ' + request.body.ag_junior + " , " +
               ' "ag_junior_override" = ' + request.body.ag_junior_override + " , " +
               ' "ag_youth" = ' + request.body.ag_youth + " , " +
               ' "ag_youth_override" = ' + request.body.ag_youth_override + " , " +
               ' "ag_adult" = ' + request.body.ag_adult + " , " +
               ' "ag_adult_override" = ' + request.body.ag_adult_override + " , " +
               ' "ag_masters_1" = ' + request.body.ag_masters_1 + " , " +
               ' "ag_masters_1_override" = ' + request.body.ag_masters_1_override + " , " +
               ' "ag_masters_2" = ' + request.body.ag_masters_2 + " , " +
               ' "ag_masters_2_override" = ' + request.body.ag_masters_2_override + " , " +
               ' "ag_masters_3" = ' + request.body.ag_masters_3 + " , " +
               ' "ag_masters_3_override" = ' + request.body.ag_masters_3_override + " , " +
               ' "ag_masters_4" = ' + request.body.ag_masters_4 + " , " +
               ' "ag_masters_4_override" = ' + request.body.ag_masters_4_override + " , " +
               ' "ag_masters_5" = ' + request.body.ag_masters_5 + " , " +
               ' "ag_masters_5_override" = ' + request.body.ag_masters_5_override + " , " +

               ' "ag_reg_br_grade" = ' + "'" + request.body.ag_reg_br_grade.replace(/'/g, "''") + "', " +
               ' "ag_reg_br_wins" = ' + request.body.ag_reg_br_wins + ', ' +
               ' "ag_pa_br_grade" = ' + "'"  + request.body.ag_pa_br_grade.replace(/'/g, "''") + "', " +
               ' "ag_pa_br_wins" = ' + request.body.ag_pa_br_wins + ', ' +
               ' "ag_sl_br_grade" = ' + "'"  + request.body.ag_sl_br_grade.replace(/'/g, "''") + "', " +
               ' "ag_sl_br_wins" = ' + request.body.ag_sl_br_wins + ', ' +
               ' "ag_nr_br_qwins" = ' + "'"  + request.body.ag_nr_br_qwins.replace(/'/g, "''") + "', " +

               ' "ag_reg_la_grade" = ' + "'"  + request.body.ag_reg_la_grade.replace(/'/g, "''") + "', " +
               ' "ag_reg_la_wins" = ' + request.body.ag_reg_la_wins + ', ' +
               ' "ag_pa_la_grade" = ' + "'"  + request.body.ag_pa_la_grade.replace(/'/g, "''") + "', " +
               ' "ag_pa_la_wins" = ' + request.body.ag_pa_la_wins + ', ' +
               ' "ag_sl_la_grade" = ' + "'"  + request.body.ag_sl_la_grade.replace(/'/g, "''") + "', " +
               ' "ag_sl_la_wins" = ' + request.body.ag_sl_la_wins + ', ' +
               ' "ag_nr_la_qwins" = ' + "'"  + request.body.ag_nr_la_qwins.replace(/'/g, "''") + "', " +

               ' "ag_reg_nv_grade" = ' + "'" + request.body.ag_reg_nv_grade.replace(/'/g, "''") + "', " +
               ' "ag_reg_nv_wins" = ' + request.body.ag_reg_nv_wins + ', ' +
               ' "ag_pa_nv_grade" = ' + "'" + request.body.ag_pa_nv_grade.replace(/'/g, "''") + "', " +
               ' "ag_pa_nv_wins" = ' + request.body.ag_pa_nv_wins + ', ' +
               ' "ag_sl_nv_grade" = ' + "'" + request.body.ag_sl_nv_grade.replace(/'/g, "''") + "', " +
               ' "ag_sl_nv_wins" = ' + request.body.ag_sl_nv_wins + ', ' +
               ' "ag_nr_nv_qwins" = ' + "'" + request.body.ag_nr_nv_qwins.replace(/'/g, "''") + "', " +

               ' "ag_reg_cs_grade" = ' + "'" + request.body.ag_reg_cs_grade.replace(/'/g, "''") + "', " +
               ' "ag_reg_cs_wins" = ' + request.body.ag_reg_cs_wins + ', ' +
               ' "ag_pa_cs_grade" = ' + "'" + request.body.ag_pa_cs_grade.replace(/'/g, "''") + "', " +
               ' "ag_pa_cs_wins" = ' + request.body.ag_pa_cs_wins + ', ' +
               ' "ag_sl_cs_grade" = ' + "'" + request.body.ag_sl_cs_grade.replace(/'/g, "''") + "', " +
               ' "ag_sl_cs_wins" = ' + request.body.ag_sl_cs_wins + ', ' +
               ' "ag_nr_cs_qwins" = ' + "'" + request.body.ag_nr_cs_qwins.replace(/'/g, "''") + "', " +

               ' "ag_reg_as_grade" = ' + "'" + request.body.ag_reg_as_grade.replace(/'/g, "''") + "', " +
               ' "ag_reg_as_wins" = ' + request.body.ag_reg_as_wins + ', ' +
               ' "ag_pa_as_grade" = ' + "'" + request.body.ag_pa_as_grade.replace(/'/g, "''") + "', " +
               ' "ag_pa_as_wins" = ' + request.body.ag_pa_as_wins + ', ' +
               ' "ag_sl_as_grade" = ' + "'" + request.body.ag_sl_as_grade.replace(/'/g, "''") + "', " +
               ' "ag_sl_as_wins" = ' + request.body.ag_sl_as_wins + ', ' +
               ' "ag_nr_as_qwins" = ' + "'" + request.body.ag_nr_as_qwins.replace(/'/g, "''") + "', " +

               ' "ag_reg_ar_grade" = ' + "'" + request.body.ag_reg_ar_grade.replace(/'/g, "''") + "', " +
               ' "ag_reg_ar_wins" = ' + request.body.ag_reg_ar_wins + ', ' +
               ' "ag_pa_ar_grade" = ' + "'" + request.body.ag_pa_ar_grade.replace(/'/g, "''") + "', " +
               ' "ag_pa_ar_wins" = ' + request.body.ag_pa_ar_wins + ', ' +
               ' "ag_sl_ar_grade" = ' + "'" + request.body.ag_sl_ar_grade.replace(/'/g, "''") + "', " +
               ' "ag_sl_ar_wins" = ' + request.body.ag_sl_ar_wins + ', ' +
               ' "ag_nr_ar_qwins" = ' + "'" + request.body.ag_nr_ar_qwins.replace(/'/g, "''") + "' ," +

               ' "nz_qualified_professional" = ' + request.body.nz_qualified_professional + ', ' +
               ' "nz_qualified_scrutineer" = ' + request.body.nz_qualified_scrutineer + ', ' +
               ' "int_qualified_professional" = ' + request.body.int_qualified_professional + ', ' +
               ' "int_qualified_scrutineer" = ' + request.body.int_qualified_scrutineer + ', ' +
               ' "int_country_qualified" = ' + "'" + request.body.int_country_qualified.replace(/'/g, "''") + "', " +
               ' "wdc_dancer" = '      + request.body.wdc_dancer + ", " +
               ' "wdc_adjudicator" = ' + request.body.wdc_adjudicator + ", " +
               ' "wdc_chairperson" = ' + request.body.wdc_chairperson + ", " +
               ' "wdo_dancer" = '      + request.body.wdo_dancer + ", " +
               ' "wdo_adjudicator" = ' + request.body.wdo_adjudicator + ", " +
               ' "wdo_chairperson" = ' + request.body.wdo_chairperson + ", " +

               ' "psl_br" = ' + "'" + request.body.psl_br + "', " +
               ' "psl_adjudicator_br" = ' + "'" + request.body.psl_adjudicator_br + "', " +
               ' "psl_la" = ' + "'" + request.body.psl_la + "', " +
               ' "psl_adjudicator_la" = ' + "'" + request.body.psl_adjudicator_la + "', " +
               ' "psl_nv" = ' + "'" + request.body.psl_nv + "', " +
               ' "psl_adjudicator_nv" = ' + "'" + request.body.psl_adjudicator_nv + "', " +
               ' "psl_cs" = ' + "'" + request.body.psl_cs + "', " +
               ' "psl_adjudicator_cs" = ' + "'" + request.body.psl_adjudicator_cs + "', " +
               ' "psl_as" = ' + "'" + request.body.psl_as + "', " +
               ' "psl_adjudicator_as" = ' + "'" + request.body.psl_adjudicator_as + "', " +
               ' "psl_ar" = ' + "'" + request.body.psl_ar + "', " +
               ' "psl_adjudicator_ar" = ' + "'" + request.body.psl_adjudicator_ar + "', " +

               ' "guardian_ID" = ' + "'" + request.body.guardian_ID.replace(/'/g, "''") + "', " +
               ' "guardian_name" = ' + "'" + request.body.guardian_name.replace(/'/g, "''") + "', " +
               ' "guardian_phone" = ' + "'" + request.body.guardian_phone.replace(/'/g, "''") + "', " +
               ' "guardian_email_address" = ' + "'" + request.body.guardian_email_address.replace(/'/g, "''") + "'" +

               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.subjuvenile_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'1';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.juvenile_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'2';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.junior_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'3';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.youth_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'4';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.adult_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'5';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.masters1_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'6';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.masters2_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'7';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.masters3_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'8';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.masters4_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'9';\n" +

               ' UPDATE "Notes" SET "note_type" = ' + "'O', " +
               ' "note" = ' + "'" + request.body.masters5_note.replace(/'/g, "''") + "' " +
               ' WHERE "registrant_ID" = ' + "'" + request.body.id + "'" + ' AND "note_ID" = ' + "'10';\n" +

            'EXCEPTION\n ' +
               'WHEN OTHERS THEN\n' +
                  'ROLLBACK\n; ' +
            'END; $$\n';

         db.query(
            sqlUpdateCmd, (err, result) => {
               if (!err) {
                  response.status(200).send("/api/updateRegistrant: Registrant updated.");
               } else {
                  response.status(500).send("/api/updateRegistrant: Unexpected error " + err.message);
                  logmsg("/api/updateRegistrant() returned an unexpected error :" + err.message + "\n" +
                         "query: " + sqlUpdateCmd);
               }
            }
         );
      }
});

//
// MARK: insertRegistrant()
// ========================
// Creates a new registrant record. The separate Age Group overide notes are created via a
// transaction with commit and rollback.
//
app.put('/api/insertRegistrant', (request, response) => {
    const JWT = request.query.JWT;
    if (!verifyJWT(JWT)) {
        response.status(403).send("Not authorised");
    } else {
        const sqlInsertCmd = 'DO $$\n' +
            'BEGIN \n' +
               'INSERT INTO "Registrant" (' +
                     ' "registrant_ID", "user_authority", "password",'  +
                     ' "salutation", "first_name", "middle_name", "last_name", "gender",' +
                     ' "pronouns", "phone_number", "email_address", "address_1", "address_2", "address_3",' +
                     ' "suburb", "city", "postcode", "country", "date_of_birth", "studio_name", "newsletter", "registrant_type",' +
                     ' "is_pro_am", "is_qualified_scrutineer", ' +
                     ' "registrant_status", "annual_reg_amt_paid", "annual_reg_date_paid", "amateur_teacher",' +
                     ' "teacher_status", "teacher_reg_amt_paid", "teacher_reg_date_paid", "teacher_approval_date", ' +
                     ' "supervising_professional_ID" , "supervising_professional_name", "supervising_professional_phone" ,' +
                     ' "supervising_professional_email_address", ' +

                     ' "ag_sub_juvenile", "ag_sub_juvenile_override", "ag_juvenile", "ag_juvenile_override", "ag_junior", "ag_junior_override", ' +
                     ' "ag_youth", "ag_youth_override", "ag_adult", "ag_adult_override", "ag_masters_1", "ag_masters_1_override", "ag_masters_2", ' +
                     ' "ag_masters_2_override", "ag_masters_3", "ag_masters_3_override", "ag_masters_4", "ag_masters_4_override", "ag_masters_5", ' +
                     ' "ag_masters_5_override", "ag_reg_br_grade" , "ag_reg_br_wins" , "ag_pa_br_grade", "ag_pa_br_wins", "ag_sl_br_grade", "ag_sl_br_wins", ' +
                     ' "ag_nr_br_qwins", "ag_reg_la_grade", "ag_reg_la_wins" , "ag_pa_la_grade", "ag_pa_la_wins", "ag_sl_la_grade", "ag_sl_la_wins", ' +
                     ' "ag_nr_la_qwins", "ag_reg_nv_grade", "ag_reg_nv_wins",  "ag_pa_nv_grade", "ag_pa_nv_wins", "ag_sl_nv_grade", "ag_sl_nv_wins", ' +
                     ' "ag_nr_nv_qwins", "ag_reg_cs_grade", "ag_reg_cs_wins", "ag_pa_cs_grade", "ag_pa_cs_wins", "ag_sl_cs_grade", "ag_sl_cs_wins", ' +
                     ' "ag_nr_cs_qwins", "ag_reg_as_grade", "ag_reg_as_wins", "ag_pa_as_grade", "ag_pa_as_wins", "ag_sl_as_grade", "ag_sl_as_wins", ' +
                     ' "ag_nr_as_qwins", "ag_reg_ar_grade", "ag_reg_ar_wins", "ag_pa_ar_grade", "ag_pa_ar_wins", "ag_sl_ar_grade", "ag_sl_ar_wins", ' +
                     ' "ag_nr_ar_qwins", ' +

                     ' "nz_qualified_professional", "nz_qualified_scrutineer", "int_qualified_professional", "int_qualified_scrutineer", "int_country_qualified", ' +
                     ' "wdc_dancer", "wdc_adjudicator" , "wdc_chairperson", "wdo_dancer", "wdo_adjudicator" , "wdo_chairperson", ' +
                     ' "psl_br", "psl_adjudicator_br", "psl_la", "psl_adjudicator_la", "psl_nv", "psl_adjudicator_nv", "psl_cs", ' +
                     ' "psl_adjudicator_cs", "psl_as", "psl_adjudicator_as", "psl_ar", "psl_adjudicator_ar", ' +

                     ' "guardian_ID", "guardian_name", "guardian_phone", "guardian_email_address" ' +

                     ') VALUES (' +
                     "'" + request.body.id + "' , " +
                     "'" + request.body.user_authority + "' , " +
                     "'" + request.body.password + "' , " +
                     "'" + request.body.salutation + "' , " +
                     "'" + request.body.first_name.replace(/'/g, "''") + "' , " +
                     "'" + request.body.middle_name.replace(/'/g, "''") + "' , " +
                     "'" + request.body.last_name.replace(/'/g, "''") + "' , " +
                     "'" + request.body.gender.replace(/'/g, "''") + "' , " +
                     "'" + request.body.pronouns.replace(/'/g, "''") + "' , " +
                     "'" + request.body.phone_number.replace(/'/g, "''") + "' , " +
                     "'" + request.body.email_address.replace(/'/g, "''") + "' , " +
                     "'" + request.body.address_1.replace(/'/g, "''") + "' , " +
                     "'" + request.body.address_2.replace(/'/g, "''") + "' , " +
                     "'" + request.body.address_3.replace(/'/g, "''") + "' , " +
                     "'" + request.body.suburb.replace(/'/g, "''") + "' , " +
                     "'" + request.body.city.replace(/'/g, "''") + "' ," +
                     "'" + request.body.postcode.replace(/'/g, "''") + "' ," +
                     "'" + request.body.country.replace(/'/g, "''") + "' ," +
                     "'" + request.body.date_of_birth + "', " +
                     "'" + request.body.studio_name.replace(/'/g, "''") + "', " +
                           request.body.newsletter + ", " +
                     "'" + request.body.registrant_type + "', " +
                        request.body.is_pro_am + ", " +
                        request.body.is_qualified_scrutineer + ", " +
                     "'" + request.body.registrant_status + "', " +
                        request.body.annual_reg_amt_paid + ", " +
                     "'" + request.body.annual_reg_date_paid + "', " +
                        request.body.amateur_teacher + ", " +
                     "'" + request.body.teacher_status + "', " +
                        request.body.teacher_reg_amt_paid + ", " +
                     "'" + request.body.teacher_reg_date_paid + "' , " +
                     "'" + request.body.teacher_approval_date + "', " +
                     "'" + request.body.supervising_professional_ID.replace(/'/g, "''") + "', " +
                     "'" + request.body.supervising_professional_name.replace(/'/g, "''") + "', " +
                     "'" + request.body.supervising_professional_phone.replace(/'/g, "''") + "', " +
                     "'" + request.body.supervising_professional_email_address.replace(/'/g, "''") + "', " +

                        request.body.ag_sub_juvenile + " , " +
                        request.body.ag_sub_juvenile_override + " , " +
                        request.body.ag_juvenile + " , " +
                        request.body.ag_juvenile_override + " , " +
                        request.body.ag_junior + " , " +
                        request.body.ag_junior_override + " , " +
                        request.body.ag_youth + " , " +
                        request.body.ag_youth_override + " , " +
                        request.body.ag_adult + " , " +
                        request.body.ag_adult_override + " , " +
                        request.body.ag_masters_1 + " , " +
                        request.body.ag_masters_1_override + " , " +
                        request.body.ag_masters_2 + " , " +
                        request.body.ag_masters_2_override + " , " +
                        request.body.ag_masters_3 + " , " +
                        request.body.ag_masters_3_override + " , " +
                        request.body.ag_masters_4 + " , " +
                        request.body.ag_masters_4_override + " , " +
                        request.body.ag_masters_5 + " , " +
                        request.body.ag_masters_5_override + " , " +

                        "'" + request.body.ag_reg_br_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_reg_br_wins + " , " +
                        "'" + request.body.ag_pa_br_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_pa_br_wins + " , " +
                        "'" + request.body.ag_sl_br_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_sl_br_wins + " , " +
                        "'" + request.body.ag_nr_br_qwins.replace(/'/g, "''") + "' , " +

                        "'" + request.body.ag_reg_la_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_reg_la_wins + " , " +
                        "'" + request.body.ag_pa_la_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_pa_la_wins + " , " +
                        "'" + request.body.ag_sl_la_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_sl_la_wins + " , " +
                        "'" + request.body.ag_nr_la_qwins.replace(/'/g, "''") + "' , " +

                        "'" + request.body.ag_reg_nv_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_reg_nv_wins + " , " +
                        "'" + request.body.ag_pa_nv_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_pa_nv_wins + " , " +
                        "'" + request.body.ag_sl_nv_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_sl_nv_wins + " , " +
                        "'" + request.body.ag_nr_nv_qwins.replace(/'/g, "''") + "' , " +

                        "'" + request.body.ag_reg_cs_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_reg_cs_wins + " , " +
                        "'" + request.body.ag_pa_cs_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_pa_cs_wins + " , " +
                        "'" + request.body.ag_sl_cs_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_sl_cs_wins + " , " +
                        "'" + request.body.ag_nr_cs_qwins.replace(/'/g, "''") + "' , " +

                        "'" + request.body.ag_reg_as_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_reg_as_wins + " , " +
                        "'" + request.body.ag_pa_as_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_pa_as_wins + " , " +
                        "'" + request.body.ag_sl_as_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_sl_as_wins + " , " +
                        "'" + request.body.ag_nr_as_qwins.replace(/'/g, "''") + "' , " +

                        "'" + request.body.ag_reg_ar_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_reg_ar_wins + " , " +
                        "'" + request.body.ag_pa_ar_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_pa_ar_wins + " , " +
                        "'" + request.body.ag_sl_ar_grade.replace(/'/g, "''") + "' , " +
                        request.body.ag_sl_ar_wins + " , " +
                        "'" + request.body.ag_nr_ar_qwins.replace(/'/g, "''") + "' , " +

                        request.body.nz_qualified_professional + " , " +
                        request.body.nz_qualified_scrutineer + " , " +
                        request.body.int_qualified_professional + " , " +
                        request.body.int_qualified_scrutineer + " , " +
                        "'" + request.body.int_country_qualified.replace(/'/g, "''") + "' , " +

                        request.body.wdc_dancer + ", " +
                        request.body.wdc_adjudicator + ", " +
                        request.body.wdc_chairperson + ", " +
                        request.body.wdo_dancer + ", " +
                        request.body.wdo_adjudicator + ", " +
                        request.body.wdo_chairperson + ", " +

                        "'" + request.body.psl_br + "' , " +
                        "'" + request.body.psl_adjudicator_br + "' , " +
                        "'" + request.body.psl_la + "' , " +
                        "'" + request.body.psl_adjudicator_la + "' , " +
                        "'" + request.body.psl_nv + "' , " +
                        "'" + request.body.psl_adjudicator_nv + "' , " +
                        "'" + request.body.psl_cs + "' , " +
                        "'" + request.body.psl_adjudicator_cs + "' , " +
                        "'" + request.body.psl_as + "' , " +
                        "'" + request.body.psl_adjudicator_as + "' , " +
                        "'" + request.body.psl_ar + "' , " +
                        "'" + request.body.psl_adjudicator_ar + "' , " +

                        "'" + request.body.guardian_ID.replace(/'/g, "''") + "' , " +
                        "'" + request.body.guardian_name.replace(/'/g, "''") + "' , " +
                        "'" + request.body.guardian_phone.replace(/'/g, "''") + "' , " +
                        "'" + request.body.guardian_email_address.replace(/'/g, "''") + "'" +
                     ");\n" +

                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note") '+
                                 'VALUES ( + ' + request.body.id + ",1, 'O', '" + request.body.subjuvenile_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",2, 'O', '" + request.body.juvenile_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",3, 'O', '" + request.body.junior_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",4, 'O', '" + request.body.youth_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",5, 'O', '" + request.body.adult_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",6, 'O', '" + request.body.masters1_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",7, 'O', '" + request.body.masters2_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",8, 'O', '" + request.body.masters3_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",9, 'O', '" + request.body.masters4_note + "');\n" +
                     'INSERT INTO "Notes" ("registrant_ID", "note_ID", "note_type", "note")\n'+
                                 'VALUES ( + ' + request.body.id + ",10, 'O', '" + request.body.masters5_note + "');\n" +

            'EXCEPTION\n ' +
               'WHEN OTHERS THEN\n' +
                  'ROLLBACK\n; ' +
            'END; $$\n';

            db.query(sqlInsertCmd, (err, result) => {
                if (!err) {
                    response.status(200).send("Registrant was inserted.");
                } else {
                    response.status(500).send("insertRegistrant() returned an unexpected error: " + err.message);
                    logmsg("/api/insertRegistrant: Unexpected error: " + err + "\n" + result + "\n" +
                           "query: " + sqlUpdateCmd);
                }
            }
        )
    }
});

//
// MARK: getConfiguration()
// ========================
app.get("/api/getConfiguration", async (request, response) => {
    const JWT = request.query.JWT;

    if (!verifyJWT(JWT)) {
        response.status(403).send("Not authorised");
    } else {
        const sqlSelectCmd = 'SELECT * FROM "Configuration" WHERE "config_ID" = 1';
        db.query(sqlSelectCmd, (err, result) => {
            if (!err) {
                if (result.rows[0] !== undefined) {
                    response.setHeader("Content-Type", "application/json");
                    response.status(200).json(result.rows[0]);
                } else {
                    response.status(404).send("Configuration not found");
                }
            } else {
                logmsg("/api/getConfiguration returned an unexpected error :" + err + " " + result +
                       "query: " + sqlSelectCmd);
                response.status(500).send("/api/getConfiguration returned error" + err);
            }
        });
    }
});

//
// MARK: updateConfiguration()
// ===========================
app.put("/api/updateConfiguration", (request, response) => {
    const JWT = request.query.JWT;
    if (!verifyJWT(JWT)) {
        response.status(403).send("Not authorised");
    } else {
        const sqlUpdateCmd = 'UPDATE "Configuration" SET ' +
            ' "config_ID" = ' + request.body.config_ID + " , " +
            ' "lw_sub_juvenile_age" = ' + request.body.lw_sub_juvenile_age + ", " +
            ' "up_sub_juvenile_age" = ' + request.body.up_sub_juvenile_age + ", " +
            ' "lw_juvenile_age" = ' + request.body.lw_juvenile_age + ", " +
            ' "up_juvenile_age" = ' + request.body.up_juvenile_age + ", " +
            ' "lw_junior_age" = ' + request.body.lw_junior_age + ", " +
            ' "up_junior_age" = ' + request.body.up_junior_age + ", " +
            ' "lw_youth_age" = ' + request.body.lw_youth_age + ", " +
            ' "up_youth_age" = ' + request.body.up_youth_age + ", " +
            ' "lw_adult_age" = ' + request.body.lw_adult_age + ", " +
            ' "up_adult_age" = ' + request.body.up_adult_age + ", " +
            ' "lw_masters_1_age" = ' + request.body.lw_masters_1_age + ", " +
            ' "up_masters_1_age" = ' + request.body.up_masters_1_age + ", " +
            ' "lw_masters_2_age" = ' + request.body.lw_masters_2_age + ", " +
            ' "up_masters_2_age" = ' + request.body.up_masters_2_age + ", " +
            ' "lw_masters_3_age" = ' + request.body.lw_masters_3_age + ", " +
            ' "up_masters_3_age" = ' + request.body.up_masters_3_age + ", " +
            ' "lw_masters_4_age" = ' + request.body.lw_masters_4_age + ", " +
            ' "up_masters_4_age" = ' + request.body.up_masters_4_age + ", " +
            ' "lw_masters_5_age" = ' + request.body.lw_masters_5_age + ", " +
            ' "up_masters_5_age" = ' + request.body.up_masters_5_age +
        ' WHERE "config_ID" = 1';

         db.query(
            sqlUpdateCmd, (err, result) => {
                if (!err) {
                    response.status(200).send("/api/updateConfiguration updated.");
                } else {
                    logmsg("/api/updateConfiguration returned an unexpected error :" + err + " " + result + "\n" +
                           "query: " + sqlUpdateCmd);
                    response.status(500).send("\nConfiguration update returned an unexpected error: " + err);
                }
            }
        )
    }
});
