//
// SIDE NAVIGATION BAR
// ===================
// This is the left-hand side navigation bar component. It is
// shared by all pages and configured using parameters passed
// in from each page via the params object..
//
// Revision History
// ================
// 07.01.2024 BRD Original version.
// 14.01.2024 BRD Added configuration parameters to allow
//                the navigation bar to be customised for
//                each page.
//
import "../Main.css";
import { useNavigate } from "react-router-dom";

import guides from "./componentImages/guides.png";
import registration from "./componentImages/registration.png";
import home from "./componentImages/home.png";
import profile from "./componentImages/profile.png";
import progress from "./componentImages/progress.png";
import mySchedule from "./componentImages/mySchedule.png";
import todaysSchedule from "./componentImages/todaysSchedule.png"
import messages from "./componentImages/messages.png";
import signOut from "./componentImages/signOut.png";

import StrengthCoachingLogo from "./componentImages/Strength_Coaching_Logo.png";
//
// SideNav
// =======
// This links together each of the custom components defined in
// the next section that configure the side navigation panel for
// each individual page.
//
const SideNav = (params) => {
    return (
        <div className="fixed h-screen flex flex-col
                       top-0 left-0 w-auto m-0
                       bg-gray-900 text-white shadow-lg">
            <div>
                <div className="relative flex items-center justify-center mt-3">
                    <img src={StrengthCoachingLogo} alt="/" draggable={false} 
                         height={95} width={247}  />
                </div>

                <div>
                    {(params.page == "Landing" && (
                        <LandingOptions />
                    ))}

                    {(params.page == "SignIn" && (
                        <SignInOptions />
                    ))}

                    {(params.page == "Registration" && (
                        <RegistrationOptions />
                    ))}

                    {(params.page == "Home" && (
                        <HomeOptions IsChanged={params.IsChanged} />
                    ))}

                    {(params.page == "TodaysSchedule" && (
                        <TodaysScheduleOptions/>
                    ))}

                    {(params.page == "MySchedule" && (
                        <MyScheduleOptions/>
                    ))}

                    {(params.page == "MyProgress" && (
                        <MyProgressOptions/>
                    ))}

                    {(params.page == "MyMessages" && (
                        <MyMessagesOptions/>
                    ))}

                    {(params.page == "EditMyProfile" && (
                        <EditMyProfileOptions/>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default SideNav;

//
// LandingOptions
// ==============
// This function displays the side navigation options that are
// available on the Landing page.
//
function LandingOptions() {
    let navigate = useNavigate();

    return (
        <div>
             <div className="relative flex items-center ml-6 mt-10
                             hover:text-cyan-300">
                <img
                    src={guides}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/SignIn")}
                />
                <p className="ml-5" onClick={() => navigate("/SignIn")}>
                    Sign In
                </p>
            </div>

            <div className="relative flex items-center ml-6 mt-10
                           hover:text-cyan-300" >
                <img
                    src={registration}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/Registration")}
                />
                <p className="ml-5" onClick={() => navigate("/Registration")}>
                    Register
                </p>
            </div>
        </div>
    )
};

//
// SignInOptions
// ==============
// This function displays the side navigation options that are
// available on the Sign In page.
//
function SignInOptions() {
    let navigate = useNavigate();

    return (
        <div>
            <div className="relative flex items-center ml-6 mt-10
                           hover:text-cyan-300" >
                <img
                    src={home}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/")}
                />
                <p className="ml-5" onClick={() => navigate("/")}>
                    Home
                </p>
            </div>

            <div className="relative flex items-center ml-6 mt-10
                           hover:text-cyan-300" >
                <img
                    src={registration}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/Registration")}
                />
                <p className="ml-5" onClick={() => navigate("/Registration")}>
                    Register
                </p>
            </div>
        </div>
    );
};

//
//
// RegistrationOptions
// ===================
// This function displays the side navigation options that are
// available on the Registration page.
//
function RegistrationOptions() {
    let navigate = useNavigate();
    return (
        <div>
            <div className="relative flex items-center ml-6 mt-10
                   hover:text-cyan-300" >
                <img
                    src={home}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/")}
                />
                <p className="ml-5" onClick={() => navigate("/")}>
                    Home
                </p>
            </div>

            <div className="relative flex items-center ml-6 mt-10
                    hover:text-cyan-300" >
                <img
                    src={progress}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/")}
                />
                <p className="ml-5" onClick={() => navigate("/")}>
                    My progress
                </p>
            </div>
        </div>    
   );
}

//
// HomeOptions
// ===========
// This function displays the side navigation options that are
// available on the Home page.
//
function HomeOptions(params) {
   let navigate = useNavigate();
   return (
        <div> 
            <div className="relative flex items-center ml-6 mt-10
                   hover:text-cyan-300" >
                <img
                    src={todaysSchedule}
                    alt="/"                    
                    draggable={false} 
                    height={50}
                    width={50}
                    onClick={() => {                        
                        if (!params.IsChanged) {
                            navigate("/Today");
                        }}
                    }
                />
                <p  className="ml-5"
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/Today")
                        }}      
                    }>                  
                    Today&apos;s schedule
                </p>
            </div>

            <div className="relative flex items-center ml-6 mt-10
                   hover:text-cyan-300" >
                <img
                    src={mySchedule}
                    alt="/"
                    draggable={false} 
                    height={50}
                    width={50}
                    onClick={() => {                        
                        if (!params.IsChanged) {
                            navigate("/MySchedule");
                        }
                    }}
                />
                <p  className="ml-5" 
                    onClick={() => {
                        if (!params.IsChanged){
                            navigate("/MySchedule");
                        }}
                    }>
                    My schedule
                </p>
            </div>

            <div className="relative flex items-center ml-6 mt-10
                   hover:text-cyan-300" >
                <img
                    src={progress}
                    alt="/"
                    draggable={false} 
                    height={50}
                    width={50}
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/MyProgress");
                        }}
                    }    
                />
                <p  className="ml-5"
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/MyProgress");
                        }}    
                    }>
                    My progress
                </p>
            </div>

            <div className="relative flex items-center ml-6 mt-10
                   hover:text-cyan-300" >
                <img
                    src={messages}
                    alt="/"
                    draggable={false} 
                    height={50}
                    width={50}
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/MyMessages");
                        }}
                    }    
                />
                <p  className="ml-5" 
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/MyMessages");
                        }}    
                    }>
                    Messages
                </p>
            </div>

            <div className="relative flex items-center ml-6 mt-10
                   hover:text-cyan-300" >
                <img
                    src={profile}
                    alt="/"
                    draggable={false} 
                    height={50}
                    width={50}
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/EditMyProfile");
                        }}    
                    }
                />
                <p className="ml-5"
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/EditMyProfile");
                        }}
                    }>
                    Edit my profile
                </p>
            </div>

            <div className="relative flex items-center ml-6 mt-10
                   hover:text-cyan-300" >
                <img
                    src={signOut}
                    alt="/"
                    draggable={false} 
                    height={50}
                    width={50}
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/");
                        }}
                    }
                />
                <p  className="ml-5"
                    onClick={() => {
                        if (!params.IsChanged) {
                            navigate("/");
                        }} 
                    }>
                    Sign out
                </p>
            </div>
        </div>    
   );
};

