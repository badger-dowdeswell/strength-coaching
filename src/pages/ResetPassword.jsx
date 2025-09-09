//
// RESET MY PASSWORD
// =================
// This page allows users to reset their password using a verification
// code that is emailed to them. 
// 
// The email is sent to the email address they enter, but only if that 
// email address can be found in the database. This helps stop hackers
// trying to change the password of an exising user without their approval.
// 
// Revision History
// ================
// 26.02.2025 BRD Original version.
// 01.08.2025 BRD Converted the Strength Research component to now work 
//                with Strength Coaching.
// 03.09.2025 BRD Added the code to send the password reset link to the user
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
// The password reset process operates as a state machine. This allows it to move
// stage-by-stage forwards and backwards, waiting at appropriate times for an
// async process to return a value before transitioning to a new stage. The
// current state is held in resetState, which always contains one of the
// pre-defined resetStates enumerated constants.
//
const resetStates = {
    UNDEFINED: 0,
    PAGE_1: 1,
    VERIFY_PAGE_1: 2, 
    EMAILING_USER: 3,
    PAGE_2: 4,
    VERIFY_PAGE_2: 5,
    PAGE_3: 6,
    VERIFY_PAGE_3: 7,
    CREATING_USER: 8,
    CREATED_USER: 9,
    REGISTERED: 10,
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


    //            let location = useLocation();
    //let token = new URLSearchParams(location.search).get('vt');
    // http://localhost:3000/ResetPassword?vt=dfdfdfdf_HAHHA
    //console.log("URL [" + location.pathname + "] [" + token + "]"); 

    //
    // Reset Password State Control
    // ============================
    // This section defines the state machine that controls the reset password process.
    // The useState Hook ensures that the environment gets updated and re-configured 
    // each time the state changes. This can trigger page transitions, reads and writes 
    // from the database, or the display errors that require the user to correct what 
    // they entered. The set of possible states is defined in the resetStates
    // object declared above.
    //
    const [resetState, setResetState] = useState(resetStates.UNDEFINED);
    useEffect(() => { 
        switch (resetState) {
            case resetStates.UNDEFINED: 
                setResetState(resetStates.PAGE_1);               
                break;

            case resetStates.PAGE_1:                
                break;

            case resetStates.VERIFY_PAGE_1:                
                verifyEmail();                
                break;  
                
            case resetStates.EMAILING_USER:
                console.log("\nEmailing user ...");
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
    // the user so they can correct it.
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
                checkUserExists(EmailAddress);
            }      
        }
    };

    //
    // checkUserExists() 
    // =================
    // Verifys that the user exists by loading their client record using their email address as a key.
    //
    const checkUserExists = async (email_address) => {
        console.log("\ncheckUserExists " + email_address);
        try {
            let response = await axios.get(baseURL + "getUserByEmail?email_address=" + email_address);
            if (response.status === 200) {  
                setUserID(response.data.user_ID);   
                console.log("checkUserExists() found user " + response.data.user_ID);                  
                setResetState(resetStates.EMAILING_USER);  
            }                    
        } catch (err) {
            // No user is registered with that email.
            setUserID("");              
            console.log("checkUserExists() user not found " + err.status); 
            setResetState(resetStates.EMAILING_USER);  
        } 
    };

    //
    // RESET PASSWORD PAGES
    // ====================
    // Displays each of the reset password pages in order to verify the user, email them
    // a password reset link, and let them enter a new password.
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

                    {(resetState === resetStates.EMAILING_USER) && (
                        <Page_2 
                            EmailAddress={EmailAddress} 
                            setResetState={setResetState}                                                            
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

// let location = useLocation();
//    let token = new URLSearchParams(location.search).get('vt');
//    // http://localhost:3000/ResetPassword?vt=dfdfdfdf_HAHHA
//    console.log("URL [" + location.pathname + "] [" + token + "]"); 

//
// Page_1()
// ========
// This component lets the user who is resetting their password enter their 
// email address. This is the initial stage that allows the client to be identified
// by looking up their email. If the email address matches that of an existing user,
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
                The email will also contain a code 
                that you can enter on the reset page.
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
// This component informs the user that an email has been sent to them.
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
    