//
// RESET MY PASSWORD
// =================
// This page allows q client to reset their password using a verification
// code that is emailed to them. 
// 
// The email is sent to the email address they enter, but only if that 
// email address can be found in the database. This helps stop hackers
// trying to change the password of an exising client without their approval.
// 
// Revision History
// ================
// 26.02.2025 BRD Original version.
// 01.08.2025 BRD Converted the Strength Research component to now work 
//                with Strength Coaching.
// 03.09.2025 BRD Added the code to send the password reset link to the client
//                via email.
//
import "./Main.css";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getBaseURL } from "./getBaseURL";

import Axios from "axios";
const axios = Axios;

const baseURL = getBaseURL();

import TopNav from "./components/TopNav";

import Reset_Person from "./images/Reset_Person.png";
import eye from "./images/password_eye.png";

//
// resetStates
// ===========
const resetStates = {
    UNDEFINED: 0,
    PAGE_1: 1,
    VERIFY_PAGE_1: 2,     
    PAGE_2: 3,
    VERIFY_PAGE_2: 4, 
    CLIENT_EXISTS: 5,
    CLIENT_DOES_NOT_EXIST: 6,
    GENERATE_TOKEN: 7,
    LOCK_CLIENT: 8,
    EMAIL_CLIENT: 9,
    PAGE_3: 10,
    VERIFY_PAGE_3: 11,
    ERROR: 500,
};