//
// TodaysScheduleOptions
// =====================
// This function displays the side navigation options that are
// available on the clients training schedule for today.
//
function TodaysScheduleOptions() {
    let navigate = useNavigate();
    return (
         <div>
            <div className="relative flex items-center ml-6 mt-10
                         hover:text-cyan-300" >
                <img
                    src={home}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/Home")}
                />
                <p className="ml-5" onClick={() => navigate("/Home")}>
                    Home
                </p>
            </div> 

            <div className="relative flex items-center ml-6 mt-10
                    hover:text-cyan-300" >
                 <img
                     src={signOut}
                     alt="/"
                     draggable={false}
                     height={50}
                     width={50}
                     onClick={() => navigate("/")}
                 />
                 <p className="ml-5" onClick={() => navigate("/")}>
                     Sign out
                 </p>
             </div>
         </div>    
    );
 };

//
// MyScheduleOptions
// =================
// This function displays the side navigation options that are
// available on the clients full training schedule.
//
function MyScheduleOptions() {
    let navigate = useNavigate();
    return (
         <div>
            <div className="relative flex items-center ml-6 mt-10
                         hover:text-cyan-300" >
                <img
                    src={home}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/Home")}
                />
                <p className="ml-5" onClick={() => navigate("/Home")}>
                    Home
                </p>
            </div> 

            <div className="relative flex items-center ml-6 mt-10
                    hover:text-cyan-300" >
                 <img
                     src={signOut}
                     alt="/"
                     draggable={false}
                     height={50}
                     width={50}
                     onClick={() => navigate("/")}
                 />
                 <p className="ml-5" onClick={() => navigate("/")}>
                     Sign out
                 </p>
             </div>
         </div>    
    );
 };

 //
