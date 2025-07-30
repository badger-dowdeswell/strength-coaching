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

function TopNav(params) { 
   var userID = sessionStorage.getItem("userID");  
   let userName = sessionStorage.getItem("FirstName") + " " + sessionStorage.getItem("LastName");  
   var userImage = "./userImages/" + userID + ".png";
   var userRole = ""; 

   switch (sessionStorage.getItem("UserAuthority")) {
   case "A":
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
                      top-0 left-[247px] m-0 
                      bg-gray-900 text-white">

         <div className="absolute left-5 top-11 w-auto 
                         text-white font-bold text-xl">
            <p>{params.title}</p>
         </div>

         <div className="absolute top-0 right-64
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
                           currentTarget.src="./userImages/template.png";
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