//
// ResetPassword()
// ===============
export default function ResetPassword() {
    let navigate = useNavigate();

    const [UserID, setUserID] = useState("");
    const [EmailAddress, setEmailAddress] = useState("");
    const [EmailAddressError, setEmailAddressError] = useState("");
    const [ResetLink, setResetLink] = useState("");
    const [VerificationCode, setVerificationCode] = useState("");

    const [Password, setPassword] = useState("");
    const [PasswordError, setPasswordError] = useState("");
    const [PasswordCopy, setPasswordCopy] = useState("");
    const [PasswordCopyError, setPasswordCopyError] = useState("");

    // Used to control the visibility of the password by switching the
    // input type between "text" and "password".
    const [PasswordVisibility, setPasswordVisibility] = useState("password");
      
    //let location = useLocation();
    //console.log("\nLocation " + location.pathname + " " + window.location.href);

    //let token = new URLSearchParams(location.search).get('vt');
    // http://localhost:3000/ResetPassword?vt=dfdfdfdf_HAHHA
    //console.log("URL [" + location.pathname + "] [" + token + "]"); 

    //
    // Reset Password State Control
    // ============================
    // The password reset process operates as a State Machine. This allows it to move
    // stage-by-stage forwards and backwards, waiting at appropriate times for an
    // async process to return a value before transitioning to a new stage. The
    // current state is held in resetState, which always contains one of the
    // pre-defined resetStates enumerated constants.
    //    
    // The useState Hook ensures that the environment gets updated and re-configured 
    // each time the state changes. This can trigger page transitions, reads and writes 
    // from the database, or display errors that require the client to correct what 
    // they entered. The set of possible states is defined in the resetStates
    // enumerated list declared above.
    //        
    const [resetState, setResetState] = useState(resetStates.UNDEFINED); 
    useEffect(() => { 
        switch (resetState) {
            case resetStates.UNDEFINED: 
                // This is the initial state transition 
                setResetState(resetStates.PAGE_1);               
                break;

            case resetStates.PAGE_1:
                // Display the first page that explains to the
                // client what they need to do. It requests their
                // registered email address.                
                break;

            case resetStates.VERIFY_PAGE_1:
                // Verifies that the email entered belongs to
                // a registered client.                
                verifyEmail();                
                break; 
                
            case resetStates.CLIENT_DOES_NOT_EXIST:
                // Do nothing. The page will tell them that that address will get
                // an email sent to it, but it won't.
                console.log("\nNo client with that email address was found");
                break;    
                
            case resetStates.CLIENT_EXISTS:
                // A client with that email address was found. Generate the token they
                // need and generate the password reset token.
                generateToken(UserID);
                break; 

            case resetStates.LOCK_CLIENT: 
                lockClient(UserID);   
                break; 

            case resetStates.EMAIL_CLIENT:
                // Email the client
                emailResetLink(EmailAddress);
                break;  

            

            default:
                break;     
        }    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetState]);

    //
    // verifyEmail()
    // =============
    // Verify the email address exists and then email the verification code to them.
    // If the email is not found, inform them that you have sent the email anyway since
    // they may be a hacker. However, if the email address is malformed or blank, tell 
    // the client so they can correct it.
    //
    function verifyEmail() {
        console.log("\nverifyEmail() " + EmailAddress);

        if (!EmailAddress.trim()) {
            setEmailAddressError("An email address must be entered.")
            setResetState(resetStates.PAGE_1);
        } else {    
            if (!/\S+@\S+\.\S+/.test(EmailAddress)) {
                setEmailAddressError("The email address entered is not valid.");
                setResetState(resetStates.PAGE_1);
            } else {
                console.log("\nReady to verify..");                
                checkClientExists(EmailAddress);
            }      
        }
    };

    //
    // checkClientExists() 
    // ===================
    // Verifys that the client exists by loading their client record using their email address as a key.
    //
    const checkClientExists = async (email_address) => {
        console.log("\ncheckUserExists " + email_address);
        try {
            let response = await axios.get(baseURL + "getUserByEmail?email_address=" + email_address);
            if (response.status === 200) {  
                setUserID(response.data.user_ID);   
                console.log("checkUserExists() found client " + response.data.user_ID);                  
                setResetState(resetStates.CLIENT_EXISTS);    
            } else if (response.status === 404) {
                // No client is registered with that email.
                console.log("Returned 404");
                setUserID("");   
                setResetState(resetStates.CLIENT_DOES_NOT_EXIST); 
            }                   
        } catch (err) {
            // No client is registered with that email.
            setUserID("");   
            setResetState(resetStates.CLIENT_DOES_NOT_EXIST);  
        } 
    };

    //
    // generateToken()
    // ===============
    // Creates the verification code they need to enter on the next page
    // and the token sent in the email to access the page and verify them.
    //
    async function generateToken(user_ID) {
        console.log("Locking client " + user_ID);
        setVerificationCode((Math.floor(Math.random() * (9 * (Math.pow(10, 4)))) +
                            (Math.pow(10, 4))).toString());
        const expiry_time = {expiresIn: '1d'};  

        try {
            let response = await axios.get(baseURL + "getToken?user_ID=" + user_ID + 
                                           "@expiry_time=" + expiry_time);
            if (response.status === 200) { 
                console.log("Token = " + response.data.token); 
                setResetLink(response.data.token);
                setResetState(resetStates.LOCK_CLIENT);
            }                    
        } catch (err) { 
            console.log("Token error:" + err);
            setResetState(resetStates.PAGE_1);
        } 
    };

    //
    // lockClient()
    // ============    
    //
    async function lockClient(user_ID) {        
        console.log("Locking client " + user_ID);

        axios.put(baseURL + "lockUser", { 
            user_ID: user_ID,           
            password: "",
            user_status: "R",
            registration_token: ResetLink, 
            verification_code: VerificationCode 
        })
        .then((response) => {
            if (response.status === 200) {
                console.log("\nlockClient - status 200");                
                setResetState(resetStates.EMAIL_CLIENT);                     
            } else if (response.status === 500) { 
                console.log("\nlockClient - status 500");                                 
                //setRegistrationState(registrationStates.EMAIL_CLIENT);                
            }    
        })
        .catch(err => {
            console.log("\nlockClient - err " + err);    
        })        
    }; 

    //
    // emailResetLink()
    // ================
    // Sends an email to the address the client specified. The email contains
    // an explanation of how to reset their password. 
    //
    async function emailResetLink(email_address) {
        const URL = window.location.href;
        
        const html_body = "<p>A request to change your password was made on Strength Coaching Online.</p>" + 
                           "<p>If it was you, then please click on " +        
                          '<a href="' + URL + '/?vt=' + ResetLink + '">' +
                          "this link " + "</a>" + 
                          "to go to the Reset my Password page on Strength Coaching Online.</p>" +                                                      
                          "<p>Please enter this verification code into the registration page:</p>" +                           
                          "<h1 style='text-align: center; font-size: 25px;'>" + VerificationCode + "</h1>" +  
                          "<p>The verification code is valid for the next 20 minutes.</p>" + 
                          "<p>If this was not you or you need further assistance, please contact the support team by emailing info@strengthcoacing.online.</p>" +                          
                          "<p>Kind regards,</p>" +
                          "</p>Luke Selway</p>";

        await axios.put(baseURL + "sendMail", {
            sender_email_address: "info@strengthresearch.online",            
            recipient_email_address: email_address, 
            subject: "Your Strength Coaching Online Password Reset Link",             
            html_body: html_body           
        })
        .then((response) => {
            if (response.status === 200) {
                console.log("email sent");                                         
            } else if (response.status === 500) {
                console.log("emailUser error: 500 " + response); 
            }    
        })
        .catch(err => {
            console.log("emailUser error: " + err.message);            
        })  
    };
    
    //
    // RESET PASSWORD PAGES
    // ====================
    // Displays each of the reset password pages in order to verify the client, email them
    // a password reset link, and then let them enter a new password when they click on the
    // link sent to them.
    //
    return (        
        <div>            
            <TopNav title="" userName="" userRole="" />

            <div className="flex absolute top-24 bottom-0
                            items-center justify-center
                            left-0 right-0 bg-gray-800 overflow-hidden">
                            
                <div className="flex flex-col box-border border-2 rounded-lg
                                h-82 w-80">
                                
                    {(resetState === resetStates.PAGE_1) && (
                        <Page_1
                            EmailAddress={EmailAddress}
                            setEmailAddress={setEmailAddress}
                            EmailAddressError={EmailAddressError}
                            setResetState={setResetState}                                
                            navigate={navigate}
                        />
                    )}; 

                    {((resetState === resetStates.CLIENT_EXISTS) || (resetState === resetStates.CLIENT_DOES_NOT_EXIST) 
                      || (resetState === resetStates.EMAIL_CLIENT) || (resetState === resetStates.LOCK_CLIENT)) && (                       
                        <Page_2 
                            EmailAddress={EmailAddress} 
                            setResetState={setResetState}                                                            
                            navigate={navigate}
                        />
                    )}; 

                    {(resetState === resetStates.PAGE_3) && (
                        <Page_3
                            PasswordVisibility={PasswordVisibility}   
                            setPasswordVisibility={setPasswordVisibility}                              
                            Password={Password}
                            setPassword = {setPassword}
                            PasswordError = {PasswordError}                                    
                            PasswordCopy={PasswordCopy}
                            setPasswordCopy = {setPasswordCopy}
                            PasswordCopyError = {PasswordCopyError}
                            setResetState={setRegistrationState} 
                        />
                    )}; 

                </div>            
                                    
                <div className="relative flex items-center justify-center mt-0 ml-3">
                    <img className="rounded"
                        src={Reset_Person}
                        alt="/"
                        height={110}
                        width={265}
                    />
                </div> 
            </div> 
        </div>    
    );
}

