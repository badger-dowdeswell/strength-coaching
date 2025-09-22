//
// TOP NAVIGATION BAR
// ===================
// This is the top navigation bar component. It is shared by all
// pages and configured using parameters passed in from each page
// via the params object:
//
// params.title     The title of the page to be displayed in the
//                  top left corner of the navigation bar.
// params.userID    The numeric user identification number of
//                  the user who has signed in.
// params.userName  The name concaternated with the last name of 
//                  the user. This is only displayed after the user
//                  has authenticated.
// params.userRole  The role of the user such as "Administrator".
//                  or "Client". This is only displayed after 
//                  the user has authenticated.
// params.userImage The fully-qualfied path and file name of the
//                  picture of the user that is stored in the
//                  public/userImages directory of the site. 
//
// Revision History
// ================
// 07.01.2024 BRD Original version.
// 10.01.2025 BRD Made the client display information load dynamically.
// 29.03.2025 BRD The component now loads the client information by itself
//                instead of relying on parameters from the calling page.
// 19.07.2025 BRD Redefined the useRole to reflect the new user_authority
//                defined in the database.
//
import '../Main.css';
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import StrengthCoachingLogo from "./componentImages/Strength_Coaching_Logo.png";

function TopNav(params) { 
    let navigate = useNavigate();    

    var userID = sessionStorage.getItem("userID");  
    let userName = sessionStorage.getItem("FirstName") + " " + sessionStorage.getItem("LastName");  
    //const [userImage, setUserImage] = useState("/../front-end/userImages/" + sessionStorage.getItem("UserImage"));  
    const [userImage, setUserImage] = useState("./userImages/" + sessionStorage.getItem("UserImage"));    
    console.log("\nTopNav [" + userImage + "]");
    
    var userRole = "";   

    switch (sessionStorage.getItem("UserAuthority")) {
    case "S":
        userRole = "Administrator";
        break;

    case "C":
        userRole = "Coach";
        break;   

    case "U":
        userRole = "Client";
        break;  
        
    case "A":
        userRole = "AIRES AI"; 
        break;  

    default:
        userRole="";
    } 

    return (
        <div className="fixed w-full h-24
                       flex flex-row
                       top-0 left-0 m-0 
                       bg-gray-900 text-white overflow-y-hidden">

            <div className="relative flex items-center justify-center mt-1">
                <img src={StrengthCoachingLogo}
                     alt="/" draggable={false} 
                     height={95} width={250}
                     onClick={() => navigate("/")}/>
            </div>

            <div className="absolute left-64 top-8 w-auto 
                         text-white font-bold text-3xl">
                <p>{params.title}</p>
            </div>

            <div className="absolute top-0 right-5
                            text-white">
                <div className="flex flex-row-reverse">
                    <div>
                        <p className="font-bold text-lg ml-3 mt-7">{userName}</p>
                        <p className="font-bold text-sm ml-3">{userRole}</p>
                    </div>

                    <div>
                        {params.userName !="" && (
                            <img className="mt-6"
                                src={userImage}
                                alt="/"
                                draggable={false}
                                height={57}
                                width={57}
                                onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src= + "/userImages/template.png";
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
      </div>
   )
};

export default TopNav;