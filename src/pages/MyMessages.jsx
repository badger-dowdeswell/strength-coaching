//
// MY MESSAGES
// ===========
// This is the client's internal messaging page.
//
// Revision History
// ================
// 25.02.2024 BRD Original version.
// 30.07.2025 BRD Cloned Strength Coaching from the Strength Research application.
//
import './Main.css';

import TopNav from "./components/TopNav";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
//
// Home
// ====
function MyMessages() {
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
                    <SideNav page="Home" IsChanged={false} />
                    <TopNav title="Messages" userID = {userID} userImage = {userImage}
                            userName={userName} userRole={userRole} />

                    <div className="flex flex-col absolute top-24 bottom-0
                                items-center justify-center
                                left-[247px] right-0 bg-gray-800 overflow-hidden">

                        <p className="ml-1 mt-3 text-white">This is the page where the messages exchanged between a client and their trainer are displayed.</p>

                        <br></br>

                        <p className="ml-1 text-white">
                            Messages are displayed here ... and here
                        </p>
                        <br></br>
                    </div>
                </section>
            </div>
        </div>
    )
}
export default MyMessages;