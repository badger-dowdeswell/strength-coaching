//
// ScheduleLine
// ============
// This component is able to receive one line as an object from a block schecule
// array and display it. It also allowed the client to modify the fields they use
// to report their training progress on the specified exercise.
//
// Revision History
// ================
// 30.07.2025 BRD Original version.
//  
function ScheduleLine(params) {
    console.log("seq_ID " + params.seq_ID);
    return (
        <div>
            <p className="text-white">sequence</p>
            <p className="text-white">{params.seq_ID}</p>
            <p className="text-white">{params.exercise_name}</p>
        </div>
    )
};

export default ScheduleLine;