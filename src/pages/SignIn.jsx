//
// SIGN-IN
// =======
// This is the Strength Coaching Online Sign In page where registered
// users can enter their credentials to authenticate so they can access
// the rest of the site. They cannot proceed further without signing in
// The page also contains a link to the registration page for new users
// as well as a link to help them if they have forgotten their password.
//
// Revision History
// ================
// 09.01.2025 BRD Original version.
// 01.08.2025 BRD Converted the Strength Research component to now work 
//                with Strength Coaching.
// 12.08.2025 BRD Added support for user images specifed in the User table.
// 05.09.2025 BRD Added cool autofocus feature to the first input field on
//                the page.
//
import "./Main.css";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getBaseURL } from "./getBaseURL";
import { states } from "./Constants";

import Axios from "axios";
const axios = Axios;

const baseURL = getBaseURL();

import TopNav from "./components/TopNav";
import Sign_In_Michaela from "./images/Sign_In_Michaela.png";
import eye from "./images/password_eye.png";

//
// SIGN-IN
// =======
export default function SignIn() {
    let navigate = useNavigate();  
    
    const [UserID, setUserID] = useState("");
    const [JWT, setJWT] = useState("");
    const [UserAuthority, setUserAuthority] = useState("");
    const [UserStatus, setUserStatus] = useState("");
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Password, setPassword] = useState("");
    const [RememberMe, setRememberMe] = useState(false);
    const [UserImage, setUserImage] = useState("");

    const [UserIDError, setUserIDError] = useState("");
    const [PasswordError, setPasswordError] = useState("");
    const [SignInError, setSignInError] = useState("");

    // Used to control the visibility of the password by switching the
    // input type between "text" and "password".
    const [PasswordVisibility, setPasswordVisibility] = useState("password");

    //
    // Editing state control
    // =====================
    // This section defines the state machine that controls the sign-in
    // process. The useState Hook ensures that the environment gets
    // re-configured each time the state changes.
    //
    const [state, setState] = useState(states.LOADING);
    useEffect(() => {
        switch (state) {
        case states.LOADING:
            //console.log("Loading...");
            // This is the initial stage that allows the user to enter their user
            // ID or email and then supply their password. Reset their credentials
            // if they are in a session where they authenticated successfully earlier.
            sessionStorage.setItem("userID", "");
            sessionStorage.setItem("FirstName", "");
            sessionStorage.setItem("LastName", "");
            sessionStorage.setItem("UserAuthority", "");
            sessionStorage.setItem("UserImage", "");
            sessionStorage.setItem("JWT", "");            
            break;

        case states.AUTHENTICATING:
            // The user should have entered an email address or an alias
            console.log("Authenticating ...");
            var error = false;
            setSignInError("");
            setUserID(UserID.trim());
            if (UserID === "") {
                setUserIDError("A user ID or email address must be entered");
                error = true;
            } else {
                setUserIDError("");
            }

            setPassword(Password.trim());
            if (Password === "") {
                setPasswordError("A password must be entered");
                error = true;
            } else {
                setPasswordError("");
            }

            if (error) {
                setState(states.LOADING);
            } else {
                authenticateUser(UserID, Password);
            }
            break;

        case states.AUTHENTICATED:
            // This is set when the user has been authenticated and can begin using the
            // adminstration services inside.
            console.log("Authenticated...");
            //document.removeEventListener('keydown', keyListener);
            sessionStorage.setItem("userID", UserID);
            sessionStorage.setItem("FirstName", FirstName);
            console.log("Authenticated FirstName " + FirstName);
            sessionStorage.setItem("LastName", LastName);
            sessionStorage.setItem("UserAuthority", UserAuthority);
            sessionStorage.setItem("UserImage", UserImage);
            sessionStorage.setItem("JWT", JWT);
            return navigate("/Home");

        case states.NOT_AUTHENTICATED:
            console.log("Not Authenticated...");
            setSignInError(!SignInError);
            setUserIDError("");
            setPasswordError("Either your user ID or password is incorrect.");            
            break;

        case states.CHANGING_PASSWORD:
            // The user is requesting to change their password from the
            // Sign-In page. RA_BRD Not implemented yet.
            break;

        case states.FORGOT_PASSWORD:
            // The user is requesting help since they have forgotten their
            // password. RA_BRD Not implemented yet.
            return navigate("/ResetPassword");    
            
        case states.REGISTER:
            // The user is requesting to register a new account.
            return navigate("/Registration");    
            
        case states.ERROR:            
            setState(states.LOADING);
            break;

        default:
            break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    //
    // authenticateUser() 
    // ==================
    // Authenticates the user by verifying that their registration ID number or their email address can be
    // located by the back-end and that their password matches the encrypted one stored in the database.
    //
    // If the user is authenticated, a JSON Web Token (JWT) is returned from the back-end. This is saved to
    // the session storage so that it can be used to authorise all subsequent data requests from the back
    // end.
    //
    const authenticateUser = async (UserID, Password) => {
        try {
            let response = await axios.get( 
                baseURL +
                "authenticateUser?user_ID=" +
                encodeURIComponent(UserID) +
                "&password=" +
                encodeURIComponent(Password)
            );
            if (response.status === 200) {
                // The user was found and their credentials were authenticated.
                //console.log("\nauthenticate(): " + response.status + "\n");
                setUserStatus(response.data.userStatus);
                setUserID(response.data.user_ID);
                setFirstName(response.data.first_name);
                console.log("First_name " + response.data.first_name);
                setLastName(response.data.last_name);
                setUserAuthority(response.data.user_authority);
                setUserImage(response.data.user_image);
                setJWT(response.data.JWT);
                setState(states.AUTHENTICATED);
            } else {
                setState(states.NOT_AUTHENTICATED);
            }
        } catch (err) {
            //console.log("authenticateUser error " + err.message);
            setState(states.NOT_AUTHENTICATED);
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

    //
    // handleKeys()
    // ============
    // Key event handler to trap the Enter and Escape keys during sign-in.
    //
    const handleKeys = (e) => {
       if (e.key === 'Enter') {        
           document.getElementById('SignIn').click(); 
        } else if (e.key === 'Escape') {
           document.getElementById('Cancel').click();
        }
    }; 
   
    //
    // SIGN-IN
    // =======
    // Render the sign-in page.
    //
    return ( 
        <div>                           
            <TopNav title="" userName="" userRole="" userImage=""/>

            <div className="absolute flex top-24 bottom-0
                            items-center justify-center
                            left-0 right-0 bg-gray-800 overflow-y-hidden">
                                    
                <div className="flex flex-col box-border border-2 rounded-lg
                                h-82 w-80 ">
                    <p className="text-white text-center text-xl mt-5">Sign In</p>

                    <p className=" ml-5 mb-1 mt-3 text-white text-left">
                        Your email address or alias                        
                    </p>

                    <input className="ml-5 mr-5 mt-1 pl-1"
                        id="UserID"
                        type="text"
                        ref={autofocusID}
                        placeholder="nnnn or email address"
                        autoComplete="new-password"
                        value={UserID}
                        onKeyDown={handleKeys}
                        onChange={(e) => setUserID(e.target.value)}                        
                    />
                    <p className=" ml-5 mb-1 mt-2 text-cyan-300 text-left text-sm">
                        {UserIDError}&nbsp;
                    </p>

                    <p className="ml-5 mb-1 mt-2 text-white text-left">
                        Your password{" "}
                    </p>
                
                    <div className="flex flex-row">
                        <input className="ml-5 mt-1 w-72 pl-1"
                            id="Password"
                            type={PasswordVisibility}
                            placeholder="********"
                            autoComplete="new-password"
                            value={Password}
                            onKeyDown={handleKeys}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <img className="mr-5 ml-0 mt-1 h-6 w-7"
                            src={eye}
                            alt="/"
                            onClick={() => {
                                if (PasswordVisibility === "password") {
                                    setPasswordVisibility("text");
                                } else {
                                    setPasswordVisibility("password");
                                }
                            }}
                        />
                    </div>
                    <p className="ml-5 mb-1 mt-2 text-cyan-300 text-left text-sm">
                        {PasswordError}&nbsp;
                    </p>

                    <div className="flex flex-row">  
                        <input className="ml-5 mt-0 h-6 bg-cyan-600 text-left text-sm"
                            type="checkbox"
                            value={RememberMe}
                            checked={RememberMe}                                
                            onChange={() => setRememberMe(RememberMe => !RememberMe)}
                        />
                        <p className="ml-3 mb-1 mt-0 text-white text-left">
                            Remember me
                        </p>
                    </div> 

                    <p className=" ml-5 mb-0 mt-0 text-cyan-300 text-left text-sm"
                            onClick={() => {setState(states.FORGOT_PASSWORD)}
                        }>
                        Forgot your password? Click here to reset it...
                    </p>

                    <p className=" ml-5 mb-1 mt-3 text-cyan-300 text-left text-sm"
                            onClick={() => {setState(states.REGISTER)}
                        }>
                        Not registered? Click here to register...
                    </p>

                    <div className="flex flex-row">                         
                        <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        mt-2 ml-12"
                            id="SignIn"
                            style={{ width: "100px" }}
                            onClick={() => {
                                setState(states.AUTHENTICATING);
                            }}>
                            Sign In
                        </button>

                        <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        mt-2 ml-5"
                            id="Cancel"
                            style={{ width: "100px" }}
                            onClick={() => {
                                navigate("/");
                            }}>
                            Cancel
                        </button>
                    </div>    
                    <p className=" ml-5 mb-0 mt-0 text-cyan-300 text-left text-sm">
                        &nbsp;
                    </p>
                </div>                
                
                <div className="relative flex items-center justify-center mt-0 ml-3 h-82 w-80">
                    <img className="absolute rounded"                    
                        src={Sign_In_Michaela}
                        alt="/"
                        draggable={false}                            
                        width={295}
                    />
                </div>                 
            </div>            
        </div>        
    );
};
                           