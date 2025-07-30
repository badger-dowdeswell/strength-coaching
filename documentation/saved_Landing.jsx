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
// 31.12.2024 BRD Original version based on Lukas Prehjl's
//                tutorial "Tailwind CSS Tutorial for Beginners (2024)"
//                https://www.youtube.com/watch?v=DenUCuq4G04&t=378s
//
import './App.css'
//
// Landing
// =======
function Landing() {
   return (
      <div className="bg-black">
         <div>
            <section className="m-12
                             flex
                             h-screen bg-twitter-blue
                             items-center justify-center
                             text-center text-2xl
                             p-12
                             md:p-14
                             lg:p-16
                             xl-p20">

               <p className="text-black">
                  This is the Strength Research Online
                  landing page formatted beautifully by Tailwind CSS.
               </p>

               <p className="text-blue">
                  This is another section
                  landing page formatted beautifully by Tailwind CSS.
               </p>

               <p className="text-center text-red-500">
                  Text centered
               </p>


            </section>
         </div>
      </div>
   )
}
export default Landing
