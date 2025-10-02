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
import { states, pages } from "./Constants";

import Axios from 'axios';
import { getBaseURL } from "./getBaseURL";
const baseURL = getBaseURL();
const axios = Axios;

//
// MySchedule
// ==========
function MyBlockSchedule() {
    let navigate = useNavigate();  
  
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
    // Editing state control()
    // =======================
    // This section defines the state machine that controls the profile editing
    // process. The useState and useEffect hooks ensure that the environment is
    // re-configured appropriately each time the state changes. The currentPage 
    // state controls which page of the tabbed dialog is currently displayed.
    //
    const [state, setState] = useState(states.LOADING);
    const [currentPage, setCurrentPage] = useState();
    

    //
    // MY BLOCK SCHEDULE
    // =================
    // Render the Block Schedule page.
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