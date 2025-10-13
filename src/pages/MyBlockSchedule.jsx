//
// MY BLOCK TRAINING SCHEDULE
// ==========================
// This is the complete schedule for the client's training sessions.
//
// Revision History
// ================
// 25.02.2024 BRD Original version.
// 30.07.2025 BRD Cloned Strength Coaching from the Strength Research application.
// 
//
import './Main.css';

import TopNav from "./components/TopNav";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { states } from "./Constants";

import Axios from 'axios';
import { getBaseURL } from "./getBaseURL";
const baseURL = getBaseURL();
const axios = Axios;

//
// MySchedule
// ==========
function MyBlockSchedule() {
    let navigate = useNavigate();  

    const[Block, setBlock] = useState(0);
    const[Week, setWeek] = useState(0);
    const[Schedule, setSchedule] = useState([]);
  
    //
    // Authentication and Navigation()
    // ===============================
    // Checks to see if the local storage has a userID set to ensure that
    // only authenticated uses can navigate around the application. This
    // is also a convenient way of logging out. When the UserID is set to
    // blank via the Sign-out button click, there is no longer an
    // authenticated user.
    //    
    var userID = sessionStorage.getItem("userID");      
    const JWT = sessionStorage.getItem('JWT');
    
    useEffect(() => {
        if (!userID.trim() || !JWT.trim()) {
            // The page is being accessed by an unauthorised user so redirect them
            // back to the landing page.
            return navigate("/"); 
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userID, JWT]);

    //
    // State control()
    // ===============
    // This section defines the state machine that controls the schedule display
    // and enables the client to add details. The useState and useEffect hooks 
    // ensure that the environment is re-configured appropriately each time the
    // state changes. 
    //
    const [state, setState] = useState(states.GET_CLIENT);
    
    useEffect(() => {    
        var error = false;
        
        switch (state) {            
            case states.GET_CLIENT:
                getUser(userID);
                break;

            case states.LOADING:
                getSchedule(userID, Block, Week);
                break;

            case states.LOADED:
                debugSchedule();
                break;
                
            case states.NOT_AUTHENTICATED:
            case states.NOT_FOUND:        
                // Either the user record or their block schedule could not be
                // read. Sign them out and return them to the landing page.
                return navigate("/");
            
            default:
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

//
    // getUser()
    // =========
    // Reads the user's profile information from the database and loads it into the editing fields.
    // Note since this method operates within an aync Promise, it is the safest place to
    // set the editingState so that that state does not get triggered before the read is complete.
    //
    const getUser = async (userID) => {         
        try {
            let response = await axios.get(baseURL + "getUser?user_ID=" + userID + "&JWT=" + JWT);
            if (response.status === 200) {                               
                // setUserID(response.data.user_ID);  
                // setUserAuthority(response.data.user_authority || "");                
                // setSalutation(response.data.salutation || "");
                // setFirstName(response.data.first_name || ""); 
                // setLastName(response.data.last_name || "");  
                // setAlias(response.data.alias || ""); 
                // setPhoneNumber(response.data.phone_number || ""); 
                // setEmailAddress(response.data.email_address || ""); 
                // setAddress1(response.data.address_1 || ""); 
                // setAddress2(response.data.address_2 || ""); 
                // setAddress3(response.data.address_3 || ""); 
                // setSuburb(response.data.suburb || ""); 
                // setCity(response.data.city || ""); 
                // setPostcode(response.data.postcode || ""); 
                // setStateProvince(response.data.state_province || "");
                // setCountry(response.data.country || ""); 
                // setDateOfBirth(formatDate("YYYY-MM-DD", decodeISOdate(response.data.date_of_birth)));
                // setUserImage(response.data.user_image || "");

                // RA_BRD - need to add to the clients profile.                
                setBlock(1);
                setWeek(1);
                setState(states.LOADING);                              
            } else if (response.status === 404) {
              setState(states.NOT_FOUND);
            }            
        } catch (err) {            
            setState(states.NOT_FOUND);        
        }        
    };

    //
    // getSchedule()
    // =============
    // Reads the client's training schedule for the specified block and week.
    //         
    const getSchedule = async(userID, Block, Week) => {         
        try {
            let response = await axios.get(baseURL + "getSchedule?user_ID=" + userID + "&JWT=" + JWT + 
                                           "&block=" + Block + "&week=" + Week);
            if (response.status === 200) {
                console.log(response.data[0].reps);
                console.log(response.data[1].reps);
                setSchedule(response.data);  
                setState(states.LOADED); 
            } else if (response.status === 404) {
              setState(states.NOT_FOUND);
            }            
        } catch (err) {            
            setState(states.NOT_FOUND);        
        }        
    }; 
    
    //
    // debugSchedule()
    // ===============
    function debugSchedule() {
        console.log("\ndebugSchedule()\n");        
        console.log("Line count " + Schedule.length + "\n" + Schedule[0,0].exercise_name);
        console.log("Line count " + Schedule.length + "\n" + Schedule[0,1].exercise_name);
    };    

    //
    // MY BLOCK SCHEDULE
    // =================
    // Render the Block Schedule page and let the client update their training results.
    //
    return (
        <div>            
            <TopNav title=""/>
            <div className="flex flex-col absolute top-24 bottom-0
                            items-center justify-center
                            left-0 right-0 bg-gray-800 overflow-hidden">

                <p className="ml-1 mt-3 text-white">This is your complete Training Schedule for this Block.</p>

                <br></br>

                <p className="ml-1 text-white">
                    More content goes in here ... and here ... and here ...
                </p>
                <br></br>

                <div className="flex flex-row justify-center">                        
                    <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        mb-6 mt-2"
                        id="Update"
                        style={{ width: "100px" }}
                        onClick={() => {
                            // This stops the user clicking Update while
                            // the ConfirmCancel dialogue is open.
                            //if (state == states.EDITING) {
                                //setState(states.VALIDATING_STAGE_1);
                        //}    
                        }}>
                        Update
                    </button>    
                
                    <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        mb-6 mt-2 ml-8"
                        id="Cancel"
                        style={{ width: "100px" }}
                        onClick={() => {                                
                            //if (IsChanged) {
                                //setTabColor(currentPage, pages.PAGE_1);
                            //   s/etCurrentPage(pages.PAGE_1);
                                //setState(states.CANCELLING);
                            //} else {
                                navigate("/Home");         
                            //}    
                        }}>
                        Cancel
                    </button>  
                </div>                           
            </div>  
        </div>
    )
}
export default MyBlockSchedule;