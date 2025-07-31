//
// LANDING PAGE
// ============
// This is the Strength Coaching Online public landing page where users can read
// information about the site on multiple pages. They cannot proceed further 
// without logging in and authenticating their identity or registering.
//
// Revision History
// ================
// 31.12.2024 BRD Original version.
// 30.07.2025 BRD Cloned Strength Coaching from the Strength Research application.
// 31.07.2025 BRD New page design inherited from the original Strength Coaching
//                Online site (www.strengthcoaching.online).
//
import './Main.css';
import { useNavigate } from "react-router-dom";
import TopNav from "./components/TopNav";
import Sign_In_People from "./images/Sign_In_People.png";
//
// Landing()
// =========
function Landing() {
    // Ensure that any authenticated user returning to page after signing-in previously 
    // is deauthenticated.
    sessionStorage.setItem("userID", "");
    sessionStorage.setItem("FirstName", "");
    sessionStorage.setItem("LastName", "");
    sessionStorage.setItem("UserAuthority", "");
    sessionStorage.setItem("JWT", ""); 

    let navigate = useNavigate();

    return (        
        <div>                         
            <TopNav title="" userName="" userRole=""/>

            <div className="flex flex-row absolute top-24 bottom-0
                            items-center justify-center
                            left-0 right-0
                            bg-gray-800 overflow-hidden">

                <div className="flex flex-col">                                                               
                    <p className="ml-5 mr-5 text-white text-6xl">
                            Access to top                        
                        </p>
                        <br></br>
                        <p className="ml-5 mr-5 text-cyan-300 text-6xl font-bold">
                            Strength                      
                        </p>
                        <p className="ml-5 mr-5 text-cyan-300 text-6xl font-bold">
                            Coaching                      
                        </p>
                        <br></br>
                        <p className="ml-5 mr-5 text-white text-4xl">
                            No matter where                     
                        </p>
                        <p className="ml-5 mr-5 text-white text-4xl">
                            you are !                      
                        </p>
                        <br></br>

                        <div className="flex flex-row">                                
                            <div> 
                                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                                        mt-2 ml-5"                                    
                                    id="Sign_In"
                                    style={{ width: "125px" }}
                                    onClick={() => navigate("/SignIn")}>
                                    Sign in
                                </button>
                            </div>
                            <div>  
                                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                                        mt-2 ml-5"
                                        id="Tell_me_more"
                                        style={{ width: "125px" }}
                                        onClick={() => {                                                            
                                        }}>
                                    Tell me more ...
                                </button>  
                            </div> 
                        </div> 
                    </div>                    

                    <div className="relative flex items-center justify-center mt-0 ml-3">
                        <img className="rounded"
                            src={Sign_In_People}
                            alt="/"
                            draggable={false}
                            height={110}
                            width={255}
                        />
                    </div>                    
            </div>        
        </div>      
    )
}
export default Landing
