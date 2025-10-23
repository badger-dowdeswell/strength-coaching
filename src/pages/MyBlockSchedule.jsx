//
// MY BLOCK TRAINING SCHEDULE
// ==========================
// This is the complete schedule for the client's training sessions for the
// current block, listed by week and day.
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
    const [CurrentWeek, setCurrentWeek] = useState(0);
    const [CurrentDay, setCurrentDay] = useState(0);
    
    const [MaxWeek, setMaxWeek]= useState(0);   
        
    // The array of objects that hold one one line for each exercise specified
    // for this block.   
    const [Schedule, setSchedule] = useState([]);
    
    //
    // Authentication and Navigation()
    // ===============================
    // Checks to see if the local storage has a user_ID set to ensure that only
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
        switch (state) {            
            case states.UNDEFINED:
                // Load the primary client information and block schedule lines.
                setCurrentWeek(0);                
                loadSchedule(user_ID);
                break;            

            case states.LOADED:
                // A schedule was found for this client for this period.
                //debugSchedule(); 
                setCurrentWeek(1); 
                setCurrentDay(1);  
                //Schedule[0].exercise_name = "ha ha"; 
                //console.log("LOADED " + Schedule[0].exercise_name);           
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
    }, [state] );

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
                setMaxWeek(9)
                
                // RA_BRD - load temporary variables within this scope.
                block = 1;
                week = 1;
                //console.log("loadSchedule - loaded client\n");

                // load the schedule lines for this block, this week.
                try {
                    let response = await axios.get(baseURL + "getSchedule?user_ID=" + user_ID + "&JWT=" + JWT + 
                                            "&block=" + block);
                    // RA_BRD let response = await axios.get(baseURL + "getSchedule?user_ID=" + user_ID + "&JWT=" + JWT + 
                    //        "&block=" + block + "&week=" + week);
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
    // RA_BRD
    //
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
        
    //
    // WeekTabBar()
    // ============
    // This function creates a dynamic list of clickable tabs for the tabbed-dialog
    // that displays the set of pages for the weeks in this schedule.
    // 
    function WeekTabBar() {         
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

    //
    // DayTabBar()
    // ===========
    // This function creates a dynamic list of clickable tabs for the tabbed-dialog
    // that displays the set of pages for the days in this schedule.
    // 
    function DayTabBar() {         
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];             
        const items = [];         
        for (let index = 0; index < 7; index++) {             
            items.push(
                <div>
            
    
        <button className="bg-gray-400 text-black text-sm py-1 px-1 border
                                       mb-0 mt-0 ml-0"                                                                
                            id={"TabDay_" + (index + 1)} 
                            style={{ width: "100px" }}                                                      
                            onClick={(e) => {                                
                                setCurrentDay(index + 1);                                                 
                            }}>
                        {days[index]}
                    </button>
                </div>                             
            )             
        };
        return items; 
    }

    //
    // setTabColour() 
    // ==============
    // Switches the colour of the tab for the current week and day that is being
    // activated.
    // 
    useEffect(() => {
        if (CurrentWeek > 0) {
            let el = document.getElementById("TabWeek_" + CurrentWeek); 
            el.style.backgroundColor = "#ffffff";        
        }

        if (CurrentDay > 0) {
            let el = document.getElementById("TabDay_" + CurrentDay); 
            el.style.backgroundColor = "#ffffff";        
        }
    }, [CurrentWeek, CurrentDay] );

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
                                ml-10 mr-10 h-[500px] w-auto">
                    
                    <div className="flex flex-row">
                        <WeekTabBar/>         
                    </div>    
                    
                    <div className="flex flex-row">
                        <DayTabBar/>         
                    </div> 
                    <hr className="h-px my-0 bg-white border-0"></hr>   

                    <p className="text-white text-center font-bold text-xl mt-5">
                        My Block {Block} Week {CurrentWeek} Day {CurrentDay} Training Schedule</p>                   
                    
                    <div className="flex flex.row text-white">                        
                        <p className="text-center border mb-0 mt-5 ml-0 w-40">
                            Exercises 
                        </p>
                        <p className="text-center border mb-0 mt-5 ml-0 w-20">
                            Sets 
                        </p>
                        <p className="text-base text-center border mb-0 mt-5 ml-0 w-20">
                            Reps 
                        </p>
                        <p className="text-base text-center border mb-0 mt-5 ml-0 w-32">
                            Weights 
                        </p>
                        <p className="text-base text-center border mb-0 mt-5 ml-0 w-32">
                            My Weights 
                        </p>
                        <p className="text-base text-center border mb-0 mt-5 ml-0 w-48">
                            Velocity-Based Metrics 
                        </p>
                        <p className="text-base text-center border mb-0 mt-5 ml-0 w-48">
                            Notes
             
    
           </p>  
                        <p className="text-base text-center border mb-0 mt-5 ml-0 w-14">
                            E1RM
                        </p>     
                    </div>

                    <div>
                        {Schedule.map(line => (
                            <ScheduleLine
                                activeWeek = {CurrentWeek}
                                activeDay = {CurrentDay}                                
                                day = {line.day}
                                week = {line.week}                                
                                key = {line.schedule_ID}
                                seq_ID = {line.seq_ID}
                                exercise_name = {line.exercise_name}
                                sets = {line.sets}
                                actual_sets = {line.actual_sets}
                                reps = {line.reps}
                                actual_reps = {line.actual_reps}
                                weights = {line.lower_weight + " - " + line.upper_weight}
                                actual_weights = {line.actual_weight}
                                velocity_based_metrics = {line.velocity_based_metrics}
                                notes = {line.notes}
                                E1RM = {line.E1RM}                                                               
                            />                        
                        ))}
                    </div>

                    <div className="mt-auto">    
                        <div className="flex flex-row justify-center mt-5">
                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mb-6 mt-2 ml-8"
                                id="Save"
                                style={{ width: "100px" }}
                                onClick={() => { 
                                }}>
                                Save
                            </button>  

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mb-6 mt-2 ml-8"
                                id="Back"
                                style={{ width: "100px" }}
                                onClick={() => { 
                                    // RA_BRD                                
                                    //if (IsChanged) {
                                        //setTabColor(currentPage, pages.PAGE_1);
                                    //   setCurrentPage(pages.PAGE_1);
                                        //setState(states.CANCELLING);
                                    //} else {
                                        navigate("/Home");         
                                    //}    
                                }}>
                                Back
                            </button>  
                        </div> 
                    </div>
                </div>                
            </div>  
        </div>
    )
}
    
export default MyBlockSchedule;

    