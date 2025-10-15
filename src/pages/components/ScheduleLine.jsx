//
//
//
function ScheduleLine(params) {
    console.log("seq_ID " + params.seq_ID);
    return (
        <div>
            <p className="text-white">sequence</p>
            <p className="text-white">{params.seq_ID}</p>
        </div>
    )
};

export default ScheduleLine;