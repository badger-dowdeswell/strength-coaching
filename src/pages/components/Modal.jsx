//
// MODAL WRAPPER COMPONENT
// =======================
// This is a React component that is able to wrap one or more components and make them display
// modal. It illustrates how a component can make the components it wraps around operate
// with a special React characteristic called "children". This is a reserved property that  
// refers to all the content between the opening and the closing tags the Modal component 
// "wraps around." When the Modal function is called, the parameter contains custom code for
// the dialog being rendered. Hence the concept of "children". 
//
// Revision History
// ================
// 12.04.2025 BRD Original version based on Maximilian Schwarzmuller's example from his Udemy 
//                React course. This has been adapted to work with Strength Research Online's
//                code that uses Tailwind CSS instead.            
//
// Documentation
// =============
// The following example wraps the custom component ConfirmCancel that expects to receive the
// setEditingState parameter:
//
//      /*  Display the dialogue if cancelling otherwise stay hidden */}
//      <div>
//          {((params.editingState === editingStates.CANCELLING)) && (
//             <ConfirmCancel setEditingState={params.setEditingState} />
//          )}
//      </div>
//
// The custom ConfirmCancel() function component looks like this:
//
//     function ConfirmCancel(params) {
//        return (
//          <div>
//              <Modal>
//                 the required children elements go here ....
//              </Modal>
//          </div> 
//         );      
//      }
//             
function Modal({children}) {
    return (
        <div>
            <dialog open>
                {children}
            </dialog> 
        </div>
    )
}
export default Modal;