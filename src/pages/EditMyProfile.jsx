//
// EDIT MY PROFILE
// ===============
// This page allows the client to edit their own private profile as a user on Strength Research Online.
// They must be authenticated and logged in to access their own details and change them. A different
// page MaintainClients is used by administrators and trainers to view and change the profiles of
// all their clients from one central page. 
//
// Revision History
// ================
// 25.02.2025 BRD Original version.
// 29.03.2025 BRD Extensive updates to fields and validation to just make everything smoother and
//                tighter.              
// 05.04.2025 BRD Added the custom modal dialog functionalty for cancelling changes.
// 30.06.2025 BRD Added functionality to check for possible duplicate Alias or PIN numbers while
//                editing client profiles.
// 29.08.2025 BRD Completed the addition of image uploads for the Picture and Password page as well
//                as allowing the user to change and verify their password.
//
import './Main.css';

import TopNav from "./components/TopNav";
import { getBaseURL } from "./components/getBaseURL";
import { useEffect, useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { states, pages } from "./Constants";
import { Salutations, Countries} from "./components/LookUpLists";
import { formatDate, decodeISOdate, validateDate } from "./components/DateLib";
import Modal from "./components/Modal";
import eye from "./images/password_eye.png";

import Axios from 'axios';
const axios = Axios;
const baseURL = getBaseURL();

//
// EditMyProfile()
// =============== 
export default function EditMyProfile() {
    const navigate = useNavigate();  
    
    //console.log = function () {};
    //console.info = function () {};
    //console.warn = function () {};
    //console.error = function () {}; // Consider keeping console.error for critical issues
    //console.debug = function () {};


    const [errors, setErrors] = useState([]);  
    const [IsChanged, setIsChanged] = useState(false);    
    
    const [UserID, setUserID] = useState();
    const [UserAuthority, setUserAuthority] = useState(); 
    const [Password, setPassword] = useState("");   
    const [Salutation, setSalutation] = useState();    
    const [FirstName, setFirstName] = useState("");    
    const [LastName, setLastName] = useState("");    
    const [Alias, setAlias] = useState(""); 
    const [PhoneNumber, setPhoneNumber] = useState("");    
    const [EmailAddress, setEmailAddress] = useState("");
    const [Address1, setAddress1] = useState("");    
    const [Address2, setAddress2] = useState("");
    const [Address3, setAddress3] = useState("");
    const [Suburb, setSuburb] = useState("");    
    const [City, setCity] = useState("");    
    const [Postcode, setPostcode] = useState(""); 
    const [StateProvince, setStateProvince] = useState("");   
    const [Country, setCountry] = useState("");
    const [DateOfBirth, setDateOfBirth] = useState("");    
    const [UserImage, setUserImage] = useState();

    // Used to control the visibility of the password by switching the
    // input type between "text" and "password".
    const [PasswordVisibility, setPasswordVisibility] = useState("password");     
    const [PasswordCopy, setPasswordCopy] = useState("");    
            
    //
    // Authentication and Navigation()
    // ===============================
    // Checks to see if the local storage has a user_ID set to ensure that
    // only authenticated uses can navigate around the application. This
    // is also a convenient way of logging out. When the user_ID is set to
    // blank via the Sign-out button click, there is no longer an
    // authenticated user.
    //    
    var user_ID = sessionStorage.getItem("user_ID");      
    const JWT = sessionStorage.getItem('JWT');
    
    useEffect(() => {
        if (!user_ID.trim() || !JWT.trim()) {
            // The page is being accessed by an unauthorised user so redirect them
            // back to the landing page.
            return navigate("/"); 
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user_ID, JWT]);
    
    //
    // Editing state control()
    // =======================
    // This section defines the state machine that controls the profile editing
    // process. The useState and useEffect hooks ensure that the environment is
    // re-configured appropriately each time the state changes. The currentPage 
    // state controls which page of the tabbed dialog is currently displayed.
    //
    const [state, setState] = useState(states.LOADING);
    const [currentPage, setCurrentPage] = useState(pages.UNDEFINED);

    useEffect(() => {
        switch (state) {
        case states.LOADING:
            // This is the initial stage that loads the user's profile ready
            // for editing.            
            setCurrentPage(pages.PAGE_1);                        
            getUser(user_ID);            
            break;  

        case states.EDITING:                              
            break;  

        case states.VALIDATING_STAGE_1:           
            checkDuplicateAlias(UserID, Alias);
            break;

        case states.VALIDATING_STAGE_2:           
            checkDuplicateEmail(UserID, EmailAddress);
            break;
            
        case states.VALIDATING_STAGE_3:
            validate();         
            break;
    
        case states.UPDATING: 
            sessionStorage.setItem("FirstName", FirstName);
            sessionStorage.setItem("LastName", LastName);
            sessionStorage.setItem("UserImage", UserImage);            
            updateUser(); 
            break;

        case states.CANCELLING:
            // Information may have changed so confirm that the user
            // really does wish to undo the changes they have made.
            ConfirmCancel();            
            break;

        case states.EXITING:
            return navigate("/Home");                   

        case states.NOT_AUTHENTICATED:
        case states.NOT_FOUND:        
            // Either the user record could not be read or the user is not authorised
            // to access this page and its functionality. Sign them out and return
            // them to the landing page.
            break;            

        default:
            break;    
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    //
    // checkDuplicateAlias()
    // =====================
    // Checks if the alias selected by the use is already assigned to another user. This is called when
    // the editingStatus is set to VALIDATING_STAGE_1.
    //
    const checkDuplicateAlias = async (user_ID, alias) => {  
        if (alias.trim()) { 
            try {
                let response = await axios.get(baseURL + "duplicateAlias?user_ID=" + user_ID + "&alias=" + alias + "&JWT=" + JWT);
                // Another user is already using that alias.                
                if (response.status === 200) {
                    console.log("duplicateAlias 200");    
                    errors.Alias="That alias is already in use";                
                    errors.page = 1;   
                    setState(states.EDITING);  
                } else if (response.status === 404) {
                    console.log("duplicateAlias 404");    
                }            
            } catch (err) {
                // No other user is using that alias. That means that the query did not return anything so it returns
                // like an error via this section.                
                errors.Alias = "";  
                errors.page = 0;
                setState(states.VALIDATING_STAGE_2); 
            }
        } else {
            // The user has set their alias blank so move on to the second validation stage without checking it.
            setState(states.VALIDATING_STAGE_2);
        }
    };   

    //
    // checkDuplicateEmail()
    // =====================
    // Checks if the email address specified by the use is already assigned to another user. This is called when
    // the editingStatus is set to VALIDATING_STAGE_2.
    //
    const checkDuplicateEmail = async (user_ID, email_address) => {  
        if (email_address.trim()) { 
            try {
                let response = await axios.get(baseURL + "duplicateEmail?user_ID=" + user_ID + "&email_address=" + email_address + "&JWT=" + JWT);
                // Another user is already using that alias.                
                if (response.status === 200) {
                    errors.EmailAddress="That email address is in use";                
                    errors.page = 1;   
                    setState(states.EDITING);  
                }            
            } catch (err) {
                // No other user is using that email. That means that the query did not return anything so it returns
                // like an error via this section.                
                errors.Alias = "";  
                errors.page = 0;
                setState(states.VALIDATING_STAGE_3); 
            }
        } else {
            // The user has set their email blank so move on to the third validation stage without checking it.
            setState(states.VALIDATING_STAGE_3);
        }
    };   

    //
    // validate()
    // ===========
    // Validates the fields prior to updating the user's information. This is called
    // when the editingState is set to VALIDATING_STAGE_3.
    //
    // The return value is the errors object. This contains properties for each of the
    // error messages that are to be displayed. If the data is valid, the record can be 
    // updated. The function also sets a page number where one of the errors is located
    // so that the error is displayed if the user is on a different tabbed dialog page.
    //
    function validate() {
        let errors = {};
        errors.page = 0;

        if (!FirstName.trim()) {
            errors.FirstName = "A first name is required."
            errors.page = 1;
        }

        if (!LastName.trim()) {
            errors.LastName = "A last name is required."
            errors.page = 1;
        }

        if (!EmailAddress.trim()) {
            errors.EmailAddress = "An email address is required.";
            errors.page = 1;
        } else if (!/\S+@\S+\.\S+/.test(EmailAddress)) {
            errors.EmailAddress = "The email address is not valid.";
            errors.page = 1;
        }

        if (!PhoneNumber.trim()) {
            errors.PhoneNumber = "A phone number is required."
            errors.page = 1;
        }

        if (!Address1.trim()) {
            errors.Address1 = "An address is required."
            errors.page = 1;
        }

        if (!Suburb.trim() && !StateProvince.trim()) {
            errors.Suburb = "A suburb name is required."
            errors.page = 1;
        }
        if (!StateProvince.trim() && !Suburb.trim()) {
            errors.StateProvince = "A state is required."
            errors.page = 1;
        }

        if (!City.trim()) {
            errors.City = "A city name is required."
            errors.page = 1;
        }

        if (!Postcode.trim()) {
            errors.Postcode = "A postcode is required."
            errors.page = 1;
        }

        if (!Country.trim()) {
            errors.Country = "A country is required."
            errors.page = 1;
        }
        
        if (!validateDate("YYYY-MM-DD", DateOfBirth)) {
            errors.DateOfBirth = "Invalid date entered";
            errors.page = 1;
        } 
    
        if (!(Password === "") || !(PasswordCopy === "")) {
            // The user is trying to change their password
            if (Password.trim() === "") {
                errors.Password = "A password must be entered";                
                errors.page = 2;
            } else {
                errors.Password = "";
            }
            
            if (PasswordCopy.trim() === "") {
                errors.PasswordCopy = "A copy of your password must be entered";                
                errors.page = 2;
            } else {
                errors.PasswordCopy = "";
            }  

            if (Password.trim() !== PasswordCopy.trim()) {
                errors.Password = "The passwords do not match";
                errors.PasswordCopy = "The passwords do not match";                
                errors.page = 2;
            }        
        } else {
            errors.Password = "";
            errors.PasswordCopy = "";
        }    

        setErrors(errors);
        if (errors.page > 0) {
            setTabColor(currentPage, errors.page);
            setCurrentPage(errors.page);
        }   
        
        if (errors.page === 0) {
            setState(states.UPDATING);
        } else {
            setState(states.EDITING);    
        }
    }; 
    
    //
    // getUser()
    // =========
    // Reads the user's profile information from the database and loads it into the editing fields.
    // Note since this method operates within an aync Promise, it is the safest place to
    // set the editingState so that that state does not get triggered before the read is complete.
    //
    const getUser = async (user_ID) => {         
        try {
            let response = await axios.get(baseURL + "getUser?user_ID=" + user_ID + "&JWT=" + JWT);
            if (response.status === 200) {                               
                setUserID(response.data.user_ID);  
                setUserAuthority(response.data.user_authority || "");                
                setSalutation(response.data.salutation || "");
                setFirstName(response.data.first_name || ""); 
                setLastName(response.data.last_name || "");  
                setAlias(response.data.alias || ""); 
                setPhoneNumber(response.data.phone_number || ""); 
                setEmailAddress(response.data.email_address || ""); 
                setAddress1(response.data.address_1 || ""); 
                setAddress2(response.data.address_2 || ""); 
                setAddress3(response.data.address_3 || ""); 
                setSuburb(response.data.suburb || ""); 
                setCity(response.data.city || ""); 
                setPostcode(response.data.postcode || ""); 
                setStateProvince(response.data.state_province || "");
                setCountry(response.data.country || ""); 
                setDateOfBirth(formatDate("YYYY-MM-DD", decodeISOdate(response.data.date_of_birth)));
                setUserImage(response.data.user_image || "");
                setState(states.EDITING);                              
            } else if (response.status === 404) {
              setState(states.NOT_FOUND);
            }            
        } catch (err) {            
            setState(states.NOT_FOUND);        
        }        
    };

    //
    // updateUser()
    // ============
    // Note that this function passes in either the new, changed, user's password if they
    // have entered and verified one or a blank password. The function getUser() never
    // retrieves their password during editing, so the password will always be blank unless
    // they have changed it. 
    //
    // The back-end API always checks to see if a password has been supplied. If it is not
    // blank, it encrypts it, and then stores it. Note this is secure since the API must be
    // supplied with a valid JWT or else it will not update their record.
    //  
    const updateUser = async () => {        
        axios.put(baseURL + "updateUser?JWT=" + JWT, {
            user_ID: UserID,
            user_authority: UserAuthority,
            password: Password,
            salutation: Salutation,
            first_name: FirstName,
            last_name: LastName,            
            alias: Alias,
            phone_number: PhoneNumber,
            email_address: EmailAddress,
            address_1: Address1,
            address_2: Address2,
            address_3: Address3,
            suburb: Suburb,
            city: City,
            postcode: Postcode,
            state_province: StateProvince,
            country: Country,
            date_of_birth: DateOfBirth,
            user_image: UserImage
        })
        .then((response) => {
            setState(states.EXITING);
        })
        .catch(err => {            
            // RA_Badger
            // swal("Manage Registrant Information",
            // "This user could not be updated because the program has encountered a problem.\n\n" +
            // "The details have been logged and the site administrator has been notified.\n\n" +
            // "Please click OK to continue.");
        })
    };

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
    // EditMyProfile()
    // ===============
    // This component links all the separate tabbed-dialog components together so
    // they can be accessed by the user.
    //
    return (
        <div> 
            <TopNav title="" />

            <div className="flex flex-col absolute top-24 bottom-0
                            items-center justify-center
                            left-0 right-0 bg-gray-800 overflow-hidden">    

                <div className="flex flex-col box-border border-2 rounded-lg    
                                ml-10 mr-10 h-auto w-auto">
                    <div className="flex flex-row">
                        <div>
                            <button className="bg-white text-black text-sm py-1 px-1 border
                                                mb-0 mt-0 ml-0"
                                    id="Page1"
                                    style={{ width: "175px" }}
                                    onClick={() => {
                                        setTabColor(currentPage, pages.PAGE_1);
                                        setCurrentPage(pages.PAGE_1);
                                    }}>
                                My Contact Information
                            </button> 
                        </div>

                        <div>
                            <button className="bg-gray-400 text-black text-sm py-1 border
                                                mb-0 mt-0 ml-0"
                                    id="Page2"
                                    style={{ width: "175px" }}
                                    onClick={() => {
                                        setTabColor(currentPage, pages.PAGE_2);
                                        setCurrentPage(pages.PAGE_2);
                                    }}>
                                Picture and Password
                            </button> 
                        </div>

                        <div>
                            <button className="bg-gray-400 text-black text-sm py-1 border
                                                mb-0 mt-0 ml-0"
                                    id="Page3"
                                    style={{ width: "175px" }}
                                    onClick={() => {
                                        setTabColor(currentPage, pages.PAGE_3);
                                        setCurrentPage(pages.PAGE_3);
                                    }}>
                                Agreement
                            </button> 
                        </div>

                        <div>
                            <button className="bg-gray-400 text-black text-sm py-1 border
                                                mb-0 mt-0 ml-0"
                                    id="Page4"
                                    style={{ width: "175px" }}
                                    onClick={() => {
                                        setTabColor(currentPage, pages.PAGE_4);
                                        setCurrentPage(pages.PAGE_4);
                                    }}>
                                Something else
                            </button> 
                        </div>
                    </div>

                    <hr className="h-px my-0 bg-white border-0"></hr> 

                    {(currentPage === pages.PAGE_1) && (
                        <Page_1
                            UserID={UserID}
                            Salutation={Salutation} setSalutation={setSalutation} 
                            FirstName={FirstName} setFirstName={setFirstName} 
                            LastName={LastName} setLastName={setLastName} 
                            Alias={Alias} setAlias={setAlias}                               
                            EmailAddress={EmailAddress} setEmailAddress={setEmailAddress}                                      
                            PhoneNumber={PhoneNumber} setPhoneNumber={setPhoneNumber}                                       
                            Address1={Address1} setAddress1={setAddress1}                                   
                            Address2={Address2} setAddress2={setAddress2}                      
                            Address3={Address3} setAddress3={setAddress3}                                        
                            Suburb={Suburb} setSuburb={setSuburb}                                       
                            City={City} setCity={setCity}  
                            Postcode={Postcode} setPostcode={setPostcode}                               
                            StateProvince={StateProvince} setStateProvince={setStateProvince}                                    
                            Country={Country} setCountry={setCountry}                                      
                            DateOfBirth={DateOfBirth} setDateOfBirth={setDateOfBirth}
                            errors={errors} setErrors={setErrors}
                            IsChanged={IsChanged} setIsChanged={setIsChanged}
                            state={state} setState={setState} 
                            handleKeys={handleKeys}                                                      
                        />
                    )};

                    {(currentPage === pages.PAGE_2) && (
                        <Page_2
                            userID={UserID}
                            UserImage={UserImage} setUserImage={setUserImage}
                            JWT={JWT}
                            Password={Password} setPassword={setPassword}                            
                            PasswordCopy={PasswordCopy} setPasswordCopy={setPasswordCopy}                             
                            PasswordVisibility={PasswordVisibility} setPasswordVisibility={setPasswordVisibility}
                            errors={errors} setErrors={setErrors}
                            IsChanged={IsChanged} setIsChanged={setIsChanged}
                        />
                    )};    

                    {(currentPage === pages.PAGE_3) && (
                        <Page_3/>
                    )};  

                    {(currentPage === pages.PAGE_4) && (
                        <Page_4/>
                    )};  

                    <div className="flex flex-row justify-center">                        
                        <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                           mb-6 mt-2"
                                id="Update"
                                style={{ width: "100px" }}
                                onClick={() => {
                                    // This stops the user clicking Update while
                                    // the ConfirmCancel dialogue is open.
                                    if (state == states.EDITING) {
                                        setState(states.VALIDATING_STAGE_1);
                                    }    
                                }}>
                            Update
                        </button>    

                        <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2
                                           rounded mb-6 mt-2 ml-8"
                                id="Cancel"
                                style={{ width: "100px" }}
                                onClick={() => {                                
                                    if (IsChanged) {
                                        setTabColor(currentPage, pages.PAGE_1);
                                        setCurrentPage(pages.PAGE_1);
                                        setState(states.CANCELLING);
                                    } else {
                                        setState(states.EXITING);            
                                    }    
                                }}>
                            Back
                        </button>                         
                    </div>
                </div>    
            </div> 
        </div>
    )
}

//
// setTabColour()
// ==============
function setTabColor(currentPage, newTab) {       
    // Reset the colour of the current tab to grey.
    var el = document.getElementById("Page" + currentPage);
    el.style.backgroundColor = "#9ca3af";
    
    // Highlight the new tab by setting its colour to white.
    el = document.getElementById("Page" + newTab);
    el.style.backgroundColor = "#ffffff";        
}

//
// Page_1()
// ========
// The first tabbed dialog page allows fields like names and addresses to be edited.
//
function Page_1(params) { 
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
            <p className="text-white text-center font-bold text-xl mt-5">My Contact Information</p>
            <div className="flex flex-row">
                <div>
                    <p className="ml-5 mb-1 mt-1 text-white text-left">Title or salutation</p>
                    <select className="ml-5 mr-5 mt-1 w-48 pl-0 h-6"
                            id="Salutation"
                            ref={autofocusID}
                            value={params.Salutation}
                            onKeyDown={params.handleKeys}
                            onChange={(e) => {
                                if (params.state === states.EDITING) {
                                    params.setSalutation(e.target.value);
                                    params.setIsChanged(true);
                                }    
                            }}>
                        <Salutations />
                    </select>
                    <p className="ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.Salutation}&nbsp;</p>
                </div>

                <div>
                    <p className="ml-5 mb-1 mt-1 text-white text-left">First name</p>
                    <input className="ml-5 mr-5 mt-1 w-48 pl-1"
                           id="FirstName"
                           type="text" 
                           placeholder=""                       
                           value={params.FirstName}
                           onKeyDown={params.handleKeys}
                           onChange={(e) => {
                                if (params.state === states.EDITING) {
                                    params.setFirstName(e.target.value);
                                    params.setIsChanged(true);
                                }    
                            }}
                    />
                    <p className="ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.FirstName}&nbsp;</p>
                </div>

                <div>
                    <p className="ml-5 mb-1 mt-1 text-white text-left">Last name</p>
                    <input className="ml-5 mr-0 mt-1 w-48 pl-1"
                           id="LastName"
                           type="text"
                           placeholder=""
                           value={params.LastName}
                           onKeyDown={params.handleKeys}
                           onChange={(e) => {
                                if (params.state === states.EDITING) {
                                    params.setLastName(e.target.value);
                                    params.setIsChanged(true); 
                                }      
                            }}
                    />
                    <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.LastName}&nbsp;</p>
                </div>
            </div>

            {/*  Display the cancel dialogue */}
            <div>
                {((params.state === states.CANCELLING)) && (
                    <ConfirmCancel setState={params.setState}
                                   handleKeys={params.handleKeys}
                    />
                )}
            </div>   

            <div>
                <div className="flex flex-row">
                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">
                            Alias or sign-in short name
                        </p>
                        <input className="ml-5 mr-5 mt-1 w-48 pl-1"
                               id="Alias"
                               type="text"
                               placeholder=""
                               value={params.Alias}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setAlias(e.target.value);
                                        params.setIsChanged(true);  
                                    } 
                                }}                                                        
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.Alias}&nbsp;</p>
                    </div>

                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">Email address</p>
                        <input className="ml-5 mr-5 mt-1 w-48 pl-1"
                               id="EmailAddress"
                               type="text"
                               placeholder=""
                               value={params.EmailAddress}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setEmailAddress(e.target.value);
                                        params.setIsChanged(true); 
                                    }      
                                }}
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.EmailAddress}&nbsp;</p>
                    </div>

                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">Phone number</p>
                        <input className="ml-5 mr-0 mt-1 w-48 pl-1"
                               id="PhoneNumber"
                               type="text"
                               placeholder=""
                               value={params.PhoneNumber}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setPhoneNumber(e.target.value);
                                        params.setIsChanged(true); 
                                    }      
                                }}
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.PhoneNumber}&nbsp;</p>
                    </div>
                </div>

                <div className="flex flex-row">
                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">Address line one</p>
                        <input className="ml-5 mr-5 mt-1 w-48 pl-1"
                               id="Address1"
                               type="text"
                               placeholder=""
                               value={params.Address1}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setAddress1(e.target.value);
                                        params.setIsChanged(true); 
                                    }          
                                }}
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.Address1}&nbsp;</p>
                    </div>

                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">
                            Address line two
                        </p>
                        <input className="ml-5 mr-5 mt-1 w-48 pl-1"
                               id="Address2"
                               type="text"
                               placeholder=""
                               value={params.Address2}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setAddress2(e.target.value);
                                        params.setIsChanged(true);  
                                    }     
                                }}
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">&nbsp;</p>
                    </div>

                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">
                            Address line three
                        </p>
                        <input className="ml-5 mr-0 mt-1 w-48 pl-1"
                               id="Address3"
                               type="text"
                               placeholder=""
                               value={params.Address3}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setAddress3(e.target.value);
                                        params.setIsChanged(true);
                                    }       
                                }}
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">&nbsp;</p>
                    </div>
                </div>

                <div className="flex flex-row">
                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">Suburb</p>
                        <input className="ml-5 mr-5 mt-1 w-48 pl-1"
                               id="Suburb"
                               type="text"
                               placeholder=""
                               value={params.Suburb}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setSuburb(e.target.value);
                                        params.setIsChanged(true);
                                    }       
                                }}
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.Suburb}&nbsp;</p>
                    </div>

                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">City</p>
                        <input className="ml-5 mr-5 mt-1 w-48 pl-1"
                               id="City"
                               type="text"
                               placeholder=""
                               value={params.City}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setCity(e.target.value);
                                        params.setIsChanged(true); 
                                    }      
                                }}
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.City}&nbsp;</p>
                    </div>

                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">Postcode</p>
                        <input className="ml-5 mr-0 mt-1 w-48 pl-1"
                               id="Postcode"
                               type="text"
                               placeholder=""
                               value={params.Postcode}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setPostcode(e.target.value);
                                        params.setIsChanged(true);  
                                    }     
                                }}
                        />
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.Postcode}&nbsp;</p>
                    </div>
                </div>

                <div className="flex flex-row">
                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">State</p>
                        <input className="ml-5 mr-5 mt-1 w-48 pl-1"
                               id="State"
                               type="text"
                               placeholder=""
                               value={params.StateProvince}
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setStateProvince(e.target.value);
                                        params.setIsChanged(true);  
                                }     
                            }}
                        />
                        <p className="ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.StateProvince}&nbsp;</p>
                    </div>
                  
                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">Country</p>
                        <select className="ml-5 mr-5 mt-1 w-48 pl-0 h-6"
                                id="Country"
                                value={params.Country}  
                                onKeyDown={params.handleKeys}                                           
                                onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setCountry(e.target.value);
                                        params.setIsChanged(true); 
                                    }     
                                }}>                                             
                            <Countries />
                        </select>
                        <p className="ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.Country}&nbsp;</p>
                    </div>
                            
                    <div>
                        <p className=" ml-5 mb-1 mt-1 text-white text-left">Date of birth</p>                    
                        <input className="ml-5 mr-0 mt-1 w-48 pl-0 h-6"
                               id="DateOfBirth"                        
                               type="date"                                           
                               value = {params.DateOfBirth}  
                               onKeyDown={params.handleKeys}
                               onChange={(e) => {
                                    if (params.state === states.EDITING) {
                                        params.setDateOfBirth(e.target.value);                            
                                        params.setIsChanged(true);
                                    }                                
                                }}                        
                        />                     
                        <p className=" ml-5 mb-1 mt-1 text-cyan-300 text-left text-sm">{params.errors.DateOfBirth}&nbsp;</p>
                    </div>

                    {/* Create a blank heading to keep the alignment correct and position a white box over the 
                        calendar button to hide it.
                    */}        
                    <div>
                        <p className="ml-5 mb-1 mt-1 text-white text-left">&nbsp;</p> 
                        <div className="flex flex-col box bg-white mt-3 -ml-6 h-5 w-6"></div>                              
                    </div> 
                </div>
            </div>
        </div>
    );
} 

