//
// MORE INFORMATION PAGES
// ======================
// These are the Strength Coaching Online public "Tell Me More..." pages where anyone 
// can read information about the company and what we do on multiple pages, structured
// pages. 
//
// Documentation
// =============
// These page do not require the users to be registered or authenticated. However,
// they cannot proceed further without logging in and authenticating their identity
// or registering.
//
// This is a multi-page component that switches between visible sections by incrementing
// or decrementing the pageNumber useState hook.
//
// Revision History
// ================
// 01.08.2025 BRD Original version.
//
import './Main.css';

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import TopNav from "./components/TopNav";

import Luke_gym from "./images/Luke_gym.png";
import Luke_gym_2 from "./images/Luke_gym_2.png";
import laptop from "./images/laptop.png";
import sign_in_image from "./images/sign_in_image.png";

//
// More()
// ======
function More() {
    // Ensure that any authenticated user returning to this page after signing-in
    // previously is deauthenticated.
    sessionStorage.setItem("userID", "");
    sessionStorage.setItem("FirstName", "");
    sessionStorage.setItem("LastName", "");
    sessionStorage.setItem("UserAuthority", "");
    sessionStorage.setItem("JWT", ""); 

    let navigate = useNavigate();
    const [pageNumber, setPageNumber] = useState(1);

    return (        
        <div>                           
            <TopNav title="" userName="" userRole="" />

            <div className="flex absolute top-24 bottom-0
                    items-center justify-center
                    left-0 right-0
                    bg-gray-800 overflow-hidden"> 
            </div>

            {(pageNumber === 1) && (
                <Page_1
                    setPageNumber={setPageNumber}
                    navigate={navigate}
                />
            )};  

            {(pageNumber === 2) && (
                <Page_2
                    setPageNumber={setPageNumber}
                    navigate={navigate}
                />
            )};  

            {(pageNumber === 3) && (
                <Page_3
                    setPageNumber={setPageNumber}
                    navigate={navigate}
                />
            )};    

            {(pageNumber === 4) && (
                <Page_4
                    setPageNumber={setPageNumber}
                    navigate={navigate}
                />
            )};       
        </div>    
    );
}   
//
// Page_1
// ======
// This is the Luke here.. introductory page.
//
function Page_1(params) {    
    return (        
        <div>                         
            <TopNav title="" userName="" userRole=""/>

            <div className="flex flex-col">
                <div className="flex flex-row absolute top-24 bottom-0
                                items-center justify-center
                                left-0 right-0 bg-gray-800 overflow-hidden">

                    <img className="rounded"
                        src={Luke_gym}
                        alt="/"
                        draggable={false}                            
                        width={525}
                    />             

                    <div className="flex flex-col">                                                               
                        <p className="ml-5 mr-5 text-white text-6xl font-bold">
                            Luke here                      
                        </p>
                        <br></br>
                        <p className="ml-5 mr-5 text-white text-2xl font-bold">
                            I am all about helping                      
                        </p>
                        <p className="ml-5 mr-5 text-white text-2xl font-bold">
                            <span className="text-cyan-300 text-2xl font-bold">YOU</span> get strong !                     
                        </p>
                        <br></br>
                        <p className="ml-5 mr-5 text-white text-sm">
                            I have worked with strength enthusiasts across the                      
                        </p>
                        <p className="ml-5 mr-5 text-white text-sm">
                            world, from first-timers in the gym to internationally                     
                        </p>
                        <p className="ml-5 mr-5 text-white text-sm">
                            competitive powerlifters !                      
                        </p>
                        <br></br>
                        <p className="ml-5 mr-5 text-white text-sm">
                            I am here to give you all the knowledge and                      
                        </p>
                        <p className="ml-5 mr-5 text-white text-sm">
                            experience that I have gained over the years to help                     
                        </p>
                        <p className="ml-5 mr-5 text-white text-sm">
                            YOU get strong.                
                        </p>
                        <br></br>

                        <div className="flex flex-row">
                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="More"
                                    style={{ width: "100px"}}
                                    onClick={() => params.navigate("/")}>                                    
                                &lt; Back
                            </button>

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                                mt-2 ml-5"
                                    id="More"
                                    style={{ width: "100px"}}
                                    onClick={() => {
                                        params.setPageNumber(2);
                                    }}>
                                Next &gt; 
                            </button>
                        </div>
                    </div>                     
                </div>                
            </div>   
        </div>         
    );
}

