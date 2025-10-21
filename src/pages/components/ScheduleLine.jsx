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
    if (params.activeWeek === params.week) {
        return (
            <div>
                <p className="text-white">sequence {params.seq_ID} {params.exercise_name} </p>            
            </div>
        )
    } else {
        return null;
    }    
};

export default ScheduleLine;