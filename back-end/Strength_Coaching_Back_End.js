//
// STRENGTH COACHING ONLINE EXPRESS BACK-END
// =========================================
// This back-end server has been implemented with Express with Node.js. This provides the
// API Routes needed between the React Front-End of the Strength Coaching Online
// application and the ProgreSQL database that stores the database. 
//
// Documentation
// =============
// Full documentation for the server is available in the Strength Coaching Online
// documentation folder. This is available in the Github Repository: 
//
//         https://github.com/badger-dowdeswell/strength_coaching.git 
// 
// Installing the Back-End server
// ==============================
// The complete list of dependencies can be found in package.json in the "dependencies"
// and "dev-dependencies" section. The current version requires Node.js v24.0.2 or higher.
// Install it with:
//
//     npm install -g npm@latest 
//
// The back-end requires express and the express-fileupload packages. Install them with: 
//
//     npm install express express-fileupload
//
// When running this alongside a front-end written in the Vite framework, you can add
// the script command:
//
//    "dev": nodemon --env-file=sr.env Strength_Coaching_Back_End.js 
//
// to the "scripts" section of package.json. This means the command can be used to restart
// the back-end automatically each time the code changes during development. Parameters 
// specific to the server are stored in the sr.env file which must be loaded using the
// command --env-file=sr.env shown in the "dev" command above.
//
// Shutting down processes
// =======================
// Sometimes, the back-end Node process shuts down but does not release the port it is 
// running on. The lsof (linux show (list) open files) command is one way to identify 
// if the port (which is really just another file in Linux) is still connected. This
// back-end is running on port 3010 so tell lsof to only display processes on that port:
//
//    sudo lsof -i :3010   which gives and output like this:
//
//    COMMAND     PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
//    MainThrea 44866 badger   22u  IPv6 315170      0t0  TCP *:3010 (LISTEN)
//
// In this example, the port is open via process specified in the PID 44866 as shown 
// in the second column. Shut it down with a kill command and then restart the back-end
// normally:
//
//    kill -9 44866
//    npm run dev
//
// Revision History
// ================
// 26.01.2023 BRD Original version.
// 12.02.2023 BRD Implemented JSON Web Token authentication and authorisation.
// 24.02.2023 BRD Upgraded all routes to check for proper authorisation by verifing
//                JSON Web Tokens (JWTs). Also added encryption to the user's
//                password authentication.
//                Changed the listener port for the back-end to be 3010 so that
//                it does not conflict with other back-ends on the same server.
// 15.01.2025 BRD Updated the original version to work with Strength Research
//                Online. This will probably be used to later re-create Strength
//                Coaching Online.
// 18.01.2025 BRD Refactored the authenticateUser function so it is case-insensitive
//                when searching by email address. It can also search by the user
//                alias now.
// 01.02.2025 BRD Created the createUser API.
// 23.03.2025 BRD Added the getUser API.// 
// 15.05.2025 BRD Created environment management functionality using a .env file.
// 15.05.2025 BRD Updated to Nod.js v24.0.2 to improve environment support. The new
//                release no longer requires additional packages to be imported since
//                the environment process object is now native in running Node applications.
// 28.05.2025 BRD Cloned the new Strength Coaching Online back end from the original Strength
//                Research Online back end.
// 12.08.2025 BRD Added support for the User table field user_image.
// 13.08.2025 BRD Added the uploadFile api to allow images and other resources to be posted
//                to the server via the back-end and saved in predefined locations.
// 29.08.2025 BRD Changes to the updateUser API to allow the user to supply a new password during
//                the update which gets encrypted and stored.
// 02.09.2025 BRD Added the API to send emails using Nodemailer.
// 09.09.2025 BRD Deprecated the second copy of the /api/getUser API. The Node/Express documentation
//                explains that Express routes are matched sequentially, so the first matching route
//                in the program will always handle the request. The second API of the same name does
//                not generate an error but it will never be called.
// 10.09.2025 BRD Implemented a shutdown() process to process the SIGINT and SIGTERM commands when the
//                Back-End is being shut down. 
//                Added the getToken API that generates a unique token with an expiry time. This can 
//                be used to identify a user that is trying to reset their password. 
//
import express from 'express';
const app = express();

