//
// ScheduleLine
// ============
// This component is able to receive one line as an object from a block schedule
// array and display it. It also allows the client to modify the fields they use
// to report their training progress on the specified exercise.
//
// The component processes and formats the schedule one line at a time. If the
// data does not belong to the specified week, a null element is returned so that
// line is not displayed on the wrong week.
//
// Revision History
// ================
// 30.07.2025 BRD Original version.
//  
function ScheduleLine(params) {  
    var headerText = "";  
    if (params.activeWeek === params.week) {
        if (params.PrevDay !== params.day) {
            //params.setPrevDay(params.day);
            headerText = "DAY " + params.day;
        }

        return (
            <div>
                {(headerText) && (                    
                    <div>
                        <div className="flex flex.row">
                            <p className="text-white text-base border mb-0 mt-0 ml-2 w-40">
                               DAY {params.day} 
                            </p>
                        </div>
                    </div>
                )};     

                <div className="flex flex.row">
                    <p className="text-white text-base border mb-0 mt-0 ml-2 w-40">
                        {params.exercise_name} 
                    </p>
                    <div className="flex flex.col">
                        <p className="text-white text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.sets} 
                        </p>
                        <p className="text-white text-base text-center border mb-0 mt-0 ml-0 w-10">
                            {params.actual_sets} 
                        </p>
                    </div>    


                
                </div>           
            </div>
        )
    } else {
        return null;
    }    
};
export default ScheduleLine;