// MyProgressOptions
// =================
// This function displays the side navigation options that are
// available ...
//
function MyProgressOptions() {
    let navigate = useNavigate();
    return (
         <div>
            <div className="relative flex items-center ml-6 mt-10
                         hover:text-cyan-300" >
                <img
                    src={home}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/Home")}
                />
                <p className="ml-5" onClick={() => navigate("/Home")}>
                    Home
                </p>
            </div> 

            <div className="relative flex items-center ml-6 mt-10
                    hover:text-cyan-300" >
                 <img
                     src={signOut}
                     alt="/"
                     draggable={false}
                     height={50}
                     width={50}
                     onClick={() => navigate("/")}
                 />
                 <p className="ml-5" onClick={() => navigate("/")}>
                     Sign out
                 </p>
             </div>
         </div>    
    );
 };

 //
// MyMessagesOptions
// =================
// This function displays the side navigation options that are
// available on the clients ...
//
function MyMessagesOptions() {
    let navigate = useNavigate();
    return (
         <div>
            <div className="relative flex items-center ml-6 mt-10
                         hover:text-cyan-300" >
                <img
                    src={home}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/Home")}
                />
                <p className="ml-5" onClick={() => navigate("/Home")}>
                    Home
                </p>
            </div> 

            <div className="relative flex items-center ml-6 mt-10
                    hover:text-cyan-300" >
                 <img
                     src={signOut}
                     alt="/"
                     draggable={false}
                     height={50}
                     width={50}
                     onClick={() => navigate("/")}
                 />
                 <p className="ml-5" onClick={() => navigate("/")}>
                     Sign out
                 </p>
             </div>
         </div>    
    );
 };

 //
// EditMyProfileOptions
// ====================
// This function displays the side navigation options that are
// available on the clients ...
//
function EditMyProfileOptions() {
    let navigate = useNavigate();
    return (
         <div>
            <div className="relative flex items-center ml-6 mt-10
                         hover:text-cyan-300" >
                <img
                    src={home}
                    alt="/"
                    draggable={false}
                    height={50}
                    width={50}
                    onClick={() => navigate("/Home")}
                />
                <p className="ml-5" onClick={() => navigate("/Home")}>
                    Home
                </p>
            </div> 

            <div className="relative flex items-center ml-6 mt-10
                    hover:text-cyan-300" >
                 <img
                     src={signOut}
                     alt="/"
                     draggable={false}
                     height={50}
                     width={50}
                     onClick={() => navigate("/")}
                 />
                 <p className="ml-5" onClick={() => navigate("/")}>
                     Sign out
                 </p>
             </div>
         </div>    
    );
 };
 