const version = 1.03;

//
// multer()
// ========
// Multi-File Upload (multer) configuration for image and other resource files uploaded
// to this server. User images are stored in the front-end/userImages directory. They can
// be served as public static files from here so the front-end can display them. Vite
// ensures that they are treated as public objects.
//
import multer from 'multer';
const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, process.cwd() + "/../front-end/userImages/");     
    },
    filename: (request, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({storage});

import cors from 'cors';
import pg from 'pg';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = "Obtuse*10149#Yeti";
const JWT_EXPIRES_IN = {expiresIn: '1d'};
const BCRYPT_SALT = 10; // This sets a ten-cycle salt for use by bcrypt when
                        // encrypting users password.
//
// CORS
// ====
// cors is a node.js package that Express uses for Cross-Origin Resource
// sharing (CORS). This is a mechanism that allows restricted resources on
// a web page to be requested from another domain outside the domain
// from which the first resource was served.
// see: https://expressjs.com/en/resources/middleware/cors.html
//
app.use(cors());

// Ensure the server can process JSON-encoded data.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// The TCP port the Back-End will listen on for HTTP requests 
// from the front-end.
const PORT = process.env.TCP_PORT;

//
// Email Transporter
// =================
// The back-end provides email support through a custom API that uses
// the Nodemailer (nodemailer.com) library. The transporter object object
// allows the API to encode the email content and then access SMTP functions
// to send the email. Additional documentation about authentication is here:
//
//   https://nodemailer.com/smtp and https://dkimvalidator.com/ 
//
// dig TXT zmail_domainkey strengthresearch.online 
//
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    dkim: {
        domainName: "strengthresearch.online",
        keySelector: "zmail_domainkey"        
    },
    tls: {
        ciphers: "SSLv3",
        // do not fail if the server certificate is invalid.
        rejectUnauthorized: false,
    },
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
}); 

//
// logmsg()
// ========
// Writes a date and time stamped log message to record errors.
//
// RA_Badger - need to add data and time and write to a permanent log file...
//
function logmsg(msg) {
    console.log("\n" + msg);
}

//
// Create connection pool
// ======================
// The back-end communicates with the ProgreSQL database by using a Pool object.
// It allows it to have a reusable pool of clients it can check out, use, and
// return. In the code below, the name of the pool used in this back-end
// is "db". Refer to https://node-postgres.com/features/pooling for more
// information.
//
const Pool = pg.Pool;
const db = new Pool({
   database: process.env.DATABASE,
   port: process.env.PORT,
   host: process.env.HOST,
   user: process.env.USER,
   password: process.env.DB_PASSWORD,   
});

//
// app.listen()
// ============
// Reports that the back-end is listening when the server starts.
//
const server = app.listen(PORT, () => {     
    var dt = new Date();
    logmsg("\nThe Strength Research Online Back-End version " + version +
           " is\nnow listening on port " + PORT + ". It was started on " +
            dt.toLocaleDateString() + "\nat " + dt.toLocaleTimeString() + 
            " using local environment sr.env.\n");
});

//
// shutdown()
// ==========
// Intercepts the SIGTERM and SIGTERM commands and proceeds to shutdown the
// Back-End processes gracefully. This should release any TCP ports that were
// opened by the process.
//
process.on('SIGTERM', () => {
    console.log('\nHTTP server closing.\n');
});

process.on('SIGINT', () => {
    server.close(() => {
    })    
    console.log('\nHTTP server closed.');       
    process.exit();    
});

