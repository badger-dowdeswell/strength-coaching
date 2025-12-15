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

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { states, pages } from "./Constants";

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

    const [Block, setBlock] = useState(0);    
    const [CurrentWeek, setCurrentWeek] = useState(0);
    const [CurrentDay, setCurrentDay] = useState(0);
    
    const [MaxWeek, setMaxWeek]= useState(0);  
    
    const [VideoVisible, setVideoVisible] = useState(false); 
    const [VideoLink, setVideoLink] = useState(""); 
        
    // The array of objects that hold one one line for each exercise specified
    // for this block.   
    const [Schedule, setSchedule] = useState([]);

    // Editing fields. These are set by the function setEditingParams() and used
    // by the function updateParams() to update the Schedule array during editing.
    const [Index, setIndex] = useState();    
    const [ExerciseName, setExerciseName] = useState("");
    //const [Sets, setSets] = useState(0);
    const [ActualSets, setActualSets] = useState(0);
    //const [Reps, setReps] = useState(0);
    const [ActualReps, setActualReps] = useState(0);
    const [ActualWeight, setActualWeight] = useState(0);
    const [Notes, setNotes] = useState("");

    const [IsChanged, setIsChanged] = useState(false);  


                
                // <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-32">
                //     {params.weights}
                // </p>
                // <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-32">
                //     {params.actual_weights} 
                // </p>
                // <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-48">
                //     {params.velocity_based_metrics} 
                // </p>
                // <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-48">
                //     {params.notes} 
                // </p>
                // <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-14">
                //     {params.E1RM} 
                // </p>


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
    const [currentPage, setCurrentPage] = useState(pages.UNDEFINED);

    useEffect(() => {    
        switch (state) {            
            case states.UNDEFINED:
                // Load the primary client information and block schedule lines.
                setCurrentWeek(0);                
                loadSchedule(user_ID);
                break;            

            case states.LOADED:
                // A schedule was found for this client for this block.  
                setCurrentPage(pages.PAGE_DAY);               
                setCurrentWeek(1); 
                setCurrentDay(1); 
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
    // that displays the set of pages for the weeks in this schedule. Only weeks
    // where activities have been scheduled are visible.
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
                                    setCurrentWeek(index + 1);                                                 
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
                                    setCurrentDay(index + 1);                                                 
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
    // being activated.
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
    }, [CurrentWeek, CurrentDay] );

    //
    // setEditParams()
    // ===============
    // This function saves each editable value for an exercise to usState variables when
    // a exercise line is clicked in the list of exercises for the day. This allows normal
    // editing text boxes to be used to change values. The function nnn() is used later
    // to save changed values back into the ScheduleLine array.
    // 
    function setEditParams(params) {
        console.log("setEditParams " + params.index + " " + params.exercise_name); 

        setIndex(params.index);
        setExerciseName(params.exercise_name);
        setActualSets(params.actual_sets);
        setActualReps(params.actual_reps);     
        setActualWeight(params.actual_weight);
        setNotes(params.notes);   
    }

    //
    // updateParams()
    // ==============
    // This function updates the Schedule array entry for the line that is currently being
    // edited.
    //
    function updateParams(params) {
        console.log("updateParams:\n" +
                    "index = " + Index + "\n" +
                    "sets = " + ActualSets + " reps = " + ActualReps + "\n" 
        );

        Schedule[Index].actual_sets = ActualSets;
        Schedule[Index].actual_reps = ActualReps;
        Schedule[Index].actual_weight = ActualWeight;
        Schedule[Index].notes = Notes.trim();
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

                    {(currentPage === pages.PAGE_DAY) && (
                        <Page_Day
                            Schedule = {Schedule}
                            activeWeek = {CurrentWeek}
                            activeDay = {CurrentDay} 
                            setVideoVisible = {setVideoVisible} 
                            setVideoLink = {setVideoLink}
                            currentPage = {currentPage} setCurrentPage = {setCurrentPage}
                            navigate = {navigate} 
                            setEditParams = {setEditParams}                                                                                            
                        />                   
                    )};

                    {(currentPage === pages.PAGE_EXERCISE) && (
                        <Page_Exercise
                            Schedule = {Schedule}
                            index = {Index}
                            activeWeek = {CurrentWeek}
                            activeDay = {CurrentDay} 
                            setVideoVisible = {setVideoVisible} 
                            setVideoLink = {setVideoLink}
                            currentPage = {currentPage} setCurrentPage = {setCurrentPage}
                            navigate = {navigate} 
                            actualSets = {ActualSets} setActualSets = {setActualSets}
                            actualReps = {ActualReps} setActualReps = {setActualReps}
                            actualWeight = {ActualWeight} setActualWeight = {setActualWeight}
                            notes = {Notes} setNotes = {setNotes}
                            setEditParams = {setEditParams} 
                            setIsChanged = {setIsChanged} 
                            updateParams = {updateParams}                                                               
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
            <hr className="h-px my-0 bg-white border-0"></hr> 
            <p className="text-white text-center font-bold text-xl mt-5">
                Training Schedule</p>                   
            
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
                        reps = {line.reps}
                        actual_reps = {line.actual_reps}
                        weights = {line.lower_weight + " - " + line.upper_weight}
                        actual_weight = {line.actual_weight}
                        velocity_based_metrics = {line.velocity_based_metrics}
                        notes = {line.notes}
                        E1RM = {line.E1RM} 
                        setVideoVisible = {params.setVideoVisible} 
                        currentPage = {params.currentPage} setCurrentPage = {params.setCurrentPage}
                        setVideoLink = {params.setVideoLink}  
                        setEditParams = {params.setEditParams}
                        updateParams = {params.updateParams}                                                               
                    />                        
                ))}
            </div>

            <div className="flex flex-col items-center mt-auto"> 
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2
                                    rounded mb-6 mt-10 ml-8"
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
// Page_Exercise()
// ==============
// Displays the exercise selected from the current day and allows the fields to be edited.
//
function Page_Exercise(params){
    //console.log("Page_Exercise " + params.Schedule[params.index].exercise_name +  " " + params.actualSets + " ]");
    
    return (
        <div>
            <hr className="h-px my-0 bg-white border-0"></hr> 
            <p className="text-white text-center font-bold text-xl mt-5">
                {params.Schedule[params.index].exercise_name}
            </p>                   
            
            <div className="flex flex.row text-white">                        
                <p className="text-center border mb-0 mt-5 ml-0 w-40">
                    Exercise 
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

            <div className="flex flex.row">
                <p className="text-white text-base border pl-1 mb-0 mt-0 ml-0 w-40">                                               
                    {params.Schedule[params.index].exercise_name} 
                    <img className="ml-auto"
                        src={training_video_image}
                        title="The training video for this exercise" 
                        draggable={false} 
                        height={30} width={30}                             
                    />                            
                </p> 

                <p className="bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-10">                            
                    {params.Schedule[params.index].sets} 
                </p> 

                <div className="flex flex-col">                    
                    <input className="bg-white text-black text-center w-10 h-[27px]"
                        id="ActualSets"
                        type="number"
                        placeholder=""
                        value={params.actualSets}
                        onChange={(e) => {
                                params.setActualSets(e.target.value);
                                params.setIsChanged(true);            
                        }} 
                    />                     
                    <p className="bg-white text-black w-10 h-[60px]">
                        
                    </p>                    
                </div>  

                <p className="bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-10">                            
                    {params.Schedule[params.index].reps} 
                </p> 
                
                <textarea className="bg-white text-black border text-center text-wrap w-10 h-auto"
                       id="ActualReps"
                       type="text"
                       placeholder=""
                       value={params.actualReps}
                       onChange={(e) => {
                            params.setActualReps(e.target.value);
                            params.setIsChanged(true);            
                       }} 
                /> 

                <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-32">
                    {params.Schedule[params.index].lower_weight + " - " + params.Schedule[params.index].upper_weight}
                </p>

                <div className="flex flex-col">                    
                    <input className="bg-white text-black text-center w-32 h-[27px]"
                        id="ActualWeight"
                        type="number"
                        placeholder=""
                        value={params.actualWeight}
                        onChange={(e) => {
                            params.setActualWeight(e.target.value);
                            params.setIsChanged(true);            
                        }} 
                    />                     
                    <p className="bg-white text-black w-32 h-[60px]">
                        
                    </p>                    
                </div> 
                
                <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-48">
                    {params.Schedule[params.index].velocity_based_metrics} 
                </p>

                <textarea className="bg-white text-black border text-center text-wrap w-48 h-auto" 
                          id="Notes"
                          type="text"
                          placeholder=""
                          value={params.notes}
                          onChange={(e) => {
                              params.setNotes(e.target.value);
                              params.setIsChanged(true);            
                          }} 
                /> 

                <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-14">
                    {params.Schedule[params.index].E1RM} 
                </p>
            </div>

            <div className="flex flex-col items-center mt-auto">  
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2
                                   rounded mb-6 mt-10 ml-8"
                        id="Back"
                        style={{ width: "100px" }}
                        onClick={() => { 
                            params.updateParams();                                
                            params.setCurrentPage(pages.PAGE_DAY); 
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
// This component is able to receive one line as an object from a block schedule
// array and display it. It does not allow the client to modify the fields. That
// is done in the ScheduleDay component, which only displays one day that they
// have selected. There, they can report their training progress on the specified
// exercise.
//
// The component processes and formats the schedule one line at a time. If the
// data does not belong to the specified week, or the specific day, a null 
// element is returned so that line is not displayed on the wrong page.
//
function ScheduleLine(params) { 
    if ((params.activeWeek === params.week) && (params.activeDay === params.day)) {         
        return (
            <div>                
                <div className="flex flex.row"
                    onClick={() => {  
                        //showExercise(params.week, params.day, params.seq_ID, params.index); 
                        //console.log("\nExercise clicked = " + params.week + " day = " + params.day + 
                        //            " seq_ID = " + params.seq_ID + " index = " + params.index +
                        //            " exercise = " + params.exercise_name
                        //            );
                        //params.setEditParams(params.index, params.exercise_name);
                        params.setEditParams(params)
                        params.setCurrentPage(pages.PAGE_EXERCISE);                               
                    }}> 
                    <p  className="text-white text-base border pl-1 mb-0 mt-0 ml-0 w-40">                                               
                        {params.exercise_name} 
                        <img className="ml-auto"
                             src={training_video_image}
                             title="The training video for this exercise" 
                             draggable={false} 
                             height={30} width={30}                             
                        />                            
                    </p>  

                    <div className="flex flex.col">
                        <p className="bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-10">                            
                            {params.sets} 
                        </p> 
                        <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.actual_sets} 
                        </p> 
                        <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.reps} 
                        </p>
                        <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.actual_reps} 
                        </p>
                        <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-32">
                            {params.weights}
                        </p>
                        <p className = "bg-gray-800 text-white  text-base text-center border mb-0 mt-0 ml-0 w-32">
                            {params.actual_weight} 
                        </p>
                        <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-48">
                            {params.velocity_based_metrics} 
                        </p>
                        <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-48">
                            {params.notes} 
                        </p>
                        <p className = "bg-gray-800 text-white text-base text-center border mb-0 mt-0 ml-0 w-14">
                            {params.E1RM} 
                        </p>
                    </div> 
                </div>           
            </div>
        )
    } else {
        return null;
    } 
    
    //
    // showExercise() RA_BRD
    // =====================
    function showExercise(week, day, seq_ID, index) {
    //    console.log("\nExercise clicked = " + week + " day = " + day + 
    //                " seq_ID = " + seq_ID + " index = " + index);
    //    setCurrentPage(pages.PAGE_EXERCISE);            
    }     
};

//
// ScheduleDay()
// ==============
// This component is only displays one day that the client has selected. Here,
// they can report their training progress on the specified exercise.
//
function SchedulDay(params) { 
    if ((params.activeWeek === params.week) && (params.activeDay === params.day)) { 
        return (
            <div>                
                <div className="flex flex.row"> 
                    <p className="text-white text-base border pl-1 mb-0 mt-0 ml-0 w-40">                        
                        {params.exercise_name}
                       
                        <img className="ml-auto"
                             src={training_video_image}
                             title="The training video for this exercise" 
                             draggable={false} 
                             height={30} width={30}
                             onClick={() => {  
                                //console.log("Video link " + params.video_link);
                                params.setVideoLink(params.video_link);                             
                                params.setVideoVisible(true);
                             }}
                        />                            
                    </p>  

                    <div className="flex flex.col">
                        <p className="text-white text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.sets} 
                        </p> 
                        <p className="bg-white text-black text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.actual_sets} 
                        </p> 
                        <p className="text-white text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.reps} 
                        </p>
                        <p className="bg-white text-black text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.actual_reps} 
                        </p>
                        <p className="text-white text-base text-center border mb-0 mt-0 ml-0 w-32">
                            {params.weights}
                        </p>
                        <p className="bg-white text-black text-base text-center border mb-0 mt-0 ml-0 w-32">
                            {params.actual_weight} 
                        </p>
                        <p className="text-white text-base text-center border mb-0 mt-0 ml-0 w-48">
                            {params.velocity_based_metrics} 
                        </p>
                        <p className="bg-white text-black text-base text-center border mb-0 mt-0 ml-0 w-48">
                            {params.notes} 
                        </p>
                        <p className="text-white text-base text-center border mb-0 mt-0 ml-0 w-14">
                            {params.E1RM} 
                        </p>
                    </div> 
                </div>           
            </div>
        )
    } else {
        return null;
    } 
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
//    
// ShowBlockWeek
// =============
// function ShowBlockWeek() {
//     return (
//         <div>            
//             <TopNav title=""/>
//             <div className="flex flex-col absolute top-24 bottom-0
//                             items-center justify-center
//                             left-0 right-0 bg-gray-800 overflow-hidden">

//                 <div className="flex flex-col box-border border-2 rounded-lg    
//                                 ml-10 mr-10 h-[500px] w-auto">

//                     {/*  Display the video player window
//                         video_link = {params.video_link}
//                     */}
//                     <div>
//                         {(VideoVisible) && (
//                             <ShowVideo 
//                                 user_ID = {user_ID}
//                                 JWT = {JWT}
//                                 setVideoVisible = {setVideoVisible}
//                                 VideoLink = {VideoLink}                                
//                             />
//                         )}
//                     </div>                 
                    
//                     <div className="flex flex-row">
//                         <WeekTabBar/>         
//                     </div>    
                    
//                     <div className="flex flex-row">
//                         <DayTabBar/>         
//                     </div> 
//                     <hr className="h-px my-0 bg-white border-0"></hr>   

//                     <p className="text-white text-center font-bold text-xl mt-5">
//                         My Block {Block} Week {CurrentWeek} Day {CurrentDay} Training Schedule</p>                   
                    
//                     <div className="flex flex.row text-white">                        
//                         <p className="text-center border mb-0 mt-5 ml-0 w-40">
//                             Exercises 
//                         </p>
//                         <p className="text-center border mb-0 mt-5 ml-0 w-20">
//                             Sets 
//                         </p>
//                         <p className="text-base text-center border mb-0 mt-5 ml-0 w-20">
//                             Reps 
//                         </p>
//                         <p className="text-base text-center border mb-0 mt-5 ml-0 w-32">
//                             Weights 
//                         </p>
//                         <p className="text-base text-center border mb-0 mt-5 ml-0 w-32">
//                             My Weights 
//                         </p>
//                         <p className="text-base text-center border mb-0 mt-5 ml-0 w-48">
//                             Velocity-Based Metrics 
//                         </p>
//                         <p className="text-base text-center border mb-0 mt-5 ml-0 w-48">
//                             Notes
//                         </p>  
//                         <p className="text-base text-center border mb-0 mt-5 ml-0 w-14">
//                             E1RM
//                         </p>     
//                     </div>            

//                     <div>
//                         {Schedule.map(line => (
//                             <ScheduleLine
//                                 activeWeek = {CurrentWeek}
//                                 activeDay = {CurrentDay}                                
//                                 day = {line.day}
//                                 week = {line.week}                                
//                                 key = {line.schedule_ID}
//                                 seq_ID = {line.seq_ID}
//                                 exercise_name = {line.exercise_name}
//                                 video_link = {line.video_link}
//                                 sets = {line.sets}
//                                 actual_sets = {line.actual_sets}
//                                 reps = {line.reps}
//                                 actual_reps = {line.actual_reps}
//                                 weights = {line.lower_weight + " - " + line.upper_weight}
//                                 actual_weights = {line.actual_weight}
//                                 velocity_based_metrics = {line.velocity_based_metrics}
//                                 notes = {line.notes}
//                                 E1RM = {line.E1RM} 
//                                 setVideoVisible = {setVideoVisible} 
//                                 setVideoLink = {setVideoLink}                                                                  
//                             />                        
//                         ))}
//                     </div>

//                     <div className="mt-auto">    
//                         <div className="flex flex-row justify-center mt-5">
//                             <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
//                                                 mb-6 mt-2 ml-8"
//                                 id="Save"
//                                 style={{ width: "100px" }}
//                                 onClick={() => { 
//                                 }}>
//                                 Save
//                             </button>  

//                             <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
//                                                 mb-6 mt-2 ml-8"
//                                 id="Back"
//                                 style={{ width: "100px" }}
//                                 onClick={() => { 
//                                     // RA_BRD                                
//                                     //if (IsChanged) {
//                                         //setTabColor(currentPage, pages.PAGE_1);
//                                     //   setCurrentPage(pages.PAGE_1);
//                                         //setState(states.CANCELLING);
//                                     //} else {
//                                         navigate("/Home");         
//                                     //}    
//                                 }}>
//                                 Back
//                             </button>  
//                         </div> 
//                     </div>
//                 </div>                
//             </div>  
//         </div>
//     )
// }