//
// Page_2
// ======
// This is the "Train like the Pros" page.

function Page_2(params) {    
    return (        
        <div>                         
            <TopNav title="" userName="" userRole=""/>

            <div className="flex flex-col">
                <div className="flex flex-row absolute top-24 bottom-0
                                items-center justify-center
                                left-0 right-0 bg-gray-800 overflow-hidden">

                    <div>
                        <p className="ml-10 text-white text-5xl font-bold">
                            Train like the <span className="text-cyan-300 text-5xl font-bold"> Pros</span>                            
                        </p>
                        <br></br>
                        
                        <ul>
                            <li className="ml-28 mr-5 mb-2 text-white text-4xl font-bold">1. Measure ...</li>
                            <li className="ml-28 mr-5 mb-2 text-white text-4xl font-bold">2. Analyse ...</li>
                            <li className="ml-28 mr-5 mb-2 text-white text-4xl font-bold">3. Optimise ...</li>                            
                        </ul> 
                        <br></br>

                        <img className="rounded ml-16"
                             src={sign_in_image}
                             alt="/"
                             draggable={false}                            
                             width={350}
                        />
                    </div>

                    <div className="flex flex-col"> 
                        <img className="ml-24 box-border border-2 rounded-lg"
                             src={laptop}
                             alt="/"
                             draggable={false}                            
                             width={210}
                        />
                        <br></br>  

                        <p className="ml-5 mr-5 text-cyan-300 text-2xl ">  
                            Coaching that just gets better with            
                        </p>
                        <p className="text-center text-cyan-300 text-2xl">  
                            time !        
                        </p>

                        <br></br>
                        <p className="ml-5 mr-5 text-white text-sm">
                            By tracking your performance, recovery, and perception                     
                        </p>
                        <p className="ml-5 mr-5 text-white text-sm">
                            metrics, we can use your training data in our research                   
                        </p>
                        <p className="ml-5 mr-5 text-white text-sm">
                            to build you a better application and coaching program. 
                        </p>
                        <br></br>
                        <p className="ml-5 mr-5 text-white text-sm">
                            The more data we have, the more accurately we can
                        </p>
                        <p className="ml-5 mr-5 text-white text-sm">
                            predict what 
                            <span className="text-cyan-300 text-sm font-bold"> works for you !</span>                            
                        </p>

                        <div className="flex flex-row">
                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="More"
                                    style={{ width: "100px"}}
                                    onClick={() => {params.setPageNumber(1);}}>                                 
                                &lt; Back
                            </button>

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="Free"
                                    style={{ width: "140px"}}
                                    onClick={() => params.setPageNumber(1)}>                                    
                                INQUIRE NOW
                            </button>

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                                mt-2 ml-5"
                                    id="More"
                                    style={{ width: "100px"}}
                                    onClick={() => {params.setPageNumber(3);}}>
                                Next &gt; 
                            </button>
                        </div>
                    </div>                     
                </div>     
            </div>    
        </div>         
    );
}
//
// Page_3
// ======
// This is the "How does this work?" page.
//
function Page_3(params) {    
    return (        
        <div>                         
            <TopNav title="" userName="" userRole=""/>

            <div className="flex flex-col">
                <div className="flex flex-row absolute top-24 bottom-0
                                items-center justify-center
                                left-0 right-0 bg-gray-800 overflow-hidden">

                    <img className="rounded"
                        src={Luke_gym_2} 
                        alt="/"
                        draggable={false}                            
                        width={310}
                    />             

                    <div className="flex flex-col">                                                               
                        <p className="ml-5 mr-5 text-white text-4xl font-bold">
                            How does this work?                
                        </p>
                        <br></br>

                        <div>
                            <ul>
                                <li className="ml-5 mr-5 mb-2 text-white text-2xl font-bold">&#8226;&nbsp; A Dynamic Program. </li>
                                <li className="ml-5 mr-5 mb-2 text-white text-2xl font-bold">&#8226;&nbsp; Custom Analytic Reports.</li>
                                <li className="ml-5 mr-5 mb-2 text-white text-2xl font-bold">&#8226;&nbsp; In-depth Video Analysis.</li>
                                <li className="ml-5 mr-5 mb-0 text-white text-2xl font-bold">&#8226;&nbsp; Education about the WHY,</li>
                                <p className="ml-10 mr-5 text-white text-2xl font-bold">not only the WHAT.</p>
                            </ul>
                        </div>
                        <br></br>

                        <p className="ml-5 mr-5 text-white text-2xl font-bold">
                            Do you want Free Programs, Ebooks,                   
                        </p>  
                        <p className="ml-5 mr-5 text-white text-2xl font-bold">
                            and other resouces ?                  
                        </p>  
                        <br></br>

                        <p className="ml-5 mr-5 text-white text-sm"> ​Click the FREE RESOURCES button below to access everything you</p>
                        <p className="ml-5 mr-5 text-white text-sm"> need to get started with strength training.</p>  
                        <br></br>                    

                        <div className="flex flex-row">
                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="Back"
                                    style={{ width: "100px"}}
                                    onClick={() => params.setPageNumber(2)}>                                    
                                &lt; Back
                            </button>

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="Free"
                                    style={{ width: "140px"}}
                                    onClick={() => params.setPageNumber(1)}>                                    
                                FREE RESOURCES
                            </button>

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                                mt-2 ml-5"
                                    id="More"
                                    style={{ width: "100px"}}
                                    onClick={() => {params.setPageNumber(4)}}>
                                Next &gt; 
                            </button>
                        </div>
                    </div>                     
                </div>                
            </div>   
        </div>         
    );
}

