//
// TODAY'S TRAINING SCHEDULE
// =========================
// This is today's schedule for the client.
//
// Revision History
// ================
// 25.02.2024 BRD Original version.
//
import './Main.css';

import TopNav from "./components/TopNav";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

//
// Home
// ====
function Today() {
    let navigate = useNavigate();    
    let userID = sessionStorage.getItem("userID");

    //
    // Authentication and Navigation
    // =============================
    // Checks to see if the local storage has a userID set to ensure that
    // only authenticated uses can navigate around the application. This
    // is also a convenient way of logging out. When the UserID is set to
    // blank via the Sign-out button click, there is no longer an
    // authenticated user.
    //
    useEffect(() => {
        if (!userID) {
            // The page is being accessed by an unauthorised user so redirect them
            // back to the landing page.
            return navigate("/"); 
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userID]);

    let userName = sessionStorage.getItem("FirstName") + " " + sessionStorage.getItem("LastName");  
    let userImage = "./userImages/" + userID + ".png";
    console.log("UserID " + userID);
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

    return (
        <div>
            <div>
                <section>
                    <SideNav page="Home" IsChanged={false}/>
                    <TopNav title="Today's Training Schedule" userID = {userID} userImage = {userImage}
                            userName={userName} userRole={userRole} />

                    <div className="flex flex-col absolute top-24 bottom-0
                                items-center justify-center
                                left-[247px] right-0 bg-gray-800 overflow-hidden">

                        <p className="ml-1 mt-3 text-white">This is your Training Schedule for today</p>

                        <br></br>

                        <p className="ml-1 text-white">
                            Content goes in here ... and here
                        </p>
                        <br></br>
                    </div>
                </section>
            </div>
        </div>
    )
}
export default Today