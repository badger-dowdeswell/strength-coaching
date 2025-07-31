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
//
import "./Main.css";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getBaseURL } from "./getBaseURL";

import Axios from "axios";
const axios = Axios;

const baseURL = getBaseURL();

import SideNav from "./components/SideNav";
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
// ResetPassword
// =============
export default function ResetPassword() {
    let navigate = useNavigate();

    const [UserID, setUserID] = useState("");
    const [EmailAddress, setEmailAddress] = useState("");
    const [EmailAddressError, setEmailAddressError] = useState("");

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
    const [resetState, setResetState] = useState(resetStates.PAGE_1);
    useEffect(() => {    
        //var error = false; 

        switch (resetState) {
            case resetStates.PAGE_1:
                // This is the initial stage that allows the user to enter their email address
                // so that a verification code can be sent to them.
                break;

            case resetStates.VERIFY_PAGE_1:
                // Verify the email address exists and then
                // email the verification code to them.
                break;    

            default:
                break;     
        }    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetState]);

    //
    // RESET PASSWORD PAGES
    // ====================
    // Displays each of the reset password pages in order to 
    // verify the user and enter their new password.
    //
    return (        
        <div>            
            <TopNav title="" userName="" userRole="" />

            <div className="flex absolute top-24 bottom-0
                    items-center justify-center
                    left-0 right-0 bg-gray-800 overflow-hidden">
            
                <div className="flex flex-col box-border border-2 rounded-lg
                                h-200 w-80">
                                
                    {(resetState === resetStates.PAGE_1) && (
                        <Page_1
                            EmailAddress={EmailAddress}
                            setEmailAddress={setEmailAddress}
                            EmailAddressError={EmailAddressError}                                
                            setResetState={setResetState}
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
// Page_1
// ======
// This component lets the user who is resetting their password enter their 
// email address. 
// 
function Page_1(params) {
    let location = useLocation();
    let token = new URLSearchParams(location.search).get('vt');
    // http://localhost:3000/ResetPassword?vt=dfdfdfdf_HAHHA
    console.log("URL [" + location.pathname + "] [" + token + "]"); 

    return (
        <div>
            <p className="text-white text-center text-xl mt-5">Reset my password</p>

            <p className=" ml-5 mb-1 mt-3 text-white text-left">Email address</p>
            <input className="ml-5 mr-5 mt-1 w-64 pl-1"
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

            <p className=" ml-5 mb-1 mt-2 text-white text-left">First name</p>
            <input className="ml-5 mr-5 mt-1 w-64 pl-1"
                id="FirstName"                
                type="text"
                placeholder=""
                autoComplete="new-password"
                value={params.FirstName}
                onChange={(e) => params.setFirstName(e.target.value)}
            />
            <p className=" ml-5 mb-1 mt-2 text-cyan-300 text-left text-sm">
                {params.FirstNameError}&nbsp;
            </p>

            <p className=" ml-5 mb-1 mt-2 text-white text-left">Last name</p>
            <input className="ml-5 mr-5 mt-1 w-64 pl-1"
                id="LastName"
                type="text"
                placeholder=""
                autoComplete="new-password"
                value={params.LastName}
                onChange={(e) => {params.setLastName(e.target.value);}}
            />
            <p className=" ml-5 mb-1 mt-2 text-cyan-300 text-left text-sm">
                {params.LastNameError}&nbsp;
            </p>

            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                            mt-3 ml-28 mb-0"
                id="Next"
                style={{ width: "100px" }}                
                onClick={() => {params.setRegistrationState(resetStates.VERIFY_PAGE_1);}} >
                Next &gt;
            </button>
      </div>
    );
}
    