//
// Page_2()
// ========
// The second tabbed-dialog page allows the user to upload their profile picture and to change their password.
//
function Page_2(params) {     
    const [uploadState, setUploadState] = useState(states.IDLE); 
    const [files, setFiles] = useState([]); 
    const [preview, setPreview] = useState("./userImages/" + params.UserImage); 
    
    //
    // changeFiles()
    // =============
    // Save the file object that contains the information about the
    // new image chosen and display it as a preview before it is
    // uploaded.
    //
    const changeFiles = (e) => {
        setFiles(e.target.files);
        setPreview(URL.createObjectURL(e.target.files[0]));             
    };
    
    //
    // selectFile
    // ==========
    // This creates a form object to save the file properties of the 
    // selected file so that it can be uploaded to the server via an
    // api call to the back end.
    //
    // RA_BRD Need to send in a parameter to ensure that only valid
    // images can be uploaded to the server. This is an important
    // security consideration.
    //
    async function selectFile(e) {
        if (e.target.files) {
            setFiles(e.target.files);             
            const formData = new FormData();
            formData.append('image', e.target.files);
            setUploadState(states.UPLOADING);  
        }
    }
    
    //
    // encodeFiles
    // ===========
    // Pack the file into a Form object so it can be posted
    // to the server using a back-end api call.
    //
    const encodeFile = (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const file of files) {
            formData.append("photos", file);
        }
        uploadFile(params.JWT, files[0].name, formData);
        params.setIsChanged(true);
    } 
        
    //
    // uploadFile()
    // ============    
    //
    const uploadFile = async (JWT, filename, formData) => { 
        await axios.post(baseURL + "uploadFile?JWT=" + JWT, formData, {                                 
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then((response) => {             
            params.setUserImage(files[0].name);   
            setUploadState(states.UPLOADED);             
        })                
        .catch(err => {                      
            setUploadState(states.ERROR);            
        })
    }
        
    return (
        <div>
            <p className="text-white text-center font-bold text-xl mb-5 center">Change my Profile Picture</p>

            <div className="flex flex-col">
                <div className="flex flex-row">
                    <div className="w-36 h-40">                    
                        <img className="ml-5 mb-5 mt-0"
                             src={preview}
                             alt="/"
                             draggable={false}
                             width={150} 
                             height={150}                        
                             onError={({currentTarget}) => {
                                     currentTarget.onerror = null; // prevents looping
                                     currentTarget.src="./userImages/template.png";                                    
                             }}
                        />
                    </div> 
                      
                    <div className="flex flex-col">
                        <div>
                            <p className="text-white ml-10 mt-0">                                            
                                Click <b>Choose Image</b> to select a new picture from your computer<br></br> 
                                to use as your profile picture. Then click <b>Upload picture</b> to save this<br></br>
                                as your new image.
                            </p>
                        </div>

                        <div className= "flex flex-row mt-5 ml-6">
                            <div>
                                <form onSubmit={encodeFile}
                                    id="submit">                 
                                    <label className="bg-cyan-600 text-white font-bold text-sm py-3 px-3 rounded ml-12 h-10"                    
                                           htmlFor="ChoosePicture">                        
                                        Choose picture    
                                    </label>       
                                    <input className="hidden"
                                           id="ChoosePicture"               
                                           type="file"  
                                           onClick={(e) => {setUploadState(states.IDLE)}}                      
                                           onChange={changeFiles}                                     
                                    /> 
                                    <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded ml-5 h-10 w-32"
                                            id="upload"                                
                                            type = "submit"                                                       
                                            onChange={(e) => {setUploadState(states.IDLE);
                                                              selectFile(e)}}>
                                        Upload picture    
                                    </button> 
                                </form>    
                            </div>
                            <div>                                  
                                {uploadState === states.UPLOADED && ( 
                                    <p className="mt-0 ml-4 text-sm text-cyan-600">
                                        Image was uploaded<br></br> successfully.
                                    </p>
                                )} 
                                {uploadState !== states.UPLOADED && ( 
                                    <p className="mt-0 ml-4 text-sm text-cyan-600">
                                        &nbsp;
                                    </p>
                                )}
                            </div>    
                        </div> 
                    </div>
                </div>
            </div>

            <div>
                <p className="text-white text-center font-bold text-xl mt-24 center mb-1">Change my Password</p>
            </div>            
                
            <div className="flex flex-row">
                <p className="ml-5 mb-1 mt-3 w-64 text-white text-left">    
                    Enter your new password               
                </p>  

                <p className="ml-[91px]  mb-1 mt-3 w-64 text-white text-left">    
                    Reenter your new password
                </p>                
            </div>    

            <div className="flex flex-row">                           
                <input className="ml-5 mt-1 w-[280px] pl-1"
                       id = "Password"
                       type = {params.PasswordVisibility}
                       placeholder = ""
                       autoComplete = "new-password"
                       value = {params.Password}
                       onChange = {(e) => {params.setPassword(e.target.value.trim());
                                           params.setIsChanged(true);}
                        }
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

                <input className="ml-5 mt-1 w-[280px] pl-1"
                       id = "PasswordCopy"
                       type = {params.PasswordVisibility}
                       placeholder = ""
                       autoComplete = "new-password"
                       value = {params.PasswordCopy}
                       onChange = {(e) => {params.setPasswordCopy(e.target.value.trim());
                                           params.setIsChanged(true);}                                          
                    }
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

            <div className="flex flex-row">     
                <p className="ml-5 mb-[32px] mt-2 text-cyan-300 text-left text-sm">
                    {params.errors.Password} &nbsp;
                </p> 
            
                <p className="ml-[160px] mb-[32px] mt-2 text-cyan-300 text-left text-sm">
                    {params.errors.PasswordCopy} &nbsp;
                </p> 
            </div>               
        </div>         
    );
} 

//
// Page_3()
// ========
// The third tabbed-dialog page displays some sort of Ethics Agreement.
//
function Page_3(params) { 
    return (
        <div>
            <p className="text-white text-center font-bold text-xl mt-1 mb-44">Agreement</p>

            <p className="text-white text-center text-sm mt-5 mb-60">This page will display an agreement.</p>
        </div>    
    );
} 

//
// Page_4()
// ========
// The fourth tabbed-dialog page displays some other information
//
function Page_4(params) { 
    return (
        <div>
            <p className="text-white text-center font-bold text-xl mt-1 mb-44">Some other information</p>

            <p className="text-white text-center text-sm mt-5 mb-60">This page will display some other information.</p>

        </div>    
    );
} 

//
// ConfirmCancel()
// ===============
// The Modal component is used to wrap this custom dialog box that asks if the user really wants 
// to cancel the changes they have just made to their profile.
// 
function ConfirmCancel(params) {
    return (
        <div>
            <Modal>
                <div className="">
                    <div className="flex flex-col items-center" >
                        <h1 className="text-black text-center font-bold text-xl ml-10 mr-10 mt-5 w-[300px]">
                            Your profile has changed
                        </h1>

                        <p className="text-black text-xl text-center mt-5">
                            Do you want to cancel these changes? 
                        </p> 
                        <p className="text-black text-xl text-center mt-2">
                            Click Yes to exit without saving or 
                        </p> 
                        <p className="text-black text-xl text-center mt-0 mb-5">
                            No to continue editing.
                        </p> 

                        <div className="flex flex-row flex-auto">
                            <button
                                className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                            mb-6 mt-2"
                                id="Yes"
                                style={{ width: "100px" }}
                                onClick={() => {
                                    params.setState(states.EXITING);
                                }}>
                                Yes
                            </button>    

                            <button
                                className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                            mb-6 mt-2 ml-8"
                                id="No"
                                style={{ width: "100px" }}
                                onClick={() => {
                                    params.setState(states.EDITING);
                                }}>
                                No
                            </button> 
                        </div>                                 
                    </div>   
                </div>     
            </Modal> 
        </div> 
    );      
}