//
// getToken()
// ==========
// This function generates and returns a JSON Web Token (JWT)
// that contains a hashed user ID and an expiry time specified
// by the calling function. It uses the same JTW secret as the
// other token-generating functions in this back-end. When re-
// submitted later, it can be verified using the verifyToken() 
// function to ensure it has not timed out.
//
app.get('/api/getToken', async(request, response) => {
    const user_ID = request.query.user_ID;
    const expiry_time = request.query.expiry_time

    jwt.sign({user_ID}, JWT_SECRET, expiry_time, (err, token) => {
        if (!err) {
            const packet = {token: token};
            response.status(200).send(packet);
        } else {
            response.status(500).json({err});
        }
    });
});  

// 
// verifyToken()
// =============
app.get('/api/verifyToken', async(request, response) => {
    logmsg('/api/verifyToken ' + request.query.registration_token);    
    const registration_token = request.query.registration_token;    
    if (verifyJWT(registration_token)) {
        logmsg('/api/verifyToken verified');
        response.status(200).send("verified");
    } else {
        logmsg('/api/verifyToken not verified');
        response.status(500).send("not verified");    
    };
});  

//
// verifyJWT()
// ===========
// Verifies that the JSON Web Token supplied in the request to a route
// is signed correctly.
//
function verifyJWT(JWT) {
    let status = false;
    jwt.verify(JWT, JWT_SECRET, (err) => {
        if (!err) {            
            status = true;
        }
    });
    return status;
}

//
// authenticateUser()
// ==================
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
    // console.log("\n/api/authenticateUser: [" + recvUser_ID + "] [" + recvPassword + "]");

    if (/\S+@\S+\.\S+/.test(recvUser_ID)) {
        // The user has entered an email address as their user identification code.
        // console.log("Authenticating via email");
        query = 'SELECT * FROM "User" WHERE "email_address" ILIKE ' + "'" + recvUser_ID + "';";
    } else if (/^\d+$/.test(recvUser_ID)) {
        // The user has specified their numeric-only user identification code.
        // console.log("Authenticating via their numeric user ID"); 
        query = 'SELECT * FROM "User" WHERE "user_ID" = ' + "'" + recvUser_ID + "';";
    } else {
        // The user has specified their alphanumeric alias.
        // console.log("Authenticating via their alphanumeric alias"); 
        query = 'SELECT * FROM "User" WHERE "alias" ILIKE ' + "'" + recvUser_ID + "';";    
    }

    db.query(query, (err, result) => {
        if (!err) {
            if (result.rows[0] !== undefined) {                
                console.log("/api/authenticateUser: user found");
                response.setHeader("Content-Type", "application/json");
                const encryptedPassword = result.rows[0].password;
                const user_status = result.rows[0].user_status;
                const user_ID = result.rows[0].user_ID;
                const user_authority = result.rows[0].user_authority;
                const first_name = result.rows[0].first_name;
                const last_name = result.rows[0].last_name;
                const user_image = result.rows[0].user_image;

                // Compare the password submitted and the encrypted password.
                bcrypt.compare(recvPassword , encryptedPassword, function(err, result) {
                    if (err) {
                        //console.log("bcrypt.compare() error " + err.message);
                        response.status(500).send(err.message);
                    } else if (result) {
                        //console.log("passwords match");
                        // Generate the JSON web token, setting it to expire.
                        jwt.sign({user_ID}, JWT_SECRET, JWT_EXPIRES_IN , (err, token) => {
                            if (!err) {
                                const packet = {user_ID: user_ID,
                                                user_status: user_status,
                                                first_name: first_name,
                                                last_name:  last_name,
                                                user_authority: user_authority,
                                                user_image: user_image,
                                                JWT: token};
                                // console.log("Packet returned: " + packet.user_ID);
                                response.status(200).send(packet);
                            } else {
                                //console.log(err.message);
                                response.status(500).json({err});
                            }
                        });
                    } else {
                        //console.log("passwords do not match");
                        response.status(404).send('User was not authenticated');
                    }
                });
            } else {
                //logmsg("/api/authenticateUser: user was not found");
                response.status(404).send('User was not found');
            } 
        } else {
            response.status(500).send('Returned error' + err);
            //logmsg("/api/authenticateUser returned error :" + err + "\n" + query);            
        }
    });
});

