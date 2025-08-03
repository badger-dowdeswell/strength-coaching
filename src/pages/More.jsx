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
import E1_image from "./images/E1.png";
import E1_TN_image from "./images/E1_TN.png";
import E2_image from "./images/E2.png";
import E2_TN_image from "./images/E2_TN.png";
import E3_image from "./images/E3.png";
import E3_TN_image from "./images/E3_TN.png";
import E4_image from "./images/E4.png";
import E4_TN_image from "./images/E4_TN.png";


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

            {(pageNumber === 41) && (
                <Page_41
                    setPageNumber={setPageNumber}
                    navigate={navigate}
                />
            )}; 

            {(pageNumber === 42) && (
                <Page_42
                    setPageNumber={setPageNumber}
                    navigate={navigate}
                />
            )};     

            {(pageNumber === 43) && (
                <Page_43
                    setPageNumber={setPageNumber}
                    navigate={navigate}
                />
            )};   

            {(pageNumber === 44) && (
                <Page_44
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
                                left-0 right-0 bg-gray-800 overflow-auto">

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
                                                mt-2 ml-16"
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
//
function Page_2(params) {    
    return (        
        <div>                         
            <TopNav title="" userName="" userRole=""/>

            <div className="flex flex-col">
                <div className="flex flex-row absolute top-24 bottom-0
                                items-center justify-center
                                left-0 right-0 bg-gray-800 overflow-auto">

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
                             onClick={() => params.navigate("/SignIn")}
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
                                left-0 right-0 bg-gray-800 overflow-auto">

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
                                                mt-2 ml-8"
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
                                left-0 right-0 bg-gray-800 overflow-auto">
                    <div className="flex flex-col">
                        <p className="ml-5 mr-5 text-white text-3xl text-center font-bold">
                            What the strong people have to say !                  
                        </p>
                        <br></br>

                        <div className="flex flex-row ml-20">
                            <div className="mr-10" >
                                <img className="rounded"
                                    src={E1_TN_image}
                                    alt="/"
                                    draggable={false}                            
                                    width={175}
                                    onClick={() => {params.setPageNumber(41)}}>                                    
                                </img>                                

                                <p className="text-center text-white text-sm font-bold">
                                    Peter Guliver        
                                </p> 
                            </div>   

                            <div>
                                <img className="rounded"
                                     src={E2_TN_image}
                                     alt="/"
                                     draggable={false}                            
                                     width={173}
                                     onClick={() => {params.setPageNumber(42)}}>  
                                </img>                                     

                                <p className="text-center text-white text-sm font-bold">
                                    Morgan Nicolsen     
                                </p> 
                            </div>    
                        </div>

                        <br></br>

                        <div className="flex flex-row ml-20">
                            <div className="mr-10" >
                                <img className="rounded"
                                     src={E3_TN_image}
                                     alt="/"
                                     draggable={false}                            
                                     width={175}
                                     onClick={() => {params.setPageNumber(43)}}>  
                                </img>  

                                <p className="text-center text-white text-sm font-bold"
                                   onClick={() => {params.setPageNumber(43)}}>  
                                    Naomi Page 
                                </p> 
                            </div>   

                            <div>
                                <img className="rounded"
                                     src={E4_TN_image}
                                     alt="/"
                                     draggable={false}                            
                                     width={175}
                                     onClick={() => {params.setPageNumber(44)}}>  
                                </img>  

                                <p className="text-center text-white text-sm font-bold"
                                   onClick={() => {params.setPageNumber(44)}}>
                                    Barry Dowdeswell
                                </p> 
                            </div>    
                        </div>

                        <div className="flex flex-row ml-16">
                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="Back"
                                    style={{ width: "100px"}}
                                    onClick={() => {params.setPageNumber(3);}}>                                 
                                &lt; Back
                            </button>

                            <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                                mt-2 ml-5"
                                    id="Free"
                                    style={{ width: "140px"}}>                                                                       
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

//
// page_41
// =======
// This is the endorsement from Peter Guliver.  
//
function Page_41(params) {    
    return ( 
        <div>                         
            <TopNav title="" userName="" userRole=""/>       

            <div className="flex flex-col absolute top-24 bottom-0
                            items-center justify-center
                            left-0 right-0 bg-gray-800 overflow-auto">
                                    
                <div className="flex flex-col">
                    <div className="flex flex-col box-border border-2 rounded-lg bg-cyan-600
                            ml-20 mr-20 h-auto w-auto">
                        <div> 
                            <br></br>       
                            <p className="ml-5 mr-5 text-white text-1xl font-bold">
                                I have worked with Luke over the past 5 years, both in person
                                and virtually. Over this time we have done regular mobility and
                                stretching sessions and a weights program focussed on building strength.
                                <br></br><br></br>

                                Luke is an outstanding trainer and coach. He is extremely knowledgeable, proactive, reliable, and
                                just an all-round great guy. I couldn't recommend him more highly.   
                                <br></br><br></br>

                                Since we've been working together, I've been hitting PBs for squats and deadlifts in the
                                gym and the mobility has eliminated those annoying niggles you get with age !
                                <br></br><br></br>
                            </p>
                        </div>

                        <div className="flex flex-row">
                            <div className="ml-6" >
                                <img className="rounded"
                                    src={E1_image}
                                    alt="/"
                                    draggable={false}                            
                                    width={100}
                                />  
                            </div> 

                            <div className="ml-6 mt-3">  
                                <p className="ml-0 text-white text-2xl font-bold">
                                    Peter Guliver   
                                </p>                                
                                <p className="ml-0 text-white text-sm font-bold">
                                    Partner and Chief Operating Officer   
                                </p> 
                                <p className="ml-0 mb-10 text-white text-sm">
                                    Deloitte
                                </p> 
                            </div>
                        </div>  
                    </div>
                </div>

                <br></br>

                <div> 
                    <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        before:mt-2 ml-5"
                            id="Back"
                            style={{ width: "100px"}}
                            onClick={() => {params.setPageNumber(4);}}>                                 
                        &lt; Back
                    </button>
                </div>    
            </div>                                    
        </div>    
    );
}         

//
// page_42
// =======
// This is the endorsement from Morgan Nicolsen.
//
function Page_42(params) {    
    return ( 
        <div>                         
            <TopNav title="" userName="" userRole=""/>       

            <div className="flex flex-col absolute top-24 bottom-0
                            items-center justify-center
                            left-0 right-0 bg-gray-800 overflow-auto">
                                    
                <div className="flex flex-col">
                    <div className="flex flex-col box-border border-2 rounded-lg bg-cyan-600
                            ml-20 mr-20 h-auto w-auto overflow-y: scroll">
                        <div> 
                            <br></br>       
                            <p className="ml-5 mr-5 text-white text-1xl font-bold">
                                Luke's approach to personal training is just that - personalised. Luke
                                is extremely adept at getting to know a client, their experiences, expectations,
                                and insecurities, building an approach to training that suits THEM, not a generic
                                approach plus-or-minus a few details. As a client of Luke's, I always felt supported, 
                                acknowledged, and considered when it came to my sessions, goals, and needs. Luke is 
                                highly knowledgeable not just on the fundamental movements he trains in, but also their 
                                fundamental purpose and connection with other components of body mechanics.
                                <br></br><br></br>

                                In every session, I learned so much from Luke about how to adapt lifting techniques to 
                                suit my own body's unique movement capabilities or restrictions, and what was happening
                                in my body in those movements, which really piqued and held my interest in working with
                                a trainer. One of Luke's strengths lies in his ability to present an encouraging and 
                                non-judgemental environment for his clients. This is especially helpful for those 
                                identifying as female - thanks to the added social complexity around fitness [and 
                                therefore aesthetics] for women - and non-binary/trans etc.
                                <br></br><br></br>

                                I always truely enjoyed my sessions with Luke, thanks to his knowledge and his great
                                sense of humour. Within three to four months, I noticed really facinating progress in
                                my techniques and mobility, with movements I've been doing for years, and have found
                                myself remembering Luke's adviceand specific tips long after the fact. This the 
                                hallmark of a great trainer - if you remember specific things THEY have told when
                                you're standing at the squat rack, and not just "lift the heavy thing", they've done
                                a great job.     
                                <br></br><br></br>

                                I would heartily reccomend Luke's services to anyone looking to pick up a training 
                                regime - no matter how advanced or new to strength training. Especially for anyone
                                new to training, Luke is greatly placed to help you understand why a movement is 
                                important in a training plan, and hoow to maximise the time with it. As someone who 
                                lifting for years, I found Luke had a real knack for cueing me in the tiniest of ways
                                to make the most impactful changes in my movements - it really was an excellent 
                                learning experience in each and every session. Not only that, but Luke helped me to 
                                identify what I loved about strength training, and encouraged and trained me to 
                                participate in my first lifting competition, which I know will absolutely not be my
                                last. I hope to work with Luke again one day, where I'll finally nail that pull-up ! 
                                <br></br><br></br> 
                            </p>
                        </div>

                        <div className="flex flex-row">
                            <div className="ml-6" >
                                <img className="rounded"
                                    src={E2_image}
                                    alt="/"
                                    draggable={false}                            
                                    width={100}
                                />  
                            </div> 

                            <div className="ml-6 mt-3">  
                                <p className="ml-0 text-white text-2xl font-bold">
                                    Morgan Nicolsen 
                                </p>                                                        
                                <p className="ml-0 text-white text-sm font-bold">
                                    Practice Manager, Technical Analyst - Services  
                                </p> 
                                <p className="ml-0 mb-10 text-white text-sm">
                                    The University of Auckland
                                </p>                             
                            </div>
                        </div>  
                    </div>
                </div>
                <br></br>

                <div> 
                    <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        before:mt-2 ml-5"
                            id="Back"
                            style={{ width: "100px"}}
                            onClick={() => {params.setPageNumber(4);}}>                                 
                        &lt; Back
                    </button>
                </div>    
            </div>                                    
        </div>    
    );
} 

//
// page_43
// =======
// This is the endorsement from Naomi Page.
//
function Page_43(params) {    
    return ( 
        <div>                         
            <TopNav title="" userName="" userRole=""/>       

            <div className="flex flex-col absolute top-24 bottom-0
                            items-center justify-center
                            lleft-0 right-0 bg-gray-800 overflow-auto">
                                    
                <div className="flex flex-col">
                    <div className="flex flex-col box-border border-2 rounded-lg bg-cyan-600
                            ml-20 mr-20 h-auto w-auto">
                        <div className="overflow: auto"> 
                            <br></br>       
                            <p className="ml-5 mr-5 text-white text-1xl font-bold">
                                Luke is a brilliant coach and his knowledge and experience really shone through.
                                <br></br><br></br>

                                Having come to Luke with a significant injury, he designed a program that made it 
                                comfortable for me to continue training and that made it easy to work through the 
                                rehab process.
                                <br></br><br></br>

                                I can't express how impressed I was with programming, particulary post-surgery. He
                                got the balance spot-on, in what was managable and what I could recover from. This 
                                skill is a winning combination that not many coaches have.
                                <br></br><br></br>

                                His willingness to work with you as an athlete, compromise, and find solutions is 
                                also a big plus ! 
                                <br></br><br></br>

                                Without a doubt, Luke is one of the best coaches I've ever had. Definitely 
                                reccomend ! 
                                <br></br><br></br>
                            </p>
                        </div>

                        <div className="flex flex-row">
                            <div className="ml-6" >
                                <img className="rounded"
                                    src={E3_image}
                                    alt="/"
                                    draggable={false}                            
                                    width={100}
                                />  
                            </div> 

                            <div className="ml-6 mt-3">  
                                <p className="ml-0 text-white text-2xl font-bold">
                                    Naomi Page
                                </p>                                
                                <p className="ml-0 text-white text-sm font-bold">
                                    &nbsp;
                                </p> 
                                <p className="ml-0 mb-10 text-white text-sm">
                                    &nbsp;
                                </p> 
                            </div>
                        </div>  
                    </div>
                </div>

                <br></br>

                <div> 
                    <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        before:mt-2 ml-5"
                            id="Back"
                            style={{ width: "100px"}}
                            onClick={() => {params.setPageNumber(4);}}>                                 
                        &lt; Back
                    </button>
                </div>    
            </div>                                    
        </div>    
    );
}         

//
// page_44
// =======
// This is the endorsement from Barry Dowdeswell
//
function Page_44(params) {    
    return ( 
        <div>                         
            <TopNav title="" userName="" userRole=""/>       

            <div className="flex flex-col absolute top-24 bottom-0
                            items-center justify-center
                            lleft-0 right-0 bg-gray-800 overflow-auto">
                                    
                <div className="flex flex-col">
                    <div className="flex flex-col box-border border-2 rounded-lg bg-cyan-600
                            ml-20 mr-20 h-auto w-auto">
                        <div className="overflow: auto"> 
                            <br></br>       
                            <p className="ml-5 mr-5 text-white text-1xl font-bold">
                                Over the past eight years, Luke has coached me through a great health transition. 
                                We have worked together, both in the gym and remotely, and, during each stage, he 
                                has coached me how to become stronger.
                                <br></br><br></br>
                                
                                I now run at the pace I always wanted to and feel great. Luke helped me to understand how 
                                having someone alongside me to guide me through a customised program was exactly
                                what I needed. His positivity is infectious and I love the times we work-out together. 
                                <br></br><br></br>

                                Luke is not only a fitness coach, he also has a deep understanding of sports physiology 
                                and health science. He knows how to apply sound, up-to-date research in his programs to 
                                create a customised fitness regime that I understand. I am older, so when I had a few 
                                medical issues recently, it was great to have Luke reinforce what my doctor was reccomending
                                by tailoring my program to get me back to peak-performance. 
                                <br></br><br></br>
                                
                                Even more, he has taught me how to understand both the why and the how of each exercise 
                                so I can follow each block schedule on my own when I am training alone, early in the morning,
                                at my local gym. He has helped me to support my busy teaching and research schedule by becoming
                                strong; that makes all the difference.
                                <br></br><br></br>
                            </p>
                        </div>

                        <div className="flex flex-row">
                            <div className="ml-6" >
                                <img className="rounded"
                                    src={E4_image}
                                    alt="/"
                                    draggable={false}                            
                                    width={100}
                                />  
                            </div> 

                            <div className="ml-6 mt-3">  
                                <p className="ml-0 text-white text-2xl font-bold">
                                    Dr Barry Dowdeswell   
                                </p>                                
                                <p className="ml-0 text-white text-sm font-bold">
                                    Researcher and Senior Lecturer in Software Engineering   
                                </p> 
                                <p className="ml-0 mb-10 text-white text-sm">
                                    Otago Polytechnic Auckland International Campus
                                </p> 
                            </div>
                        </div>  
                    </div>
                </div>

                <br></br>

                <div> 
                    <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        before:mt-2 ml-5"
                            id="Back"
                            style={{ width: "100px"}}
                            onClick={() => {params.setPageNumber(4);}}>                                 
                        &lt; Back
                    </button>
                </div>    
            </div>                                    
        </div>    
    );
}         

export default More
