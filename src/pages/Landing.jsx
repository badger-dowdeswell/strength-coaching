//
// LANDING PAGE
// ============
// This is the Strength Research Online public landing page
// where users can read information about the site. They
// cannot proceed further without logging in and authenticating
// their identity or registering.
//
// Revision History
// ================
// 31.12.2024 BRD Original version.
//
import './Main.css';
import SideNav from "./components/SideNav";
import TopNav from "./components/TopNav";
//
// Landing
// =======
function Landing() {
    // Ensure that any authenticated user returning to page is deauthenticated.
    sessionStorage.setItem("userID", "");
    sessionStorage.setItem("FirstName", "");
    sessionStorage.setItem("LastName", "");
    sessionStorage.setItem("UserAuthority", "");
    sessionStorage.setItem("JWT", "");  
    return (        
        <div>
            <section>
                <SideNav page="Landing" />
                <TopNav title="Welcome to Strength Research Online"
                    userName="" userRole="" />

                <div className="flex flex-col absolute top-24 bottom-0
                                items-center justify-center
                                left-[247px] right-0
                                bg-gray-800 overflow-hidden">

                    <p className="ml-5 mt-3 text-white">This is the main landing page</p>
                    <br></br>h

                    <p className="ml-5 mr-5 text-white">
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                    </p>

                    <br></br>

                    <p className="ml-5 mr-5 text-white">
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                    </p>

                    <br></br>
                    <p className="ml-5 mr-5 text-white">
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here
                        Content pages go in here ... and here - THE END !!!!
                    </p>
                </div>
            </section>
        </div>      
   )
}
export default Landing
