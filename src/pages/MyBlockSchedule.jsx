//
// MY BLOCK TRAINING SCHEDULE
// ==========================
// This is the complete schedule for the client's training sessions for the
// current block, listed by week and day, and individual exercise.
//
// Revision History
// ================
// 30.07.2025 BRD Original version.
// 30.10.2025 BRD Added video streaming capabilities for showing training 
//                videos in-context on a modal dialog window.
// 08.11.2025 BRD Merged the ScheduleLine component into this source file.
//                This should make it easier to update fields stored in
//                the Schedule array.
// 
import './Main.css';

import TopNav from "./components/TopNav";
import Modal from "./components/Modal";
import TextareaAutosize from "react-textarea-autosize";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { states, pages } from "./Constants";
import { stringToArray, validKey } from "./components/UtilLib";

//import ReactPlayer from 'react-player';

import training_video_image from "./images/training_video.png";

import Axios from 'axios';
import { getBaseURL } from "./components/getBaseURL";
const baseURL = getBaseURL();
const axios = Axios;

//
// MyBlockSchedule
// ===============
function MyBlockSchedule() {
    let navigate = useNavigate();  

    const [CurrentBlock, setCurrentBlock] = useState(0);    
    const [CurrentWeek, setCurrentWeek] = useState(0);
    const [CurrentDay, setCurrentDay] = useState(0);
    
    const [MaxWeek, setMaxWeek]= useState(9);  
    
    const [VideoVisible, setVideoVisible] = useState(false); 
    const [VideoLink, setVideoLink] = useState(""); 
        
    // The array of objects that hold one one line for each exercise specified
    // for this block.   
    const [Schedule, setSchedule] = useState([]);

    // Editing fields. These are set by the function setEditingParams() and used later
    // by the function updateEditParams() to update the Schedule array fields during
    // editing.
    const [Index, setIndex] = useState();    
    const [ExerciseName, setExerciseName] = useState("");    
    const [ActualSets, setActualSets] = useState(0);    
    const [ActualReps, setActualReps] = useState(0);
    const [ActualWeights, setActualWeights] = useState(0);
    const [ActualRPE, setActualRPE] = useState(0);
    const [Notes, setNotes] = useState("");

    const [IsChanged, setIsChanged] = useState(false);  

    //
    // Authentication and Navigation()
    // ===============================
    // Checks to see if the local storage has a user_ID set to ensure that only
    // authenticated uses can navigate around the application. This is also a
    // convenient way of logging out. When the user_ID is set to blank, there will
    // no longer be an authenticated user. The change triggers this useEffect hook
    // and the application will navigate to the default Landing page.
    //    
    var user_ID = sessionStorage.getItem("user_ID");      
    var JWT = sessionStorage.getItem('JWT');
    
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
    // This section defines the state machine that manages each state the system
    // can operate in. It controls the initial page loading, the navigation between
    // each page, updates, errors, and finally navigating back to the previous
    // page. The useState and useEffect hooks ensure that the environment is 
    // re-configured appropriately each time the state changes. 
    //
    const [state, setState] = useState(states.UNDEFINED);
    const [CurrentPage, setCurrentPage] = useState(pages.UNDEFINED);

    useEffect(() => {    
        switch (state) {            
            case states.UNDEFINED:
                // Load the primary client information.                 
                getUser(user_ID);
                break; 
                
            case states.LOADED_CLIENT:
                // The client has been found. Load their block schedule.       
                loadSchedule(user_ID); 
                break;             

            case states.LOADED:
                // A schedule was found for this client for this block.  
                setCurrentPage(pages.PAGE_DAY); 
                //debugSchedule();
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
    // getUser()
    // =========
    // Reads the user's profile information to determine the current block, week,
    // and day within their training schedule.
    //
    const getUser = async (user_ID) => {         
        try {
            let response = await axios.get(baseURL + "getUser?user_ID=" + user_ID + "&JWT=" + JWT);
            if (response.status === 200) {                               
                setCurrentBlock(response.data.current_block || 0);  
                setCurrentWeek(response.data.current_week || 0);                
                setCurrentDay(response.data.current_day || 0);   
                // RA_BRD - should this be in the User record?
                setMaxWeek(9); 
                setState(states.LOADED_CLIENT);                                        
            } else if (response.status === 403) {
                setState(states.NOT_AUTHENTICATED);
            } else if (response.status === 404) {                
              setState(states.NOT_FOUND);
            }            
        } catch (err) {            
            setState(states.NOT_FOUND);        
        }        
    };

    //
    // loadSchedule()
    // ==============
    // Reads the user's profile information from the database and loads it into the editing fields.
    // Note since this method operates within an aync Promise, it is the safest place to
    // set the editingState so that that state does not get triggered before the read is complete.
    // Then, the block schedule lines for each day in that week are loaded. test
    //
    const loadSchedule = async (user_ID) => {        
        try {
            let response = await axios.get(baseURL + "getSchedule?user_ID=" + user_ID + 
                                           "&JWT=" + JWT + "&block=" + CurrentBlock);                        
            if (response.status === 200) {                        
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
    };

    //
    // updateSchedule()
    // ================     
    const updateSchedule = async () => {                  
        axios.put(baseURL + "updateSchedule?JWT=" + JWT, {
            schedule_ID: Schedule[Index].schedule_ID,
            seq_ID: Schedule[Index].seq_ID,
            user_ID: Schedule[Index].user_ID,
            block: Schedule[Index].block,
            week: Schedule[Index].week,
            day: Schedule[Index].day,
            exercise_ID: Schedule[Index].exercise_ID,
            sets: Schedule[Index].sets,
            actual_sets: Schedule[Index].actual_sets,
            min_reps: Schedule[Index].min_reps,
            max_reps: Schedule[Index].max_reps,
            actual_reps: Schedule[Index].actual_reps,
            rpe: Schedule[Index].rpe,
            actual_rpe: Schedule[Index].rpe,
            lower_weight: Schedule[Index].lower_weight,
            upper_weight: Schedule[Index].upper_weight,
            actual_weights: Schedule[Index].actual_weights,
            velocity_based_metrics: Schedule[Index].velocity_based_metrics,
            notes: Schedule[Index].notes,
            E1RM: Schedule[Index].E1RM
        })
        .then((response) => {
            //setState(states.EXITING);
            console.log("updated...");
        })
        .catch(err => {            
            // RA_BRD - figure out how to report the error to the user gracefully.
            console.log("schedule NOT updated...");
        })
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
            Schedule[ptr].user_ID + " " +
            Schedule[ptr].block + " " +
            Schedule[ptr].exercise_name + " " +
            Schedule[ptr].sets + " " +
            Schedule[ptr].actual_sets + " " +
            Schedule[ptr].min_reps + " " +
            Schedule[ptr].max_reps + " " +
            Schedule[ptr].actual_reps + " " +
            Schedule[ptr].velocity_based_metrics;

            console.log(line);
        }
    };

    //
    // WeekTabBar()
    // ============
    // This function creates a dynamic list of clickable tabs for the tabbed-dialog
    // that displays the set of pages for the weeks in this schedule. Only weeks
    // where activities have been scheduled are visible.
    //
    // This function also sets the current day to the first day scheduled in this week.
    // The client may not have training scheduled for "Monday" so it cannot be assumed
    // that the day list for any week is contigueous. RA_BRD
    // 
    function WeekTabBar() {         
        const items = []; 
        var keyIndex = -1;                
        for (let index = 0; index < MaxWeek; index++) {  
            if (FindWeek(index + 1)) {
                keyIndex++; 
                items.push(
                    <div key={keyIndex}>
                        <button className="bg-gray-400 text-black text-sm py-1
                                           px-1 border mb-0 mt-0 ml-0"                                                                
                                id={"TabWeek_" + (index + 1)} 
                                style={{ width: "100px" }}                                                      
                                onClick={(e) => { 
                                    if (CurrentPage == pages.PAGE_DAY) {                                
                                        setCurrentWeek(index + 1); 
                                    }                                                    
                                }}>
                            {"Week " + (index + 1)}
                        </button>
                    </div>                             
                )  
            }               
        };
        return items; 
    }

    //
    // FindWeek()
    // ==========
    // Scans the Schedule to determine if there are any activities scheduled for
    // the specified week. This allows the WeekTabBar to only display tabs for
    // the required weeks. Refer to the findIndex() documentation at:
    //
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
    // Global_Objects/Array/findIndex
    //
    // for an explanation of how the JavsScript array findIndex() function works.
    // 
    function FindWeek(reqWeek) {
        var found = false;

        // Callback function that returns true or false if the element matches the
        // parameters.
        const isFound = (element) => element.week == reqWeek;

        // Search the array to find the index of the first matching element that
        // meets the requirements.
        const index = Schedule.findIndex(isFound);
        if (index > -1) {        
            found = true;
        }
        return found;
    }

    //
    // DayTabBar()
    // ===========
    // This function creates a dynamic list of clickable tabs for the tabbed-dialog
    // that displays the set of pages for the active days in the current schedule
    // for this week. Days where nothing is scheduled are not displayed.
    // 
    function DayTabBar() {         
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", 
                      "Saturday", "Sunday"];             
        const items = [];
        var keyIndex = -1;        
        for (let index = 0; index < 7; index++) { 
            if (FindDay(CurrentWeek, index + 1)) {
                keyIndex++;                  
                items.push(
                    <div key={keyIndex}>
                        <button className="bg-gray-400 text-black text-sm py-1
                                           px-1 border mb-0 mt-0 ml-0"                                                                
                                id={"TabDay_" + (index + 1)} 
                                style={{ width: "100px" }}                                                      
                                onClick={(e) => { 
                                    if (CurrentPage == pages.PAGE_DAY) {                               
                                        setCurrentDay(index + 1); 
                                    }                                                
                                }}>
                            {days[index]}
                        </button>
                    </div>                             
                ) 
            }               
        };
        return items; 
    };

    //
    // FindDay()
    // ==========
    // Scans the Schedule to determine if there are any activities scheduled for
    // the specified week. This allows the WeekTabBar to only display tabs for
    // the required weeks.
    // 
    function FindDay(reqWeek, reqDay) {
        var found = false;

        // Callback function that returns true or false if the element matches the
        // parameters
        const isFound = (element) => ((element.week == reqWeek)
                                      && (element.day == reqDay));

        // Search the array to find the index of the first matching element that 
        // meets the requirements.
        const index = Schedule.findIndex(isFound);
        if (index > -1) {        
            found = true;
        }        
        return found;
    }

    //
    // setTabColour() 
    // ==============
    // Switches the colour of the tab for the current week and day that is
    // being activated. The CurrentPage is also watched since the tab colour
    // needs to be refreshed when the page changes.
    // 
    useEffect(() => {        
        if (CurrentWeek > 0) {
            let el = document.getElementById("TabWeek_" + CurrentWeek); 
            if (el != null) {
                el.style.backgroundColor = "#ffffff";   
            }         
        }

        if (CurrentDay > 0) {
            let el = document.getElementById("TabDay_" + CurrentDay); 
            if (el != null) {
                el.style.backgroundColor = "#ffffff"; 
            }           
        }
    }, [CurrentWeek, CurrentDay, CurrentPage] );

    //
    // setEditParams()
    // ===============
    // This function saves each editable value for an exercise to useState() variables when
    // a exercise line is clicked in the list of exercises for the day. This allows normal
    // editing text boxes to be used to change values. The function updateParams function 
    // is used later to save changed values back into the ScheduleLine array.
    // 
    function setEditParams(params) {
        setIndex(params.index);
        setExerciseName(params.exercise_name);
        setActualSets(params.actual_sets);

        var actual_reps = params.actual_reps[0];
        for (var ptr = 1; ptr < params.actual_reps.length; ptr++) {
            actual_reps = actual_reps + "\n" + params.actual_reps[ptr];
        }
        setActualReps(actual_reps);

        var actual_weights = params.actual_weights[0];
        for (var ptr = 1; ptr < params.actual_weights.length; ptr++) {
            actual_weights = actual_weights + "\n" + params.actual_weights[ptr];
        }
        setActualWeights(actual_weights);

        setActualRPE(params.actual_rpe);
        setNotes(params.notes);   
    }

    //
    // updateEditParams()
    // ==================
    // This function updates the Schedule array entry for the line that is currently being
    // edited. Some fields are new-line delimited strings which must be converted back to
    // proper array entries befoe being returned.
    //
    function updateEditParams(params) {
        Schedule[Index].actual_sets = ActualSets;
        Schedule[Index].actual_reps = stringToArray(ActualReps, "\n");
        Schedule[Index].actual_weights = stringToArray(ActualWeights, "\n");
        Schedule[Index].actual_rpe = ActualRPE;
        Schedule[Index].notes = Notes.trim();
        if (IsChanged) {
           // updateSchedule();
           setIsChanged(false);
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
                                ml-10 mr-10 h-[500px] w-auto">
                               
                    <div className="flex flex-row">
                        <WeekTabBar
                            Schedule = {Schedule}
                        /> 
                    </div>

                    <div className="flex flex-row">    
                        <DayTabBar/>
                    </div>
                    <hr className="h-px my-0 bg-white border-0"></hr>

                    {(CurrentPage === pages.PAGE_DAY) && (
                        <Page_Day
                            Schedule = {Schedule}
                            activeBlock = {CurrentBlock}
                            activeWeek = {CurrentWeek}
                            activeDay = {CurrentDay}
                            setVideoVisible = {setVideoVisible} 
                            setVideoLink = {setVideoLink}
                            CurrentPage = {CurrentPage} setCurrentPage = {setCurrentPage}
                            navigate = {navigate} 
                            setEditParams = {setEditParams}                                                                                            
                        />                   
                    )};

                    {(CurrentPage === pages.PAGE_EXERCISE) && (
                        <Page_Exercise
                            Schedule = {Schedule}
                            Index = {Index}
                            CurrentWeek = {CurrentWeek}
                            CurrentDay = {CurrentDay}
                            setVideoVisible = {setVideoVisible} 
                            setVideoLink = {setVideoLink}
                            CurrentPage = {CurrentPage} setCurrentPage = {setCurrentPage}
                            ActualSets = {ActualSets} setActualSets = {setActualSets}
                            ActualReps = {ActualReps} setActualReps = {setActualReps}
                            ActualRPE = {ActualRPE}   setActualRPE = {setActualRPE}
                            ActualWeights = {ActualWeights} setActualWeights = {setActualWeights}
                            Notes = {Notes} setNotes = {setNotes}
                            setEditParams = {setEditParams}
                            updateEditParams = {updateEditParams}
                            setIsChanged = {setIsChanged}
                            validKey = {validKey}
                            navigate = {navigate}
                        />                   
                    )};
                </div> 
            </div> 
        </div>        
    )
}

//
// Page_Day()
// ==========
// This displays all the exercises scheduled for the current day.
//
function Page_Day(params) {
    return (
        <div>            
            <p className="text-white text-center font-bold text-xl mt-4">
                Training Schedule - Block {params.activeBlock}
            </p>                   
            
            <div className="flex flex.row text-white">                        
                <p className="text-center border mb-0 mt-5 ml-0 w-[161px]">
                    Exercises 
                </p>
                <p className="text-center border mb-0 mt-5 ml-0 w-20">
                    Sets 
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-[92px]">
                    Reps 
                </p>    
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-20">
                    RPE
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-20">
                    Weights 
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-[100px]">
                    My Weights 
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-[191px]">
                    Velocity-Based Metrics 
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-48">
                    Notes
                </p>  
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-14">
                    E1RM
                </p>     
            </div>            

            <div className="h-[260px] overflow-y-scroll border">
                {params.Schedule.map(line => (                    
                    <ScheduleLine
                        index = {line.key}
                        activeWeek = {params.activeWeek}
                        activeDay = {params.activeDay}                                
                        day = {line.day}
                        week = {line.week}                                
                        key = {line.schedule_ID}
                        seq_ID = {line.seq_ID}
                        exercise_name = {line.exercise_name}                                              
                        video_link = {line.video_link}
                        sets = {line.sets}
                        actual_sets = {line.actual_sets}
                        min_reps = {line.min_reps}
                        max_reps = {line.max_reps}
                        actual_reps = {line.actual_reps}
                        rpe = {line.rpe}
                        actual_rpe = {line.actual_rpe}
                        lower_weight = {line.lower_weight}
                        upper_weight = {line.upper_weight}
                        actual_weights = {line.actual_weights}
                        velocity_based_metrics = {line.velocity_based_metrics}
                        notes = {line.notes}
                        E1RM = {line.E1RM} 
                        setVideoVisible = {params.setVideoVisible} 
                        CurrentPage = {params.CurrentPage} setCurrentPage = {params.setCurrentPage}
                        setVideoLink = {params.setVideoLink}  
                        setEditParams = {params.setEditParams}
                        updateEditParams = {params.updateEditParams}
                    />                        
                ))}
            </div>

            <div className="flex flex-col items-center">
                <button
                    className="bg-cyan-600 text-white font-bold text-sm py-2 px-2
                               rounded mt-5 mb-0"
                    id="Back"
                    style={{ width: "100px" }}
                    onClick={() => {                                 
                        params.navigate("/Home"); 
                    }}>
                    Back
                </button>
            </div> 
        </div>
    )  
}

//
// ScheduleLine()
// ==============
// This function is able to receive one line at a time as an object from the block
// schedule array and displays it. This has been unpacked in Page_Day() by the map
// function. If the data does not belong to the specified week, or the specific day,
// a null element is returned so that line is not displayed on the wrong page.
//
// This creates the grid line for that exercise as an individual component. Hence,
// when the grid lines in Page_Day() are scrolled up and down, each line continues
// to instantiate all its own information. Page_Day() does not allow the client to
// modify the fields. That is done in the Page_Exercise() page, which only displays
// one exercise that the client has selected from those displayed on Page_Day() page.
//
function ScheduleLine(params) {
    if ((params.activeWeek === params.week) && (params.activeDay === params.day)) {
        // This exercise belongs on this page. Format the min and max reps, upper and
        // lower weights so they display correctly in their cells.
        var reps = params.min_reps;
        if (params.max_reps > 0) {
            reps = reps + "-" + params.max_reps;
        }
        var weights = params.lower_weight;
        if (params.upper_weight > 0) {
            weights = weights + "-" + params.upper_weight;
        }

        // Unpack the actual_reps and actual_weights arrays so they can be
        // displayed vertically as text with one entry per line, separated by
        // a new line. This allows the grid lines to resize automatically so
        // that all entries are visible if the screen size allows it.
        var actual_reps = params.actual_reps[0];
        for (var ptr = 1; ptr < params.actual_reps.length; ptr++) {
            actual_reps = actual_reps + "\n" + params.actual_reps[ptr];
        }

        var actual_weights = params.actual_weights[0];
        for (var ptr = 1; ptr < params.actual_weights.length; ptr++) {
            actual_weights = actual_weights + "\n" + params.actual_weights[ptr];
        }

        return (
            <div
                className="flex flex.row flex-auto"
                onClick={() => {
                    // Select this page for editing in Page_Exercise().
                    params.setEditParams(params)
                    params.setCurrentPage(pages.PAGE_EXERCISE);
                }}>
                <p  className="text-white text-base border pl-1 mb-0 mt-0 ml-0 w-40">
                    {params.exercise_name}
                    <img
                        className="ml-auto"
                        src={training_video_image}
                        title="The training video for this exercise"
                        draggable={false}
                        height={30}
                        width={30}
                    />
                </p>

                <div className="flex flex.col h-auto">
                    <p className="bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-10 h-auto">
                        {params.sets}
                    </p>
                    <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-10 h-auto">
                        {params.actual_sets}
                    </p>
                    <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-[50px] h-auto">
                        {reps}
                    </p>

                    <div className="border">
                        <TextareaAutosize
                            className="bg-gray-800 text-white text-base text-center text-wrap scrollbar-hide w-10"
                            id="ActualReps"
                            type="text"
                            placeholder=""
                            value={actual_reps}
                            onChange={(e) => {}}
                        />
                    </div>

                    <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-10 h-auto">
                        {params.rpe}
                    </p>
                    <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-10 h-auto">
                        {params.actual_rpe}
                    </p>
                    <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-20 h-auto">
                        {weights}
                    </p>

                    <div className="border">
                        <TextareaAutosize
                            className="bg-gray-800 text-white text-base text-center text-wrap scrollbar-hide w-[100px]"
                            id="ActualWeights"
                            type="text"
                            placeholder=""
                            value={actual_weights}
                            onChange={(e) => {}}
                        />
                    </div>

                    <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-48 h-auto">
                        {params.velocity_based_metrics}
                    </p>
                    <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-48 h-auto">
                        {params.notes}
                    </p>
                    <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-14 h-auto">
                        {params.E1RM}
                    </p>
                </div>
            </div>
        )
    } else {
        return null;
    }
};

//
// Page_Exercise()
// ===============
// Displays the exercise selected from the current day and allows the fields to be edited. The
// validKey() function is imported from the UtilLib library.
//
function Page_Exercise(params){
    // Format the fields that have a range by joining them with a minus symbol.
    var reps = params.Schedule[params.Index].min_reps;
    if (params.Schedule[params.Index].max_reps > 0) {
        reps = reps + "-" + params.Schedule[params.Index].max_reps;
    }

    var weights = params.Schedule[params.Index].lower_weight;
    if (params.Schedule[params.Index].upper_weight > 0) {
        weights = weights + "-" + params.Schedule[params.Index].upper_weight;
    }

    return (
        <div>                       
            <p className="text-white text-center font-bold text-xl mt-0">
                {params.Schedule[params.Index].exercise_name}
            </p>                   
            
            <div className="flex flex.row text-white">                        
                <p className="text-center border mb-0 mt-5 ml-0 w-[161px]">
                    Exercises
                </p>
                <p className="text-center border mb-0 mt-5 ml-0 w-20">
                    Sets
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-[92px]">
                    Reps
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-20">
                    RPE
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-20">
                    Weights
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-[100px]">
                    My Weights
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-[191px]">
                    Velocity-Based Metrics
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-[186px]">
                    Notes
                </p>
                <p className="text-base text-center border mb-0 mt-5 ml-0 w-14">
                    E1RM
                </p>
            </div> 

            <div className="flex flex.row">
                <p className="text-white text-base border pl-1 mb-0 mt-0 ml-0 w-40">                                               
                    {params.Schedule[params.Index].exercise_name}
                    <img
                        className="ml-auto"
                        src={training_video_image}
                        title="The training video for this exercise" 
                        draggable={false} 
                        height={30} width={30}                             
                    />                            
                </p> 

                <p className="bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-10">                            
                    {params.Schedule[params.Index].sets}
                </p> 

                <div className="border bg-white">
                    <input
                        className="bg-white text-black text-base text-center text-wrap w-10"
                        id="ActualSets"
                        type="number"
                        placeholder=""
                        value={params.ActualSets}
                        onChange={(e) => {
                            // Restrict the value to three digits.
                            params.setActualSets(e.target.value.slice(0,3));
                            params.setIsChanged(true);
                        }}
                    />
                </div>

                <p className="bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-[50px] h-auto">
                    {reps}
                </p> 
                
                <div className="border bg-white">
                    <TextareaAutosize
                        className="bg-white text-black text-base text-center text-wrap scrollbar-hide h-10 w-10"
                        id="ActualReps"
                        type="number"
                        placeholder=""
                        value={params.ActualReps}
                        onKeyDown={(e) => {
                            if (!params.validKey(e, false)) {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => {
                            params.setActualReps(e.target.value);
                            params.setIsChanged(true);
                        }}
                    />
                </div>

                <p className="bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-10">
                    {params.Schedule[params.Index].rpe}
                </p>

                <div className="bg-white">
                    <input
                        className="bg-white text-black text-center w-10 h-[27px]"
                        id="ActualRPE"
                        type="number"
                        placeholder=""
                        value={params.ActualRPE}
                        onChange={(e) => {
                            // The value must be between 0 and 10.
                            var val = e.target.value;
                            if (val < 0) {
                                val = 0;
                            } else if (val > 10) {
                                val = 10;
                            }
                            params.setActualRPE(val);
                            params.setIsChanged(true);            
                        }} 
                    />                     
                    <p className="bg-white text-black w-10 h-[60px]"></p>                    
                </div> 

                <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-20">
                    {weights}
                </p>

                <div className="bg-white">
                    <TextareaAutosize
                        className="bg-white text-black text-center text-wrap scrollbar-hide w-[100px]"
                        id="ActualWeights"
                        type="text"
                        placeholder=""
                        value={params.ActualWeights}
                        onKeyDown={(e) => {
                            if (!params.validKey(e, true)) {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => {
                            params.setActualWeights(e.target.value);
                            params.setIsChanged(true);            
                        }} 
                    />
                </div> 
                
                <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-[190px]">
                    {params.Schedule[params.Index].velocity_based_metrics}
                </p>

                <div className="bg-white">
                    <TextareaAutosize
                        className="bg-white text-black text-center text-wrap scrollbar-hide w-[186px]"
                        id="Notes"
                        type="text"
                        placeholder=""
                        value={params.Notes}
                        onChange={(e) => {
                            params.setNotes(e.target.value);
                            params.setIsChanged(true);
                        }}
                    />
                </div>

                <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-14">
                    {params.Schedule[params.Index].E1RM}
                </p>
            </div>

            <div className="flex flex-col items-center mt-auto">  
                <button
                    className="bg-cyan-600 text-white font-bold text-sm py-2 px-2
                               rounded mb-6 mt-10 ml-8"
                    id="Back"
                    style={{ width: "100px" }}
                    onClick={() => { 
                        params.updateEditParams();
                        params.setCurrentPage(pages.PAGE_DAY); 
                    }}>
                    Back
                </button> 
            </div> 
        </div>
    ) 
}

//
// ShowVideo()
// ============
// The Modal component is used to wrap the video player in a custom dialog box.
// https://www.npmjs.com/package/react-player
//
// installation:  npm i react-player
//
function ShowVideo(params) {
    //console.log("ShowVideo " + params.VideoLink);
    // const videoRef = useRef(null);
    
    // const [videoID, setVideoID] = useState(null);

    //
    // playVideo()
    // ===========
    // function playVideo(e, videoID) {
    //    e.preventDefault();
    //    setVideoID(videoID);
    // }   
    
    // useEffect(() => {
    //    if (videoRef.current) {
    //        videoRef.current.pause();
    //        videoRef.current.removeAttribute('src');
    //        videoRef.current.load();
    //    }
    //})

    // <ReactPlayer
    //                         width="100"                            
    //                         controls="true" 
    //                         playing  
                                                  
    //                         url = {baseURL + 'streamVideo?user_ID=' + params.user_ID 
    //                                        +"&JWT=" + params.JWT
    //                                        + "&filename=" + params.VideoLink}
    //                         type = 'video/mp4'                  
    //                     /> 
   
    return (
        <div>
            <Modal>
                <div className="bg-gray-800 overflow-hidden box-border border-2 rounded-lg">
                    <div className="flex flex-col" > 
                        <h1 className="bg-gray-800 text-white text-center text-sm ml-10 mr-10 mt-5 w-80">
                            Video link {params.VideoLink}
                        </h1> 

                        <div className="mt-auto">    
                            <div className="flex flex-row justify-center mt-5">
                                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                  mb-6 mt-2"
                                    id="Play"
                                    style={{ width: "100px" }}
                                    onClick={() => {(e) => {
                                        playVideo(e, params.VideoLink);    
                                    }}}>
                                    Play
                                </button>    

                                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mb-6 mt-2 ml-8"
                                    id="Back"
                                    style={{ width: "100px" }}
                                    onClick={() => {                                    
                                        params.setVideoVisible(false);
                                    }}>
                                    Back
                                </button> 
                            </div>    
                        </div>                                 
                    </div>   
                </div>     
            </Modal> 
        </div> 
    ); 
}   

export default MyBlockSchedule;    


// UNUSED CPDE RA_BRD
// ==================
// htps://ik.imagekit.io/roadsidecoder/yt/example.mp4" 
   
// 
// <p className="ml-10 mr-10 mt-[350px]">
// </p>  

//src = {baseURL + 'streamVideo?user_ID="' + params.user_ID 
 //                                          +"&JWT=" + params.JWT
  //                                         + "&filename=" + params.VideoLink}
// src = {baseURL + 'streamVideo?user_ID="' + params.user_ID 
 //                                          +"&JWT=" + params.JWT
 //                                          + "&filename=" + params.VideoLink}
// {baseURL + 'streamVideo?user_ID="' + params.user_ID 
  //                                         +"&JWT=" + params.JWT
 //  
 //                                       + "&filename=" + params.VideoLink}


    // <video className="text-white"                               
    //                            width = '320'
    //                            height = '240'
    //                            autoPlay  
    //                            controls                                                         
    //                            src = "https://ik.imagekit.io/roadsidecoder/yt/example.mp4"                              
    //                            type = 'video/mp4'>                            
    //                         Your browser does not support video   
    //                     </video>   
    
    // <ReactPlayer
    //                        src = "ht

    //
