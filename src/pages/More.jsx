//
// MORE PAGE
// =========
// This is the Strength Coaching Online public Tell me more page where users can read
// information about the site on multiple pages. They cannot proceed further 
// without logging in and authenticating their identity or registering.
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
        </div>    
    );
}   
//
// Page_1
// ======
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
                        width={455}
                    />             

                    <div className="flex flex-col">                                                               
                        <p className="ml-5 mr-5 text-white text-5xl font-bold">
                            Luke here                      
                        </p>
                        <br></br>
                        <p className="ml-5 mr-5 text-white text-2xl font-bold">
                            I am all about helping                      
                        </p>
                        <p className="ml-5 mr-5 text-white text-2xl font-bold">
                            YOU get strong !                      
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
                                More &gt; 
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
function Page_2(params) {    
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
                        width={355}
                    />             

                    <div className="flex flex-col">                                                               
                        <p className="ml-5 mr-5 text-white text-4xl font-bold">
                            How does this work?                
                        </p>
                        <br></br>

                        <div>
                            <ul>
                                <li className="ml-5 mr-5 mb-2 text-white text-2xl font-bold">&#8226; A Dynamic Program. </li>
                                <li className="ml-5 mr-5 mb-2 text-white text-2xl font-bold">&#8226; Custom Analytic Reports.</li>
                                <li className="ml-5 mr-5 mb-2 text-white text-2xl font-bold">&#8226; In-depth Video Analysis.</li>
                                <li className="ml-5 mr-5 mb-0 text-white text-2xl font-bold">&#8226; Education about the WHY,</li>
                                <p className="ml-5 mr-5 text-white text-2xl font-bold">&nbsp; &nbsp;not only the WHAT.</p>
                            </ul>
                        </div>
                        <br></br>

                        <p className="ml-5 mr-5 text-white text-2xl font-bold">
                            Do you want Free Programs, Ebooks,                   
                        </p>  
                        <p className="ml-5 mr-5 text-white text-2xl font-bold">
                            and other resouces?                  
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
                                    onClick={() => params.setPageNumber(1)}>                                    
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
                                    onClick={() => {params.setPageNumber(3)}}>
                                More &gt; 
                            </button>
                        </div>
                    </div>                     
                </div>                
            </div>   
        </div>         
    );
}

export default More
