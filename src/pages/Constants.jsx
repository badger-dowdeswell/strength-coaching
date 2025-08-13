//
// CONSTANTS
// =========
// Library of constants used by Strength Research Online.
//
// Revision History
// ================
// 14.01.2025 BRD Original version adapted from Dancesport for
//                Strength Research.
// 30.04.2025 BRD Added constants for pages in tabbed dialogue components.
//
// Documentation
// =============
//
// Using the Editing states
// ========================
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

import { IDLE_BLOCKER } from "react-router-dom"

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
    VALIDATING: 15,  
    VALIDATING_STAGE_1: 16,
    VALIDATING_STAGE_2: 17,  
    VALIDATING_STAGE_3: 18,
    REGISTER: 25,
    ERROR: 500
}

export const uploadStates = {
    IDLE: 0,
    UPLOADING: 1,
    UPLOADED: 2,
    ERROR: 3
}

//
// pages
// =====
// Predefined constants for numbering pages in tabbed dialogue components.
//
export const pages = {
    PAGE_1: 1,
    PAGE_2: 2,
    PAGE_3: 3,
    PAGE_4: 4
}    

//
// dialogs
// =======
// Used to define actions to be performed by a modal dialog
// and the responses from the user.
//
// RA_Badger - Possibly redundant??
//
export const dialogs = {
    UNDEFINED: 0,
    NO: 1,
    YES: 2,
    SHOW_DIALOG: 3,
    HIDE_DIALOG: 4
}
