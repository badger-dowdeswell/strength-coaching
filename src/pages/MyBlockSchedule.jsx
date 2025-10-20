//
// MY BLOCK TRAINING SCHEDULE
// ==========================
// This is the complete schedule for the client's training sessions for the
// current block, listed by week and session.
//
// Revision History
// ================
// 30.07.2025 BRD Original version.
// 
import './Main.css';

import TopNav from "./components/TopNav";
import ScheduleLine from "./components/ScheduleLine";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { states } from "./Constants";

import Axios from 'axios';
import { getBaseURL } from "./getBaseURL";
const baseURL = getBaseURL();
const axios = Axios;

//
// MyBlockSchedule
// ===============
function MyBlockSchedule() {
    let navigate = useNavigate();  

    const [Block, setBlock] = useState(0);
    const [Week, setWeek] = useState(0); 
    const [CurrentWeek, setCurrentWeek] = useState(0);
    const [MaxWeek, setMaxWeek]= useState(0);   
    const [StartDate, setStartDate] = useState(0);

    // The array of objects that hold one one line for each exercise specified
    // for this block.    // 
    const [Schedule, setSchedule] = useState([]);
    
  
    //
    // Authentication and Navigation()
    // ===============================
    // Checks to see if the local storage has a userID set to ensure that only
    // authenticated uses can navigate around the application. This is also a
    // convenient way of logging out. When the user_ID is set to blank, via the
    // there will no longer an authenticated user.
    //    
    var user_ID = sessionStorage.getItem("userID");      
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
    // State control()
    // ===============
    // This section defines the state machine that controls the schedule display
    // and enables the client to add details. The useState and useEffect hooks 
    // ensure that the environment is re-configured appropriately each time the
    // state changes. 
    //
    const [state, setState] = useState(states.UNDEFINED);

    useEffect(() => {    
        //var error = false;
        
        switch (state) {            
            case states.UNDEFINED:
                // Load the primary client information and block schedule lines.                
                loadSchedule(user_ID);
                break;            

            case states.LOADED:
                // A schedule was found for this client for this period.
                debugSchedule();
                break;
                
            case states.NOT_AUTHENTICATED:
            case states.NOT_FOUND:        
                // Either the user record or their block schedule could not be
                // read. Sign them out and return them to the landing page.
                // RA_BRD - need to tell the user that a problem has occured.
                return navigate("/");
            
            default:
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    //
    // loadSchedule()
    // ==============
    // Reads the user's profile information from the database and loads it into the editing fields.
    // Note since this method operates within an aync Promise, it is the safest place to
    // set the editingState so that that state does not get triggered before the read is complete.
    // Then, the block schedule lines for each day in that week are loaded.
    //
    const loadSchedule = async (user_ID) => { 
        var block = 0;
        var week = 0;        
        try {
            // load the client information.
            let response = await axios.get(baseURL + "getUser?user_ID=" + user_ID + "&JWT=" + JWT);
            if (response.status === 200) { 
                // RA_BRD - need to add to the clients profile.                
                setBlock(1);
                setWeek(1);
                setMaxWeek(6)
                setCurrentWeek(1);

                // RA_BRD - load temporary variables within this scope.
                block = 1;
                week = 1;
                //console.log("loadSchedule - loaded client\n");

                // load the schedule lines for this block, this week.
                try {
                    let response = await axios.get(baseURL + "getSchedule?user_ID=" + user_ID + "&JWT=" + JWT + 
                                            "&block=" + block + "&week=" + week);
                    if (response.status === 200) {
                        //console.log("loadSchedule - loaded schedule\n");                
                        setSchedule(response.data);  
                        setState(states.LOADED); 
                    } else if (response.status === 404) {
                        setState(states.NOT_FOUND);
                    }            
                } catch (err) {  
                    // The client does not have a schedule specified for this period
                    // RA_BRD - resolve this later to display an approprite message
                    //          because it is not a failure.          
                    setState(states.NOT_FOUND);        
                }        
            } else if (response.status === 404) {
                // The client was not found.
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
        let line = "";
        console.log("\ndebugSchedule()\n");        
        console.log("Line count " + Schedule.length + "\n");
        for (var ptr = 0; ptr <Schedule.length; ptr++ ) {

            line = Schedule[ptr].schedule_ID + " " +
                   Schedule[ptr].seq_ID + " " +
                   Schedule[ptr].exercise_name + " " +
                   Schedule[ptr].sets + " " +
                   Schedule[ptr].actual_sets + " " +
                   Schedule[ptr].reps + " " +
                   Schedule[ptr].actual_reps + " " +
                   Schedule[ptr].velocity_based_metrics;

            console.log(line);            
        }        
    };  
    
    // for (let index = 0; index < MaxWeek; index++) {                                    
    //                                 items.push(
    //                                     <div>
    //                                         <button className="bg-white text-black text-sm py-1 px-1 border
    //                                                         mb-0 mt-0 ml-0"
    //                                                 id={"Week" + index}
    //                                                 style={{ width: "100px" }}
    //                                                 onClick={() => {
    //                                                         // setTabColor(currentPage, pages.PAGE_1);
    //                                                         setCurrentWeek(index);
    //                                                 }}>
    //                                             {"WEEK " + index}
    //                                         </button> 
    //                                     </div> 
    //                                 )};                                   
    //                             )}
    // {(() => { 
    //                             const items = [];                                 
    //                             items.push(<div className="flex flex-row">);                                                          
                                
    //                             items.push(</div>); 
    //                             return <>{items}</>;                                                                 
    //                         })()}    

    //
    // TabBar()
    // ========
    // This function creates a dynamic list of clickable tabs for the tabbed-dialog
    // that displays the set of pages for the weeks in this schedule.
    // 
    function TabBar() {        
        const items = []; 
        for (let index = 0; index < MaxWeek; index++) {   
            items.push(
                <div>
                    <button className="bg-gray-400 text-black text-sm py-1 px-1 border
                                       mb-0 mt-0 ml-0"                                                                
                            id={"TabWeek_" + (index + 1)} 
                            style={{ width: "100px" }}                                                      
                            onClick={(e) => {                                
                                setCurrentWeek(index + 1);                                                 
                            }}>
                        {"Week " + (index + 1)}
                    </button>
                </div>                             
            )             
        };
        return items; 
    }

    useEffect(() => {
        console.log("useEffect " + CurrentWeek);
        setTabColour(CurrentWeek, 0);
        
    }, [CurrentWeek]);

    

    //
    // setTabColour()
    // ==============
    function setTabColour(newTab, previousTab) {          
        
        // Reset the colour of the current tab to grey.
        //var el = document.getElementById(currentTab);
        //console.log("currentTab " + el.id)
        //el.style.color = "black";
        //el.style.backgroundColor = "white";
    
        if (newTab > 0) {
            // Highlight the new tab by setting its colour to white. 
            console.log("setTabColour " + newTab );       
            var el = document.getElementById("TabWeek_" + newTab);
            console.log("document " + el.id);
            el.style.backgroundColor = "#ffffff"; 
        }      
    }

    //
    // MyBlockSchedule
    // ===============
    // Render the Block Schedule pages with a separate tab for each week. These 
    // individual pages allow the client to view their training schedule and 
    // update their progress.
    //
    return (
        <div>            
            <TopNav title=""/>
            <div className="flex flex-col absolute top-24 bottom-0
                            items-center justify-center
                            left-0 right-0 bg-gray-800 overflow-hidden">

                <div className="flex flex-col box-border border-2 rounded-lg    
                                ml-10 mr-10 h-auto w-auto">
                    <div className="flex flex-row">
                        <TabBar/>         
                    </div>    
                    <hr className="h-px my-0 bg-white border-0"></hr> 

                    <div>
                        <p className = "text-white font-bold text-sm">
                            Current week {CurrentWeek}
                        </p>                        
                    </div>
                    
                    
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
        </div>
    )
}

//
// WeekTab()
// =========
// The tabbed dialog page for the week specified.
//
function WeekTab(params) { 
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
            <p className="text-white text-center font-bold text-xl mt-5">{params.Week}</p>
        </div>
    )
}   


                    // <br></br>

                    // <div>
                    //     {Schedule.map(line => (
                    //         <ScheduleLine
                    //             key={line.schedule_ID}
                    //             seq_ID={line.seq_ID}
                    //             exercise_name={line.exercise_name}
                    //         />                        
                    //     ))}
                    // </div>
    
export default MyBlockSchedule;

    // //
    // // TabBar()
    // // ========
    // // This function creates a dynamic list of clickable tabs for the tabbed-dialog
    // // that displays the set of pages for the weeks in this schedule.
    // // 
    // function TabBar() {        
    //     const items = []; 
    //     for (let index = 0; index < MaxWeek; index++) {   
    //         items.push(
    //             <div>
    //                 <button className="text-sm py-1 px-1 border mb-0 mt-0 ml-0"                                                                    
    //                         id={"Week" + (index + 1)}
    //                         style={{color: 'white', backgroundColor: '#9ca3af', width: "100px" }}                             
    //                         onClick={(e) => {
    //                             tabClick(e);
    //                             //setTabColour(CurrentWeek, 'white', '#9ca3af');                                
    //                             //setCurrentWeek(e.id);  
    //                             //setTabColour(CurrentWeek, 'black', "white");                                                    
    //                         }}>
    //                     {"WEEK " + (index + 1)}
    //                 </button>
    //             </div>                             
    //         )             
    //     };
    //     return items; 
    //}
