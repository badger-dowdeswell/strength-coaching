//
// MODAL DIALOGUE
// ==============
// This is a modal dialogue box designed to match the style of other Strength Coaching
// Online pages and components.
//
// https://www.youtube.com/watch?v=dEGbXY-8YtU
// https://www.youtube.com/watch?v=nwJK-jo91vA 
// 
// Revision History
// ================
// 06.04.2025 BRD Original version.
//
import "../Main.css";
//
// ModalDialogue
// =============
 export default function ModalDialogue ({open, onClose, children }) {
    console.log("\nOpening ModalDialogue\n");

    return (
        <div onClick = {onClose} className={`
            fixed inset-0 flex justify-center items-center
            transition-colors 
            ${open ? "visible bg-black/20" : "invisible"}
        `}>
            <div onClick={e => e.stopPropagation()} 
                 className={` bg-white rounded-xl shadow p-6 transition-all w-10 h-10
                 first-letter:${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}>

                <button
                    className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 bg-white
                               hover: bg-grey-50 hover:text-gray-600"
                    onClick={onClose}>
                    X    
                </button>
                {children}    
            </div>
        </div>
    );
 };
        