//
// Page_4
// ======
// This is the "What the strong people have to say" page.
//
function Page_4(params) {    
    return (        
        <div>                         
            <TopNav title="" userName="" userRole=""/>

            <div className="flex flex-col">
                <div className="flex flex-row absolute top-24 bottom-0
                                items-center justify-center
                                left-0 right-0 bg-gray-800 overflow-hidden">
                    <div className="flex flex-col">
                        <p className="ml-5 mr-5 text-white text-3xl font-bold">
                            What the strong people have to say !                  
                        </p>
                        <br></br>

                        <p className="ml-5 mr-5 text-white text-3xl font-bold">
                            next bit          
                        </p>                     

                        <div className="flex flex-row ml-14">
                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="More"
                                    style={{ width: "100px"}}
                                    onClick={() => {params.setPageNumber(3);}}>                                 
                                &lt; Back
                            </button>

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="Free"
                                    style={{ width: "140px"}}
                                    onClick={() => params.setPageNumber(1)}>                                    
                                Load More
                            </button>

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                                mt-2 ml-5"
                                    id="Next"
                                    style={{ width: "100px"}}
                                    onClick={() => {params.setPageNumber(3);}}>
                                Next &gt; 
                            </button>
                        </div>  
                    </div>
                </div> 
            </div>
        </div>    
    );
}



        //         <div className="flex flex-row absolute top-24 bottom-0
        //                         items-center justify-center
        //                         left-0 right-0 bg-gray-800 overflow-hidden">

        //             <div className="flex flex-col">
        //                 <p className="ml-5 mr-5 text-white text-3xl font-bold">
        //                     Left t                 
        //                 </p>

        //                 <p className="ml-5 mr-5 text-white text-3xl font-bold">
        //                     Right r                 
        //                 </p>
        //             </div>
                                                                            
                    
        //             <br></br>

        //             <div className="flex flex-col">
        //                 <div>
        //                     <p className="ml-5 mr-5 text-white text-3xl font-bold">
        //                         Left                  
        //                     </p>

        //                     <p className="ml-5 mr-5 text-white text-3xl font-bold">
        //                         Right                  
        //                     </p>

        //                 </div>
                        
        //             </div> 


                    
        //         </div>
        //     </div> 
        // </div> 

export default More