// let location = useLocation();
//    let token = new URLSearchParams(location.search).get('vt');
//    // http://localhost:3000/ResetPassword?vt=dfdfdfdf_HAHHA
//    console.log("URL [" + location.pathname + "] [" + token + "]"); 

//
// Page_1()
// ========
// This component lets the client who is resetting their password enter their 
// email address. This is the initial stage that allows the client to be identified
// by looking up their email. If the email address matches that of an existing client,
// their user_status is set to R to indicate that they are resetting their password.
// While they are in that state, the client cannot log in. An authentication token 
// is created that forms part of a reset-password page link. This is then sent to 
// them in an email.                 
// 
function Page_1(params) {    
    return (
        <div>
            <p className="text-white text-center text-xl mt-5">Reset my password</p>

            <p className=" ml-5 mb-1 mt-3 text-white text-left"> 
                An email with a link to a page where<br></br>
                you can reset your password can be<br></br>
                sent to you.<br></br><br></br>
                The email will include a verification<br></br>
                code that you must enter on the page.
                <br></br><br></br>
                Please enter your email address here:
            </p>
            <input className="ml-5 mr-5 mt-4 w-[270px] pl-1"
                id="EmailAddress"
                type="text"
                placeholder=""
                autoComplete="new-password"
                value={params.EmailAddress}
                onChange={(e) => {params.setEmailAddress(e.target.value);}}
            />
            <p className=" ml-5 mb-0 mt-2 text-cyan-300 text-left text-sm">
                {params.EmailAddressError}&nbsp;
            </p>

            <div className="flex flex-row">                         
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                mt-2 ml-12"
                        id="SendLink"
                        style={{ width: "100px" }}                    
                        onClick={() => {params.setResetState(resetStates.VERIFY_PAGE_1);}
                        }>                    
                    Send Link
                </button>

                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                mt-2 ml-5"
                        id="Cancel"
                        style={{ width: "100px" }}
                        onClick={() => {
                            params.navigate("/");
                        }}>
                    Cancel
                </button>
            </div>            
        </div>
    );    
}
    
