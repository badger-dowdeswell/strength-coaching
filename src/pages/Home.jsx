//
// HOME PAGE
// =========
// This is the Strength Coaching Online home page. It can only be accessed by users
// who have signed in and been authenticated.
//
// Revision History
// ================
// 13.01.2024 BRD Original version.
// 30.07.2025 BRD Cloned Strength Coaching from the Strength Research application.
//
import './Main.css';

import TopNav from "./components/TopNav";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import My_Block_Schedule from "./images/My_Block_Schedule.png";
import Block_Review from "./images/Block_Review.png";
import Resources_Hub from "./images/Block_Review.png";
import Edit_My_Profile from "./images/Edit_My_Profile.png";
//
// Home
// ====
function Home() {
    let navigate = useNavigate();    
    
    //
    // Authentication and Navigation
    // =============================
    // Checks to see if the local storage has a userID set to ensure that
    // only authenticated uses can navigate around the application. This
    // is also a convenient way of logging out. When the UserID is set to
    // blank via the Sign-out button click, there is no longer an
    // authenticated user.
    //
    let userID = sessionStorage.getItem("userID");
    const JWT = sessionStorage.getItem('JWT');

    useEffect(() => {
        if (!userID.trim() || !JWT.trim()) {
            // The page is being accessed by an unauthorised user so redirect them
            // back to the landing page.
            return navigate("/"); 
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userID, JWT]);

    let userName = sessionStorage.getItem("FirstName") + " " + sessionStorage.getItem("LastName");  
    let userImage = "./userImages/" + userID + ".png";    
    var userRole = "";   
    switch (sessionStorage.getItem("UserAuthority")) {
        case "A":
            userRole = "Administrator";
            break;

        case "C":
            userRole = "Client";
            break;

        default:
            userRole="";
    } 
    
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
    // Key event handler to trap the Enter and Escape keys on the Home page to sign-out.
    // The Sign-Out button gets focus automatically when this page renders. 
    //
    const handleKeys = (e) => {
       if (e.key === 'Enter') {        
           document.getElementById('SignOut').click(); 
        } else if (e.key === 'Escape') {
           document.getElementById('SignOut').click();
        }
    }; 

    //
    // HOME
    // ====
    // Render the Home page.
    //
    return (
        <div>
            <TopNav title="" userID = {userID} userImage = {userImage}
                    userName={userName} userRole={userRole} />
            
            <div className="flex flex-col">                              
                <div className="flex flex-row absolute top-24 bottom-0
                                items-center justify-center
                                left-0 right-0 bg-gray-800 overflow-auto">

                    <div className="flex flex-col"> 
                        <div className="flex flex-row ml-20">
                            <div className="mr-10">
                                <img className="rounded"
                                    src={My_Block_Schedule}
                                    alt="/"
                                    draggable={false}                            
                                    width={275}
                                    onClick={() => {navigate("/MyBlockSchedule")}}>         
                                </img>                                
            
                                <p className="text-center text-white text-sm font-bold"
                                    onClick={() => {navigate("/MyBlockSchedule")}}>
                                    My Block Schedule        
                                </p> 
                            </div>   
            
                            <div className="mr-10">
                                <img className="rounded"
                                        src={Block_Review}
                                        alt="/"
                                        draggable={false}                            
                                        width={275}
                                        onClick={() => {navigate("/Home")}}>
                                </img>                                     
                                <p className="text-center text-white text-sm font-bold">
                                    Block Review     
                                </p> 
                            </div>  
                        </div>                     
                        <br></br>
                        <br></br>
                       
                        <div className="flex flex-row ml-20">
                            <div className="mr-10">
                                <img className="rounded"
                                    src={Resources_Hub}
                                    alt="/"
                                    draggable={false}                            
                                    width={275}
                                    onClick={() => {navigate("/Home")}}>         
                                </img>                                
            
                                <p className="text-center text-white text-sm font-bold"
                                   onClick={() => {navigate("/Home")}}>
                                    Resources Hub   
                                </p> 
                            </div>   
            
                            <div className="mr-10">
                                <img className="rounded"
                                     src={Edit_My_Profile}
                                     alt="/"
                                     draggable={false}                            
                                     width={275}
                                     onClick={() => {navigate("/EditMyProfile")}}>  
                                </img>  

                                <p className="text-center text-white text-sm font-bold"
                                   onClick={() => {navigate("/EditMyProfile")}}>
                                    Edit my Profile
                                </p> 
                            </div>    
                        </div>                     
                        <br></br>
                        <br></br>

                        <div className="flex flex-row ml-16">
                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded mt-2 ml-5"
                                    id="SignOut"
                                    style={{ width: "100px"}} 
                                    ref={autofocusID}                                   
                                    onKeyDown={handleKeys}
                                    onClick={() => {navigate("/")}}>                                 
                                Sign Out
                            </button> 
                        </div> 
                    </div>      
                </div> 
            </div>
        </div>
    );
}
export default Home
