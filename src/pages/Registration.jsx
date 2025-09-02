//
// REGISTRATION PAGE
// =================
// This is registration page that allows new users to enter their information 
// so that they can become clients.
//
// Revision History
// ================
// 14.01.2024 BRD Original version.
// 22.01.2025 BRD Completed the design and implementation of the initial version.
// 02.02.2025 BRD Completed version 1 release. 
// 19.07.2025 BRD Changed the default user_authority of new users to be U for
//                regular clients.
// 30.07.2025 BRD Cloned for Strength Coaching from the Strength Research application.
//
import "./Main.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBaseURL } from "./getBaseURL";

import Axios from "axios";
const axios = Axios;

const baseURL = getBaseURL();

import TopNav from "./components/TopNav";

import Registration_Person from "./images/Registration_Person.png";
import eye from "./images/password_eye.png";

var default_user_image = "template.png"; // This ensures that there is an image to display
                                         // after the user signs-in for the first time before
                                         // they upload their own image.

//
// RegistrationStates
// ==================
// The registration process operates as a state machine. This allows it to move
// stage-by-stage forwards and backwards, waiting at appropriate times for an
// async process to return a value before transitioning to a new stage. The
// current state is held in registrationState, which always contains one of the
// pre-defined registrationStates constants.
//
const registrationStates = {
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
// Registration
// ============
export default function Registration() {
    let navigate = useNavigate();

    const [UserID, setUserID] = useState("");
    const [EmailAddress, setEmailAddress] = useState("");
    const [EmailAddressError, setEmailAddressError] = useState("");
    const [FirstName, setFirstName] = useState("");
    const [FirstNameError, setFirstNameError] = useState("");
    const [LastName, setLastName] = useState("");
    const [LastNameError, setLastNameError] = useState("");

    // This generates a one-time five-digit registration code for
    // each person who is registering to become a user. 
    const [VerificationCode]
           = useState((Math.floor(Math.random() * (9 * (Math.pow(10, 4)))) +
                      (Math.pow(10, 4))).toString());
    const [VerificationCodeEntered, setVerificationCodeEntered] = useState("");
    const [VerificationCodeError, setVerificationCodeError] = useState("");

    const [Password, setPassword] = useState("");
    const [PasswordError, setPasswordError] = useState("");
    const [PasswordCopy, setPasswordCopy] = useState("");
    const [PasswordCopyError, setPasswordCopyError] = useState("");

    // Used to control the visibility of the password by switching the
    // input type between "text" and "password".
    const [PasswordVisibility, setPasswordVisibility] = useState("password");
    
    //
    // Registration State Control
    // ==========================
    // This section defines the state machine that controls the sign-in
    // process. The useState Hook ensures that the environment gets
    // updated and re-configured each time the state changes. This
    // can trigger page transitions, read and write from the database,
    // or display errors and make the user correct what they entered.
    // The set of possible states is defined in the registrationStates
    // object declared above.
    //
    const [registrationState, setRegistrationState] = useState(registrationStates.PAGE_1);
    useEffect(() => {    
        var error = false;
        // console.log("registrationState " + registrationState);

        switch (registrationState) {
            case registrationStates.PAGE_1:
                // This is the initial stage that allows the user to enter their email address,
                // first name, and last name.
                break;

            case registrationStates.VERIFY_PAGE_1:
                if (EmailAddress.trim() === "") {
                    setEmailAddressError("An email address must be entered");
                    error = true;
                } else if (!/\S+@\S+\.\S+/.test(EmailAddress)) {
                    setEmailAddressError("The email address entered is not valid.");
                    error = true;                                                                    
                }

                if (FirstName.trim() === "") {
                    setFirstNameError("A first name must be entered");
                    error = true;
                } else {
                    setFirstNameError("");
                }

                if (LastName.trim() === "") {
                    setLastNameError("A last name must be entered");
                    error = true;
                } else {
                    setLastNameError("");
                }

                if (error) {
                    setRegistrationState(registrationStates.PAGE_1);
                } else {                
                    // check if this email address is already in use                    
                    checkEmail(EmailAddress);                      
                }
                break;  
                
            case registrationStates.EMAILING_USER:
                console.log("In registrationStates.EMAILING_USER");
                emailUser();               
                break;
            
            case registrationStates.PAGE_2:
                // This is the next stage that allows the user to enter the registration
                // code that was emailed to them during the previous stage. 
                setEmailAddressError("");
                break;

            case registrationStates.VERIFY_PAGE_2:
                if (VerificationCode.trim() === "") {
                    setVerificationCodeError("Please enter the code you received.");
                    setRegistrationState(registrationStates.PAGE_2);
                    error = true;                
                } else if (VerificationCode.trim() !== VerificationCodeEntered) {
                    setVerificationCodeError("The registration code entered is not valid.");
                    setRegistrationState(registrationStates.PAGE_2);
                } else {
                    setVerificationCodeError("");
                    setRegistrationState(registrationStates.PAGE_3);
                }
                break;

            case registrationStates.PAGE_3:
                // This page is displayed when the new user is ready to be 
                // created after they have entered their registration code 
                // correctly. It allows them to set their password and then
                // navigate to the sign in page for the first time.
                break;

            case registrationStates.VERIFY_PAGE_3:
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
                    setRegistrationState(registrationStates.PAGE_3);
                } else {                      
                    setRegistrationState(registrationStates.CREATING_USER);
                }
                break;

            case registrationStates.CREATING_USER:                             
                if (createUser()) {                                     
                    setRegistrationState(registrationStates.REGISTERED);    
                } else {
                    // MARK: RA_Badger. Need to determine what to do here if
                    // something goes wrong while creating the new user.
                    setRegistrationState(registrationStates.PAGE_3);        
                }                 
                break;    

            case registrationStates.REGISTERED:
                // Registration has been completed successfully.
                return navigate("/SignIn");    

            default:
                break;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [registrationState]);

    //
    // emailUser()
    // ===========
    // Sends an email to the address the new user specified. The email contains
    // an introductory message and the verification code they need to enter
    // to continue. 
    //
    async function emailUser() {
        console.log("Emailing user " + EmailAddress + " " + VerificationCode);

        const html_body = "<p>Thank you for registering a new Strength Coaching Online account.</p>" +                          
                          "<p>Please enter this verification code into the registration page:</p>" +                           
                          "<h1 style='text-align: center; font-size: 25px;'>" + VerificationCode + "</h1>" +  
                          "<p>The verification code is valid for the next 20 minutes.</p>" +                           
                          "<p>I look forward to working with you to help you get strong.</p>" +
                          "<p>Kind regards,</p>" +
                          "</p>Luke Selway</p>";

        await axios.put(baseURL + "sendMail", {
            sender_email_address: "info@strengthresearch.online",            
            recipient_email_address: EmailAddress, 
            subject: "Your Strength Coaching Online account registration code",             
            html_body: html_body           
        })
        .then((response) => {
            if (response.status === 200) {
                console.log("email sent");
                setRegistrationState(registrationStates.PAGE_2);
                         
            } else if (response.status === 500) {
                console.log("emailUser error: 500 " + response);                
                setRegistrationState(registrationStates.PAGE_1);                
            }    
        })
        .catch(err => {
            console.log("emailUser error: " + err.message);
            setRegistrationState(registrationStates.PAGE_1); 
        })  
    }
    
    //
    // checkEmail()
    // ============
    // Verifies that the email address that the user wants to register for
    // their use is not already in use by another user.
    //
    async function checkEmail(email_address) {           
        await axios.get(
            baseURL + "getUserByEmail?email_address=" + encodeURIComponent(email_address.trim())
        ).then (response => {            
            if (response.status === 200) {                  
                setEmailAddressError("That email address is already registered.")                 
                setRegistrationState(registrationStates.PAGE_1)                
            } else if (response.status === 404) {
                // That email address is not in use. 
                setEmailAddressError("");       
                setRegistrationState(registrationStates.EMAILING_USER);           
            }
        }).catch(err => {
          // The email address was not found.
          setEmailAddressError("");
          setRegistrationState(registrationStates.EMAILING_USER);
        });     
    }

    //
    // createUser
    // ==========
    // Create a new user in the user table. The user_ID is automatically generated
    // and returned by the express api. It is returned in the response and can be
    // used during subsequent updates.
    //    
    const createUser = async () => {
        var status = false; 

        axios.put(baseURL + "createUser", {
            user_authority: "U",
            password: Password,
            user_status: "A",  
            registration_token: VerificationCode,          
            first_name: FirstName,            
            last_name: LastName,
            email_address: EmailAddress, 
            user_image: default_user_image
        })
        .then((response) => {
            if (response.status === 200) {
                console.log("createUser response 200");
                console.log("UserID " + response.data.user_ID);
                setUserID(response.data.user_ID);
                status = true;              
            } else if (response.status === 500) {
                console.log("createUser response 500 " + response);                
                setRegistrationState(registrationStates.PAGE_1);
                status = false;
            }    
        })
        .catch(err => {
            console.log("createUser error: " + err.message);  
            status = false;      
        })
        return status;
    };   
    
    //
    // REGISTRATION PAGES
    // ==================
    // Displays each of the registration pages in order to enter
    // and verify the information supplied.
    //
    return (        
        <div>                           
            <TopNav title="" userName="" userRole="" />

            <div className="flex absolute top-24 bottom-0
                    items-center justify-center
                    left-0 right-0
                    bg-gray-800 overflow-hidden"> 
            
                <div className="flex flex-col box-border border-2 rounded-lg
                                h-200 w-80">
                    {(registrationState === registrationStates.PAGE_1) && (
                        <Page_1
                            EmailAddress={EmailAddress}
                            setEmailAddress={setEmailAddress}
                            EmailAddressError={EmailAddressError}
                            FirstName={FirstName}
                            setFirstName={setFirstName}
                            FirstNameError={FirstNameError}
                            LastName={LastName}
                            setLastName={setLastName}
                            LastNameError={LastNameError}
                            setRegistrationState={setRegistrationState}
                            navigate={navigate}
                        />
                    )}; 

                    {(registrationState === registrationStates.EMAILING_USER) && ( 
                        <Emailing 
                        />
                    )};    
        
                    {(registrationState === registrationStates.PAGE_2) && (
                        <Page_2
                            VerificationCode={VerificationCode}
                            EmailAddress={EmailAddress}
                            VerificationCodeEntered={VerificationCodeEntered}
                            setVerificationCodeEntered={setVerificationCodeEntered}
                            VerificationCodeError={VerificationCodeError}
                            setRegistrationState={setRegistrationState}
                        />
                    )};    
            
                    {registrationState === registrationStates.PAGE_3 && (
                        <Page_3 
                            PasswordVisibility={PasswordVisibility}   
                            setPasswordVisibility={setPasswordVisibility}                              
                            Password={Password}
                            setPassword = {setPassword}
                            PasswordError = {PasswordError}                                    
                            PasswordCopy={PasswordCopy}
                            setPasswordCopy = {setPasswordCopy}
                            PasswordCopyError = {PasswordCopyError}
                            setRegistrationState={setRegistrationState}                                    
                        />
                    )};
                </div>

                <div className="relative flex items-center justify-center mt-0 ml-3">
                    <img className="rounded"
                        src={Registration_Person}
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
// This component lets the user who is registering enter their email address,
// their first name, and their last name.
//
function Page_1(params) {
    return (
        <div>
            <p className="text-white text-center font-bold text-xl mt-5">Registration</p>

            <p className=" ml-7 mb-1 mt-3 text-white text-left">Email address</p>
            <input className="ml-7 mr-5 mt-1 w-64 pl-1"   
                id="EmailAddress"
                type="text"
                placeholder=""
                autoComplete="new-password"
                value={params.EmailAddress}
                onChange={(e) => {params.setEmailAddress(e.target.value);}}
            />
            <p className="ml-7 mb-0 mt-2 text-cyan-300 text-left text-sm">
                {params.EmailAddressError}&nbsp;
            </p>

            <p className=" ml-7 mb-1 mt-2 text-white text-left">First name</p>
            <input className="ml-7 mr-5 mt-1 w-64 pl-1"
                id="FirstName"                
                type="text"
                placeholder=""
                autoComplete="new-password"
                value={params.FirstName}
                onChange={(e) => params.setFirstName(e.target.value)}
            />
            <p className=" ml-7 mb-1 mt-2 text-cyan-300 text-left text-sm">
                {params.FirstNameError}&nbsp;
            </p>

            <p className=" ml-7 mb-1 mt-2 text-white text-left">Last name</p>
            <input className="ml-7 mr-5 mt-1 w-64 pl-1"
                id="LastName"
                type="text"
                placeholder=""
                autoComplete="new-password"
                value={params.LastName}
                onChange={(e) => {params.setLastName(e.target.value);}}
            />
            <p className=" ml-7 mb-1 mt-2 text-cyan-300 text-left text-sm">
                {params.LastNameError}&nbsp;
            </p>

            <div className="flex flex-row">
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                 mt-2 ml-12 mb-0"
                    id="Next"
                    style={{ width: "100px" }}                
                    onClick={() => {params.setRegistrationState(registrationStates.VERIFY_PAGE_1);}} >
                    Next &gt;
                </button>

                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                mt-2 ml-5"
                    id="Cancel"
                    style={{ width: "100px" }}                
                    onClick={() => {params.navigate("/")}} >
                    Cancel
                </button>
            </div>
      </div>
    );
}

//
// Emailing
// ========
// 
function Emailing() {
    return (
        <div>
            <div className="h-[350px] w-[80px]"> 
                <p className="text-white font-bold text-xl ml-24 mt-0 w-40">Registration</p>
                <p className=" ml-10 mb-1 mt-2 w-64 text-white text-left">
                    Sending an email with a verification code to your email address...
                </p>
            </div>
        </div>
    );
}

//
// Page_2
// ======
// This component lets the user enter the registration code they
// have received via an email sent in the previous registration
// stage.
//
function Page_2(params) {
    // MARK: RA_Badger: Debug only so remove once the email is working.
    console.log("Verification code " + params.VerificationCode)

    return (
        <div className = "mb-1">
            <p className="text-white text-center font-bold text-xl mt-0">
                Verifying your details
            </p>

            <p className=" ml-5 mb-1 mt-2 w-64 text-white text-left">
                A verification code has been sent to your email address.
            </p>
            <p className=" ml-5 mb-1 mt-5 w-64 text-white text-left">
                Please enter the code you received.
            </p>

            <input className="ml-5 mt-1 w-24 pl-1"
                id = "VerificationCode"
                type = "text"
                placeholder = ""
                autoComplete = "new-password"
                value = {params.VerificationCodeEntered}
                onChange = {(e) => params.setVerificationCodeEntered(e.target.value)}
            />
            <p className="ml-5 mb-2 mt-2 text-cyan-300 text-left text-sm">
                {params.VerificationCodeError}&nbsp;
            </p>

            <p className="ml-5 mb-1 mt-0 w-64 text-white text-left">
                If you did not receive an email, click Back and check your
                email address. A new code will be then be sent to the email
                address you entered.
            </p>

            <div className="flex flex-row">
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                  mt-5 ml-5"
                    id = "Back"
                    style = {{ width: "100px" }}                    
                    onClick = {() => {params.setRegistrationState(registrationStates.PAGE_1);}} >      
                    &lt; Back
                </button>

                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                              mt-5 ml-14"
                    id = "Next"
                    style = {{ width: "100px" }}                    
                    onClick={() => {params.setRegistrationState(registrationStates.VERIFY_PAGE_2);}} >      
                    Next &gt;
                </button>
            </div>
        </div>
    );
}

//
// Page_3
// ======
// This component lets the user enter and confirm their password.
// This is the final stage after completing the first and second
// registration steps on Pages 1 and 2.
//
function Page_3(params) {
    return (
        <div className = "mb-1">
            <p className="text-white text-center text-xl mt-0">
                Setting your password
            </p>

            <p className="ml-5 mb-1 mt-3 w-72 text-white text-left">
                Your Strength Research Online profile has been created. 
            </p>

            <p className="ml-5 mb-1 mt-3 w-64 text-white text-left">    
                Enter the password you want to use                
            </p>        
            <div className="flex flex-row">            
                <input className="ml-5 mt-1 w-72 pl-1"
                       id = "Password"
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
            <p className="ml-5 mb-2 mt-2 text-cyan-300 text-left text-sm">
                {params.PasswordCopyError}&nbsp;
            </p>

            <div className="flex flex-row mt-5">
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                  mt-5 ml-5"
                    id = "Back"
                    style = {{ width: "100px" }}
                    onClick = {() => {params.setRegistrationState(registrationStates.PAGE_2);}} >      
                    &lt; Back
                </button>

                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                              mt-5 ml-14"
                    id = "Sign_In"
                    style = {{ width: "100px" }}
                    onClick={() => {params.setRegistrationState(registrationStates.VERIFY_PAGE_3);}} >      
                    Sign In
                </button>
            </div>
        </div>
    );
}
