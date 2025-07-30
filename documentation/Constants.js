//
// CONSTANTS
// =========
// Library of constants used by the Dancesport application.
//
// 01.09.2022 BRD Original version
// 30.05.2023 BRD Added new states that can be used during
//                sign-in, changing their password, and
//                requesting help for a forgotton password.
//
// Editing states
// ==============
// These constants are used to track the editing state of a record during maintenance.
// They are the discrete values used by the state machine implemented as a useState
// hook. The example below shows the way the editingState is configured initially
// in the React page:
//
// const [editingState, setEditingState] = useState(editingStates.SELECTING);
//
// The state change actions are then typically managed by a useEffect hook:
//
// useEffect(() => {
//    switch (editingState) {
//        case editingStates.LOADING:
//           ... action code;
//           break;
//
//        case editingStates.EDITING:
//           ... action code;
//           break;
//
export const editingStates = {
    UNDEFINED: 0,
    SELECTING: 1,
    LOADING: 2,
    NOT_FOUND: 3,
    ADDING: 4,
    EDITING: 5,
    CANCELLING: 6,
    UPDATING: 7,
    DELETING: 8,
    EXITING: 9,
    NOT_AUTHENTICATED: 10,
    AUTHENTICATING: 11,
    AUTHENTICATED: 12,
    FORGOT_PASSWORD: 13,
    CHANGING_PASSWORD: 14,
    ERROR: 500
}

//
// dialogs
// =======
// Used to define actions to be performed by a modal dialog
// and the responses from the user.
//
export const dialogs = {
    UNDEFINED: 0,
    NO: 1,
    YES: 2,
    SHOW_DIALOG: 3,
    HIDE_DIALOG: 4
}
