//
// RESET MY PASSWORD
// =================
// This set of pages allow a client to reset their password using a
// verification code that is emailed to them and a link to launch
// the hidden password reset page. 
// 
// The email is sent to the email address they enter, but only if that 
// email address can be found in the database, verifying that they are
// already a client. This helps stop hackers trying to change the password
// of an exising client without their approval.
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

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getBaseURL } from "./components/getBaseURL";
import { states } from "./Constants";
import { validateEmail } from "./components/UtilLib";

import Axios from "axios";
const axios = Axios;

const baseURL = getBaseURL();

import TopNav from "./components/TopNav";

import Reset_Person from "./images/Reset_Person.png";
import eye from "./images/password_eye.png";

//
// ResetPassword()
// ===============
export default function ResetPassword() {
    let navigate = useNavigate();

    // Reset their credentials since they are not authenticated.
    sessionStorage.setItem("userID", "");
    sessionStorage.setItem("FirstName", "");
    sessionStorage.setItem("LastName", "");
    sessionStorage.setItem("UserAuthority", "");
    sessionStorage.setItem("UserImage", "");
    sessionStorage.setItem("JWT", "");            

    const [UserID, setUserID] = useState("");
    const [EmailAddress, setEmailAddress] = useState("");
    const [EmailAddressError, setEmailAddressError] = useState("");
    const [RegistrationToken, setRegistrationToken] = useState("");
    const [VerificationCode, setVerificationCode] = useState("");
    const [VerificationCodeError, setVerificationCodeError] = useState("");

    const [Password, setPassword] = useState("");
    const [PasswordError, setPasswordError] = useState("");
    const [PasswordCopy, setPasswordCopy] = useState("");
    const [PasswordCopyError, setPasswordCopyError] = useState("");

    // Used to control the visibility of the password by switching the
    // input type between "text" and "password".
    const [PasswordVisibility, setPasswordVisibility] = useState("password");
      
    let location = useLocation();    
    
    //
    // Reset Password State Control
    // ============================
    // The password reset process operates as a State Machine. This allows it to
    // move stage-by-stage forwards and backwards, waiting at appropriate times 
    // for an async process to return a value before transitioning to a new 
    // stage. The current state is held in state, which always contains one of
    // the pre-defined states enumerated constants.
    //    
    // The useState Hook ensures that the environment gets updated and 
    // re-configured each time the state changes. This can trigger page transitions
    // reads and writes from the database, or display errors that require the client
    // to correct what they entered. The set of possible states is defined in the
    // states enumerated list declared the /components/Constants.
    //        
    const [state, setState] = useState(states.UNDEFINED); 
    useEffect(() => { 
        var error = false;

        switch (state) {
            case states.UNDEFINED: 
                let token = new URLSearchParams(location.search).get('rt');                
                if (token !== null) {
                    // The page has been launched from an link with an embedded URL token.                     
                    setRegistrationToken(token);
                    verifyToken(token);                             
                } else {
                    // This is the initial state transition from inside the app, via
                    // a link from the Sign In page.
                    setState(states.PAGE_1);
                }       
                break;

            case states.PAGE_1:
                // Display the first page that explains to the client what they 
                // need to do. It requests their registered email address.                
                break;

            case states.VERIFY_PAGE_1:
                // Verifies that the email entered belongs to a registered client.                
                verifyEmail();                
                break; 
                
            case states.CLIENT_DOES_NOT_EXIST:
                // Do nothing. The page will tell them that that address will get
                // an email sent to it, but it won't.                
                break;    
                
            case states.CLIENT_EXISTS:
                // A client with that email address was found. Generate the token
                // they need and generate the password reset token.
                generateToken(UserID);
                break; 

            case states.LOCK_CLIENT: 
                lockClient(UserID);   
                break; 

            case states.EMAILING:
                // Email the client
                emailResetLink(EmailAddress);
                break; 
                
            case states.VERIFY_PAGE_3:
                if (VerificationCode.trim() === "") {
                    setVerificationCodeError("A verification code must be entered");
                    error = true;
                } else {
                    setVerificationCodeError("");
                }
                
                if (Password.trim() === "") {
                    setPasswordError("A password must be entered");
                    error = true;
                } else {
                    setPasswordError("");
                }
            
                if (PasswordCopy.trim() === "") {
                    setPasswordCopyError("A password must be entered");
                    error = true;
                } else {
                    setPasswordCopyError("");
                }

                if (!error) {
                    if (Password.trim() !== PasswordCopy.trim()) {
                        setPasswordError("The passwords do not match");
                        setPasswordCopyError("The passwords do not match");
                        error = true;
                    }
                } 
                
                if (error) {
                    setState(states.PAGE_3);
                } else {                      
                    checkClientExists("", VerificationCode);
                }
                break;
                
            case states.CLIENT_VERIFIED:
                unlockClient(UserID, Password);                
                break;

            case states.CLIENT_NOT_VERIFIED: 
                setVerificationCodeError("That verification code is not valid.");
                setState(states.PAGE_3); 
                break; 
                
            case states.EXITING:
                navigate("/SignIn");
                break;    

            default:
                break;     
        }    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    //
    // autofocus()
    // ===========
    // Sets the focus to the first input field automatically. This requires
    // that just one input element per page has a ref={autoFocusID}.
    //
    const autofocusID = useRef(null);
    useEffect(() => {
        if (autofocusID.current) {
            autofocusID.current.focus();
        }    
    },[]);

    //
    // verifyEmail()
    // =============
    // Verify the email address exists and then email the verification code to 
    // them. If the email is not found, inform them that you have sent the email
    // anyway since they may be a hacker. However, if the email address is 
    // malformed or blank, tell the client so they can correct it.
    //
    function verifyEmail() { 
        if (!EmailAddress.trim()) {
            setEmailAddressError("An email address must be entered.")
            setState(states.PAGE_1);
        } else {    
            if (!validateEmail(EmailAddress.trim())) {
                setEmailAddressError("The email address entered is not valid.");
                setState(states.PAGE_1);
            } else {                                
                checkClientExists(EmailAddress, "");
            }      
        }
    };

    //
    // checkClientExists() 
    // ===================
    // Verifys that the client exists by loading their client record using either
    // their email address or the verification code they entered as a key.
    //
    const checkClientExists = async (email_address, verification_code) => {
        if (email_address.trim() !== "") {            
            try {
                let response = await axios.get(baseURL + 
                                               "getUserByEmail?email_address=" + 
                                               email_address);
                if (response.status === 200) {  
                    setUserID(response.data.user_ID); 
                    setState(states.CLIENT_EXISTS);    
                } else if (response.status === 404) {
                    // No client is registered with that email.                    
                    setUserID("");   
                    setState(states.CLIENT_DOES_NOT_EXIST); 
                }                   
            } catch (err) {
                // No client is registered with that email.
                setUserID("");   
                setState(states.CLIENT_DOES_NOT_EXIST);  
            } 
        } else if (verification_code.trim() !== "") { 
            try {
                let response = await axios.get(baseURL + 
                                               "getUserByVerificationCode?verification_code="
                                               + verification_code);
                if (response.status === 200) {  
                    setUserID(response.data.user_ID);  
                    if (response.data.registration_token === RegistrationToken) {
                        setVerificationCodeError("");
                        setState(states.CLIENT_VERIFIED);
                    } else {
                        setState(states.PAGE_3);       
                    }
                } else if (response.status === 404) {
                    // No client is registered with that verification code.                    
                    setUserID("");
                    setVerificationCodeError("That verification code is not valid");
                    setState(states.PAGE_3);   
                }                   
            } catch (err) {
                // No client is registered with that verification code.
                setUserID(""); 
                setVerificationCodeError("That verification code is not valid");  
                setState(states.PAGE_3);    
            } 
        }    
    };

    //
    // generateToken()
    // ===============
    // Creates the verification code they need to enter on the next page
    // and the token sent in the email to access the page and verify them.
    //
    async function generateToken(user_ID) {        
        setVerificationCode((Math.floor(Math.random() * (9 * (Math.pow(10, 4)))) +
                            (Math.pow(10, 4))).toString());
        const expiry_time = {expiresIn: '1d'};  

        try {
            let response = await axios.get(baseURL + "getToken?user_ID=" + user_ID + 
                                           "@expiry_time=" + expiry_time);
            if (response.status === 200) {                 
                setRegistrationToken(response.data.token);
                setState(states.LOCK_CLIENT);
            }                    
        } catch (err) {             
            setState(states.PAGE_1);
        } 
    };

    //
    // verifyToken()
    // =============
    async function verifyToken(registration_token) {        
        try {
            let response = await axios.get(baseURL +
                                           "verifyToken?registration_token=" +
                                           registration_token);                                            
            if (response.status === 200) {                 
                setState(states.PAGE_3);                
            } else {                    
                setState(states.PAGE_1);                
            }                    
        } catch (err) {             
            setState(states.PAGE_1);
        } 
    };

    //
    // lockClient()
    // ============    
    // Lock the clients record so that they can reset their password. Until they
    // have completed the next step using the information emailed to them, they
    // will not be able to log in.
    //
    async function lockClient(user_ID) {  
        axios.put(baseURL + "lockUser", { 
            user_ID: user_ID,           
            password: "",
            user_status: "R",
            registration_token: RegistrationToken, 
            verification_code: VerificationCode 
        })
        .then((response) => {
            if (response.status === 200) {                                
                setState(states.EMAILING);                     
            } else if (response.status === 500) {
                // RA_BRD what state should this be?
            }    
        })
        .catch(err => {
            // RA_BRD what state should this be?
            // console.log("\nlockClient - err " + err);    
        })        
    }; 

    //
    // unlockClient()
    // ==============
    async function unlockClient(user_ID, password) {  
        axios.put(baseURL + "unlockUser", { 
            user_ID: user_ID,
            password: password 
        })
        .then((response) => {
            if (response.status === 200) {                       
                setState(states.EXITING);                     
            } else if (response.status === 500) {                 
                setState(states.PAGE_3);
            }    
        })
        .catch(err => {
            // RA_BRD what state should this be?  
        })        
    }; 

    //
    // emailResetLink()
    // ================
    // Sends an email to the address the client specified. The email contains an 
    // explanation of how to reset their password. 
    //
    async function emailResetLink(email_address) {
        const URL = window.location.href;
        
        const html_body = 
            "<p>A request to change your password was made on Strength Coaching Online.</p>" + 
            "<p>If it was you, then please click on " +        
            '<a href="' + URL + '?rt=' + RegistrationToken + '">' +
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
                // The email was sent successfully.                                     
            } else if (response.status === 500) {
                // RA_BRD what state should this be?
                // console.log("emailUser error: 500 " + response); 
            }    
        })
        .catch(err => {
            // RA_BRD what state should this be?
            // console.log("emailUser error: " + err.message);            
        })  
    };

    //
    // RESET PASSWORD PAGES
    // ====================
    // Displays each of the reset password pages in order to verify the client,
    // email them a password reset link, and then let them enter a new password
    // when they click on the link sent to them.
    //
    return (        
        <div>            
            <TopNav title="" userName="" userRole="" />

            <div className="flex absolute top-24 bottom-0
                            items-center justify-center
                            left-0 right-0 bg-gray-800 overflow-hidden">
                            
                <div className="flex flex-col box-border border-2 rounded-lg
                                h-82 w-80">
                                
                    {(state === states.PAGE_1) && (
                        <Page_1
                            EmailAddress={EmailAddress}
                            setEmailAddress={setEmailAddress}
                            EmailAddressError={EmailAddressError}
                            setState={setState}                                
                            navigate={navigate}                                                       
                        />
                    )}; 

                    {((state === states.CLIENT_EXISTS) || 
                      (state === states.CLIENT_DOES_NOT_EXIST) ||
                      (state === states.EMAILING) || 
                      (state === states.LOCK_CLIENT)) && (                       
                        <Page_2 
                            EmailAddress={EmailAddress} 
                            setState={setState}                                                            
                            navigate={navigate}                            
                        />
                    )}; 

                    {(state === states.PAGE_3) && (
                        <Page_3
                            VerificationCode = {VerificationCode}
                            setVerificationCode = {setVerificationCode}
                            VerificationCodeError = {VerificationCodeError}                            
                            PasswordVisibility = {PasswordVisibility}   
                            setPasswordVisibility={setPasswordVisibility}                              
                            Password={Password}
                            setPassword = {setPassword}
                            PasswordError = {PasswordError}                                    
                            PasswordCopy={PasswordCopy}
                            setPasswordCopy = {setPasswordCopy}
                            PasswordCopyError = {PasswordCopyError}
                            setState={setState} 
                            navigate={navigate}                            
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
    //
    // handleKeys()
    // ============
    // Key event handler to trap the Enter and Escape keys on this page.
    //
    const handleKeys = (e) => {
       if (e.key === 'Enter') {        
           document.getElementById('SendLink').click(); 
        } else if (e.key === 'Cancel') {
           document.getElementById('Cancel').click();
        }
    }; 

    //
    // autofocus()
    // ===========
    // Sets the focus to the first input field automatically. This requires
    // that just one input element per page has a ref={autoFocusID}.
    //
    const autofocusID = useRef(null);
    useEffect(() => {
        if (autofocusID.current) {
            autofocusID.current.focus();
        }    
    },[]);
        
    return (
        <div>
            <p className="text-white text-center text-xl mt-5">Reset my password</p>

            <p className=" ml-5 mb-1 mt-3 text-white text-left"> 
                An email can be sent to you with a <br></br>
                link to a page where you can reset<br></br> 
                your password.<br></br>
                <br></br>
                The email will include a one-time<br></br>
                code that you must enter. <br></br>
                <br></br>
                Please type your email address here:
            </p>
            <input
                className="ml-5 mr-5 mt-4 w-[270px] pl-1"
                id="EmailAddress"
                type="text"
                ref={autofocusID}
                placeholder=""
                autoComplete="new-password"
                value={params.EmailAddress}
                onChange={(e) => {params.setEmailAddress(e.target.value);}}
            />
            <p className=" ml-5 mb-0 mt-2 text-cyan-300 text-left text-sm">
                {params.EmailAddressError}&nbsp;
            </p>

            <div className="flex flex-row">                         
                <button
                    className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                 mt-2 ml-12"
                    id="SendLink"
                    style={{ width: "100px" }}
                    onKeyDown={handleKeys}                    
                    onClick={() => {params.setState(states.VERIFY_PAGE_1);}
                    }>                    
                    Send Link
                </button>

                <button
                    className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                               mt-2 ml-5"
                    id="Cancel"
                    style={{ width: "100px" }}
                    onKeyDown={handleKeys}
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
    //
    // handleKeys()
    // ============
    // Key event handler to trap the Enter and Escape keys on this page.
    //
    const handleKeys = (e) => {
       if (e.key === 'Enter') {        
           document.getElementById('Next').click(); 
        } else if (e.key === 'Cancel') {
           document.getElementById('Back').click();
        }
    }; 

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
                <button
                    className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                 mt-2 ml-12"
                    id="Back"
                    style={{ width: "100px" }} 
                    onKeyDown={handleKeys}                   
                    onClick={() => {params.setState(states.PAGE_1);}
                    }>                    
                    Back
                </button>

                <button
                    className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
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
// This page is displayed when the user clicks on the link in the email sent to
// them.
// 
function Page_3(params) {   
    //
    // handleKeys()
    // ============
    // Key event handler to trap the Enter and Escape keys on this page.
    //
    const handleKeys = (e) => {
       if (e.key === 'Enter') {        
           document.getElementById('SignIn').click(); 
        } else if (e.key === 'Cancel') {
           document.getElementById('Back').click();
        }
    }; 

    //
    // autofocus()
    // ===========
    // Set the focus automatically to the first input field after
    // the component has rendered properly.
    //
    const autofocusID = useRef(null);
    useEffect(() => {
        if (autofocusID.current) {
            autofocusID.current.focus();
        }    
    },[]);

    
    return (
        <div className = "mb-0">
            <p className="text-white text-center font-bold text-xl mt-0">
                Resetting your password
            </p>

            <p className="ml-5 mb-1 mt-4 w-72 text-white text-left">
                Enter the verification code 
            </p>
            <input
                className="ml-5 mb-0 mt-1 w-[275px] pl-1"
                id = "VerificationCode"
                ref={autofocusID}
                type = "text"
                placeholder = ""
                autoComplete = "new-password"
                value = {params.VerificationCode}
                onKeyDown={handleKeys}
                onChange = {(e) => params.setVerificationCode(e.target.value.trim())}
            />
            <p className="ml-5 mb-1 mt-2 text-cyan-300 text-left text-sm">
                {params.VerificationCodeError}&nbsp;
            </p>   

            <p className="ml-5 mb-1 mt-2 w-70 text-white text-left">    
                Enter your new password                
            </p>        
            <div className="flex flex-row">            
                <input
                    className="ml-5 mt-1 w-[277px] pl-1"
                    id = "Password"                        
                    type = {params.PasswordVisibility}
                    placeholder = ""
                    autoComplete = "new-password"
                    value = {params.Password}
                    onKeyDown={handleKeys}
                    onChange = {(e) => params.setPassword(e.target.value.trim())}
                />
                <img
                    className="mr-5 ml-0 mt-1 h-6 w-7"
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
            <p className="ml-5 mb-1 mt-2 text-cyan-300 text-left text-sm">
                {params.PasswordError}&nbsp;
            </p>            

            <p className=" ml-5 mb-1 mt-0 text-white text-left">
                Please enter your new password again
            </p>
            <div className="flex flex-row">    
                <input
                    className="ml-5 mt-1 w-72 pl-1"
                    id = "PasswordCopy"
                    type = {params.PasswordVisibility}
                    placeholder = ""
                    autoComplete = "new-password"
                    value = {params.PasswordCopy}
                    onKeyDown={handleKeys}
                    onChange = {(e) => params.setPasswordCopy(e.target.value.trim())}
                />
                <img
                    className="mr-5 ml-0 mt-1 h-6 w-7"
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

            <div className="flex flex-row mt-1">
                <button
                    className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                    mt-2 ml-12"
                    id = "Back"
                    style = {{ width: "100px" }}
                    onClick = {() => {params.setState(states.EXITING)}} >      
                    Cancel
                </button>

                <button
                    className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                mt-2 ml-5"
                    id = "Sign_In"
                    style = {{ width: "100px" }}
                    onClick={() => {params.setState(states.VERIFY_PAGE_3);}} >      
                    Sign In
                </button>
            </div>
        </div>
    );
}
