//
// STRENGTH COACHING ONLINE
// ========================
// Strength Coaching Online provides interactive personal fitness and strength
// training to clients. This web application helps them manage their training 
// programs and track their progress.
//
// The front-end web application is written in React 19 using Tailwind CSS,
// managed by the Vite framework. The back-end is written in JavaScript
// using Node.js. Both the web and the mobile version share the same backend.
// It provides a set of custom APIs to control access to the main Strength
// Research Online database. This provides secure storage to the client 
// profiles and training schedules. It uses the PostgrSQL relational database
// and implements strong authentication and security to manage client 
// interaction and data exchange.
//
// A complementary mobile application, written in React Native, shares the
// same back-end so clients can access the same functionality from all their   
// devices.
//
// Revision History
// ================
// 09.01.2025 BRD Original version.
// 10.01.2025 BRD Re-wrote the router code so everything launches
//                from this single StrengthCoaching file.
// 30.09.2025 BRD Official release of version 1.5. This contains all the
//                minimal Phase 1 back-end functionality.
//
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Route, Routes } from "react-router-dom";

// An object for each page is declared here to use in
// the individual routes
import Landing from './pages/Landing';
import SignIn from "./pages/SignIn";
import ResetPassword from "./pages/ResetPassword";
import Registration from "./pages/Registration";
import More from "./pages/More";
import Home from "./pages/Home";
import Today from "./pages/Today";
import MyBlockSchedule from "./pages/MyBlockSchedule";
import MyProgress from "./pages/MyProgress";
import MyMessages from "./pages/MyMessages";
import EditMyProfile from "./pages/EditMyProfile";

const version = 1.5;
//
// Router
// ======
// This controls the routing for all pages.The code in index.html
// calls this router component directly which simplifies the
// structure significantly.
//
// <Route path="/Today" element={<Today />} /> RA_BRD
// <Route path="/MyProgress" element={<MyProgress />} />
// <Route path="/MyMessages" element={<MyMessages />} />
// <Route path="/More" element={<More />} />
//
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />   
                <Route path="/More" element={<More />} />         
                <Route path="/SignIn" element={<SignIn />} />
                <Route path="/ResetPassword" element={<ResetPassword />} /> 
                <Route path="/Registration" element={<Registration />} />                
                <Route path="/Home" element={<Home />} />                
                <Route path="/MyBlockSchedule" element={<MyBlockSchedule />} />  
                <Route path="/EditMyProfile" element={<EditMyProfile />} />            
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