//
// Page_2()
// ========
// This component informs the client that an email has been sent to them.
// 
function Page_2(params) {    
    return (
        <div>
            <p className="text-white text-center text-xl mt-0">Reset my password</p>

            <p className="ml-5 mb-3 mt-3 text-white text-left"> 
                An email with a link to a page where<br></br>
                you can reset your password has been<br></br>
                sent to:
            </p> 

            <p className="ml-5 mb-3 mt-3 text-white text-left font-bold overflow-hidden">   
                {params.EmailAddress}
            </p>

            <p className="ml-5 mb-5 mt-3 text-white text-left">         
                The email also contains a code that<br></br>
                you can enter on the reset page.
                <br></br><br></br>
                                
                If you did not receive an email, click <br></br>
                <b>Back</b> and try again.
            </p>
            
            <div className="flex flex-row">                         
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                mt-2 ml-12"
                        id="Back"
                        style={{ width: "100px" }}                    
                        onClick={() => {params.setResetState(resetStates.PAGE_1);}
                        }>                    
                    Back
                </button>

                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                mt-2 ml-5"
                        id="Next"
                        style={{ width: "100px" }}
                        onClick={() => {
                            params.navigate("/");
                        }}>
                    Next
                </button>
            </div>            
        </div>
    );    
}

//
// Page_3()
// ========
// This page is displayed when the user clicks on the link in the email sent to them.
// 
function Page_3(params) {   
    // Set the focus automatically to the first input field after
    // the component has rendered properly.
    const autofocusID = useRef(null);
    useEffect(() => {
        if (autofocusID.current) {
            autofocusID.current.focus();
        }    
    },[]);
    
    return (
        <div className = "mb-1">
            <p className="text-white text-center font-bold text-xl mt-0">
                Setting your password
            </p>

            <p className="ml-5 mb-1 mt-3 w-72 text-white text-left">
                Your Strength Coaching Online profile has been created. 
            </p>

            <p className="ml-5 mb-1 mt-3 w-70 text-white text-left">    
                Enter the password you want to use                
            </p>        
            <div className="flex flex-row">            
                <input className="ml-5 mt-1 w-72 pl-1"
                        id = "Password"
                        ref={autofocusID}
                        type = {params.PasswordVisibility}
                        placeholder = ""
                        autoComplete = "new-password"
                        value = {params.Password}
                        onChange = {(e) => params.setPassword(e.target.value)}
                />
                <img className="mr-5 ml-0 mt-1 h-6 w-7"
                    src={eye}
                    alt="/"
                    onClick={() => {
                        if (params.PasswordVisibility === "password") {
                            params.setPasswordVisibility("text");
                        } else {
                            params.setPasswordVisibility("password");
                        }
                    }}
                />
            </div>    
            <p className="ml-5 mb-2 mt-2 text-cyan-300 text-left text-sm">
                {params.PasswordError}&nbsp;
            </p>            

            <p className=" ml-5 mb-1 mt-2 text-white text-left">Please enter the same password again</p>
            <div className="flex flex-row">    
                <input className="ml-5 mt-1 w-72 pl-1"
                    id = "PasswordCopy"
                    type = {params.PasswordVisibility}
                    placeholder = ""
                    autoComplete = "new-password"
                    value = {params.PasswordCopy}
                    onChange = {(e) => params.setPasswordCopy(e.target.value)}
                />
                <img className="mr-5 ml-0 mt-1 h-6 w-7"
                    src={eye}
                    alt="/"
                    onClick={() => {
                        if (params.PasswordVisibility === "password") {
                            params.setPasswordVisibility("text");
                        } else {
                            params.setPasswordVisibility("password");
                        }
                    }}
                />
            </div>    
            <p className="ml-5 mb-0 mt-2 text-cyan-300 text-left text-sm">
                {params.PasswordCopyError}&nbsp;
            </p>

            <div className="flex flex-row mt-5">
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                    mt-1 ml-12"
                    id = "Back"
                    style = {{ width: "100px" }}
                    onClick = {() => {params.setRegistrationState(registrationStates.PAGE_2);}} >      
                    &lt; Back
                </button>

                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                mt-2 ml-5"
                    id = "Sign_In"
                    style = {{ width: "100px" }}
                    onClick={() => {params.setRegistrationState(registrationStates.VERIFY_PAGE_3);}} >      
                    Sign In
                </button>
            </div>
        </div>
    );
}