//
// getUser()
// =========
// Route to return an individual user record based on their user_ID. This api
// must receive a valid JWT for the current session before it executes.
//
app.get('/api/getUser', async (request, response) => {    
    //logmsg("\napi/getUser with JWT\n");
    const JWT = request.query.JWT;
    if (!verifyJWT(JWT)) {
        //logmsg("api/getUser JWT does not verify");
        response.status(403).send("Not authorised");
    } else {
        const user_ID = request.query.user_ID;
        const sqlSelectCmd = 'SELECT * FROM "User" WHERE "user_ID" = ' + "'" + user_ID + "'";

        //logmsg("api/getUser\n" + sqlSelectCmd + "\n");
        
        db.query(sqlSelectCmd, (err, result) => {
            if (!err) {
                if (result.rows[0] !== undefined) {
                    response.setHeader("Content-Type", "application/json");
                    response.status(200).json(result.rows[0]);
                } else {
                    response.status(404).send('User was not found');
                }
            } else {
                response.status(500).send('Returned error' + err);
                //logmsg("/api/getUser returned error :" + err + "\n" +
                    //  "query: " + sqlSelectCmd);
            }
        });
    }
});   

//
// encryptPassword()
// =================
async function encryptPassword(password) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT)
    return hashedPassword;
};

//
// createUser()
// ============
// API to create a new user with only their first name, last name, their email address, and their registration 
// token in the new record. The user_ID is an auto-incrementing unique key that is returned in the response
// packet.
// 
app.put('/api/createUser', async (request, response) => {    
    var hashedPassword = await encryptPassword((request.body.password.replace(/'/g, "''")));

    const sqlSelectCmd = 'INSERT INTO "User" ("user_authority", "password", "user_status", "registration_token", ' +
                         '"first_name", "last_name", "email_address", "user_image")' +
                         " VALUES ('" + request.body.user_authority + "', '" + hashedPassword + "', " +
                                  "'" + request.body.user_status + "', " + 
                                  "'" + (request.body.registration_token.replace(/'/g, "''")) + "', " +
                                  "'" + (request.body.first_name.replace(/'/g, "''")) + "', " +
                                  "'"+ (request.body.last_name.replace(/'/g, "''")) + "', " +
                                  "'" + (request.body.email_address.replace(/'/g, "''")) + "', " +
                                  "'" + (request.body.user_image.replace(/'/g, "''")) + "') " +
                         'RETURNING "user_ID"';

    console.log("api/createUser\n" + sqlSelectCmd + "\n");
    
    db.query(sqlSelectCmd, (err, result) => {
        if (!err) {
            if (result.rows[0] !== undefined) {
                logmsg("/api/createUser: user created. User_ID is " + result.rows[0].user_ID);
                const packet = {user_ID: result.rows[0].user_ID};
                //console.log(packet);
                response.status(200).send(packet);
            } else {
                logmsg("/api/createUser: user was not created");
                response.status(404).send("User was not created");
            }
        } else {
            response.sendStatus(500);
            logmsg("/api/createUser returned error :" + err + "\n" + sqlSelectCmd);
        }
    });
});

//
// getUserByEmail()
// ================
// API to return an individual user's record based on their email address.
//
app.get('/api/getUserByEmail', async (request, response) => {
    const email_address = request.query.email_address;
    // eslint-disable-next-line no-useless-concat
    const sqlSelectCmd = 'SELECT * FROM "User" WHERE "email_address" ILIKE ' + "'" + email_address + "';";
    db.query(sqlSelectCmd, (err, result) => {
        if (!err) {
            if (result.rows[0] !== undefined) {
                //console.log("/api/getUserByEmail: user found with the email address " + email_address);
                response.setHeader("Content-Type", "application/json");
                response.status(200).json(result.rows[0]);
            } else {
                //logmsg("/api/getUserByEmail: no user has registered the email address " + email_address);
                response.setHeader("Content-Type", "application/json");
                response.status(404).send('User not found');
            }
        } else {
            response.status(500).send('Returned error' + err);
            //logmsg("/api/getRegistrantByEmail returned error" + err + "\n" + sqlSelectCmd);
        }
    });
});

//
// getUserByVerificationCode()
// ===========================
// API to return an individual user's record based on their one-time verification
// code. This is used when the user is resetting their password after forgetting it.
// The unlockUser API blanks both their verification code and their registration_token
// so they cannot be re-used or cause confusion later.
//
app.get('/api/getUserByVerificationCode', async (request, response) => {
    const verification_code = request.query.verification_code;
    logmsg("/api/getUserByVerificationCode " + verification_code);
    // eslint-disable-next-line no-useless-concat
    const sqlSelectCmd = 'SELECT * FROM "User" WHERE "verification_code" = ' + "'" + verification_code + "'";
    db.query(sqlSelectCmd, (err, result) => {
        if (!err) {
            if (result.rows[0] !== undefined) {
                console.log("/api/getUserByVerificationCode: user found");
                response.setHeader("Content-Type", "application/json");
                response.status(200).json(result.rows[0]);
            } else {
                logmsg("/api/getUserByVerificationCode: user not found");
                response.setHeader("Content-Type", "application/json");
                response.status(404).send('User not found');
            }
        } else {
            response.status(500).send('Returned error' + err);
            logmsg("/api/getUserByVerificationCode returned error" + err + "\n" + sqlSelectCmd);
        }
    });
});

//
// duplicateAlias()
// ================
// Checks the alias entered by a user while editing their profile is not already in-use
// by another user. This is a case-insensitive comparison.
//
app.get('/api/duplicateAlias', async (request, response) => {
    const JWT = request.query.JWT;
    if (!verifyJWT(JWT)) {
        //logmsg("api/duplicateAlias JWT does not verify");
        response.status(403).send("Not authorised");
    } else {
        const alias = request.query.alias;
        const user_ID = request.query.user_ID;
        // eslint-disable-next-line no-useless-concat
        const sqlSelectCmd = 'SELECT "user_ID", "alias" FROM "User" WHERE "user_ID" <> ' + "'" + user_ID + "'" + ' AND "alias" ILIKE ' + "'" + alias + "'";
        //console.log(sqlSelectCmd);
        
        db.query(sqlSelectCmd, (err, result) => {
            if (!err) {
                if (result.rows[0] !== undefined) {
                    //console.log("/api/duplicateAlias: user " + result.rows[0].user_ID + " is using that alias");
                    response.setHeader("Content-Type", "application/json");
                    response.status(200).json(result.rows[0]);
                } else {
                    //logmsg("/api/duplicateAlias: no user has registered that alias");
                    response.setHeader("Content-Type", "application/json");
                    response.status(404).send('Alias is not in use');
                }
            } else {
                response.status(500).send('Returned error' + err);
                //logmsg("/api/duplicateAlias returned error" + err + "\n" + sqlSelectCmd);
            } 
        });
    }    
}); 

//
// duplicateEmail()
// ================
// Checks the email address entered by a user while editing their profile is not already in-use
// by another user. This is a case-insensitive comparison.
//
app.get('/api/duplicateEmail', async (request, response) => {
    const JWT = request.query.JWT;
    if (!verifyJWT(JWT)) {
        //logmsg("api/duplicateEmail JWT does not verify");
        response.status(403).send("Not authorised");
    } else {
        const email_address = request.query.email_address;
        const user_ID = request.query.user_ID;
        // eslint-disable-next-line no-useless-concat
        const sqlSelectCmd = 'SELECT "user_ID", "email_address" FROM "User" WHERE "user_ID" <> ' + "'" + user_ID + "'" + 
                             ' AND "email_address" ILIKE ' + "'" + email_address + "'";
        //console.log(sqlSelectCmd);
        
        db.query(sqlSelectCmd, (err, result) => {
            if (!err) {
                if (result.rows[0] !== undefined) {
                    //console.log("/api/duplicateEmail: user " + result.rows[0].user_ID + " is using that email address");
                    response.setHeader("Content-Type", "application/json");
                    response.status(200).json(result.rows[0]);
                } else {
                    //logmsg("/api/duplicateEmail: no user has registered that email address");
                    response.setHeader("Content-Type", "application/json");
                    response.status(404).send('Email address is not in use');
                }
            } else {
                response.status(500).send('Returned error' + err);
                //logmsg("/api/duplicateEmail returned error" + err + "\n" + sqlSelectCmd);
            } 
        });
    }    
}); 

//
// updateUser()
// ============
// Updates the data for an existing user record. It uses a transaction 
// with a commit and rollback in the event of an issue.
//
app.put('/api/updateUser', async(request, response) => {
    const JWT = request.query.JWT;    

    if (!verifyJWT(JWT)) {
        response.status(403).send("Not authorised");        
    } else {
        var sqlUpdateCmd = 'DO $$\n' +
            'BEGIN \n' +
                'UPDATE "User" SET ' +
                ' "user_authority" = ' + "'" + request.body.user_authority + "' , ";

        var password = request.body.password.trim();
        if (password !== "") {
            // The user has provided a new password to update their record.
            // logmsg("Password is being changed...[" + password + "] - encrypting it...\n");
            var hashedPassword = await encryptPassword((password.replace(/'/g, "''")));
            sqlUpdateCmd = sqlUpdateCmd + ' "password" = ' + "'" + hashedPassword + "' , ";
        } 
        
        sqlUpdateCmd = sqlUpdateCmd +         
                    ' "salutation" = ' + "'" + request.body.salutation + "' , " +
                    ' "first_name" = ' + "'" + request.body.first_name.replace(/'/g, "''") + "' , " +
                    ' "last_name" = ' + "'" + request.body.last_name.replace(/'/g, "''") + "' , " +
                    ' "alias" = ' + "'" + request.body.alias.replace(/'/g, "''") + "' , " +
                    ' "phone_number" = ' + "'" + request.body.phone_number.replace(/'/g, "''") + "' , " +
                    ' "email_address" = ' + "'" + request.body.email_address.replace(/'/g, "''") + "' , " +
                    ' "address_1" = ' + "'" + request.body.address_1.replace(/'/g, "''") + "' , " +
                    ' "address_2" = ' + "'" + request.body.address_2.replace(/'/g, "''") + "' , " +
                    ' "address_3" = ' + "'" + request.body.address_3.replace(/'/g, "''") + "' , " +
                    ' "suburb" = ' + "'" + request.body.suburb.replace(/'/g, "''") + "' , " +
                    ' "city" = ' + "'" + request.body.city.replace(/'/g, "''") + "' , " +
                    ' "postcode" = ' + "'" + request.body.postcode.replace(/'/g, "''") + "' , " +
                    ' "state_province" = ' + "'" + request.body.state_province.replace(/'/g, "''") + "' , " +
                    ' "country" = ' + "'" + request.body.country.replace(/'/g, "''") + "' , " +
                    ' "date_of_birth" = ' + "'" + request.body.date_of_birth.replace(/'/g, "''") + "', " +
                    ' "user_image" = ' + "'" + request.body.user_image.replace(/'/g, "''") + "' " +
                    ' WHERE "user_ID" = ' + "'" + request.body.user_ID + "';\n" +                
                    'EXCEPTION\n ' +
                    'WHEN OTHERS THEN\n' +
                    'ROLLBACK\n; ' +
                    'END; $$\n';
        //logmsg("/api/updateUser \n" + sqlUpdateCmd + "\n");

        db.query(
            sqlUpdateCmd, (err, result) => {                 
                if (!err) {
                    response.status(200).send("/api/updateUser: user updated.");
                    //logmsg("user updated.");                    
                } else {
                    response.status(500).send("/api/updateUser: Unexpected error " + err.message);
                    //logmsg("/api/updateUser() returned an unexpected error :" + err.message + "\n" +
                    //       "query: " + sqlUpdateCmd);
                }
            }
        );
    }
}); 

//
// lockUser()
// ==========
// Locks the clients record during the password reset process when they have forgotten their password.
// The API unlockUser is called to reset their password correctly and unlock their record.
//
app.put('/api/lockUser', async(request, response) => {
    var sqlUpdateCmd =  'DO $$\n' +
                        'BEGIN \n' +
                            'UPDATE "User" SET ' +
                            ' "user_status" = ' + "'" + request.body.user_status + "' , " +  
                            ' "password" = ' + "'' , " +
                            ' "registration_token" = ' + "'" + request.body.registration_token + "' , " +
                            ' "verification_code" = ' + "'" + request.body.verification_code + "' " +  
                            ' WHERE "user_ID" = ' + "'" + request.body.user_ID + "';\n" +                
                        'EXCEPTION\n ' +
                        'WHEN OTHERS THEN\n' +
                        'ROLLBACK\n; ' +
                        'END; $$\n';
        
    logmsg("/api/lockUser \n" + sqlUpdateCmd + "\n");

    db.query(
        sqlUpdateCmd, (err, result) => {                 
            if (!err) {
                response.status(200).send("/api/lockUser: user updated.");
                logmsg("/api/lockUser user updated.");                    
            } else {
                response.status(500).send("/api/lockUser: Unexpected error " + err.message);
                logmsg("/api/lockUser returned an unexpected error :" + err.message + "\n" +
                       "query: " + sqlUpdateCmd);
            }
        }
    );    
}); 

// 
// sendMail()
// ==========
// This is a general-purpose email client that sends plain-text or HTML-formatted email messages
// to users. The configuration for the email service, user information, and account passwords are
// configured in the environment file sr.env.
//
app.put('/api/sendMail', async(request, response) => {  
    
    // Configure the mail transport from the parameters sent in the API request
    const mailOptions = {
        from: request.body.sender_email_address, 
        to: request.body.recipient_email_address,
        subject: request.body.subject, 
        html: request.body.html_body 
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            logmsg("/api/sendMail: email could not be sent. " + err + " " + info);
            response.status(500).send("/api/sendMail: email could not be sent.");
        } else {
            logmsg("/api/sendMail: email sent.");
            response.status(200).send("/api/sendMail: email sent. " + err + " " + info);
        } 
    });    
}); 

//
// uploadFile()
// ============
// Receives a file that a user is uploading from a React front-end via
// this api post call. The file is saved in an pre-defined upload
// location. Note that the api does not specify an absolute
// file path where the file will be saved. That would be a security 
// vulnerability since the server paths are not exposed to the 
// front-end. Instead, the file object type is just a just predefined 
// enumerated type that the back-end matches to a real file path that
// is is applicable to the particular site structure. 
// The api call must include a JWT since this api can only be executed
// by an authenticated user.
//
app.post('/api/uploadFile', upload.array("photos"), (request, response) => {
    const JWT = request.query.JWT;
    const image = request.image;
    //logmsg("/api/uploadFile: executing.") 
    
    if (!verifyJWT(JWT)) {
        logmsg("/api/uploadFile: User is not authorised");
        response.status(403).send("Not authorised");        
    } else {
        //logmsg("/api/uploadFile: Received file(s): ", request.files);
        response.status(200).json({files: request.files });
    }      
});
