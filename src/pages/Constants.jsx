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
// 05.09.2025 BRD Rationalised the set of constants and gave them a shorter
//                name of "states" so that programs now use "state" rather 
//                than "editingState" or "registrationState".   
//
// DOCUMENTATION
// =============
// Using the states
// ================
// These constants are used to track the state of a record update or a process during
// during maintenance. They are the discrete values used by the state machine implemented
// as a useState hook. The example below shows the way the state variable is configured
// initially for a typical React page:
//
// const [state, setState] = useState(states.SELECTING);
//
// The state change actions are then typically managed by a useEffect hook:
//
// useEffect(() => {
//    switch (state) {
//        case states.LOADING:
//           ... action code;
//           break;
//
//        case states.EDITING:
//           ... action code;
//           break;
//
export const states = {
    UNDEFINED: 0,
    IDLE: 1,
    SELECTING: 2,
    GET_CLIENT: 3,
    LOADING: 4,
    LOADED: 5,
    UPLOADING: 6,
    UPLOADED: 7,

    NOT_AUTHENTICATED: 13,
    AUTHENTICATING: 14,
    AUTHENTICATED: 15,
    
    NOT_FOUND: 6,
    ADDING: 7,
    EDITING: 8,
    CANCELLING: 9,
    UPDATING: 10,
    DELETING: 11,
    EMAILING:22,
    FORGOT_PASSWORD: 16,
    CHANGING_PASSWORD: 17,
    EXITING: 12,
        
    VALIDATING: 18,  
    VALIDATING_STAGE_1: 19,
    VALIDATING_STAGE_2: 20,  
    VALIDATING_STAGE_3: 21, 

    PAGE_1: 100,
    VERIFY_PAGE_1: 101, 
    PAGE_2: 103,
    VERIFY_PAGE_2: 104,
    PAGE_3: 105,
    VERIFY_PAGE_3: 106,
    CREATING_USER: 107,
    CREATED_USER: 108,
    REGISTERED: 110,

    LOCK_CLIENT: 200,
    UNLOCK_CLIENT: 201,
    CLIENT_EXISTS: 202,
    CLIENT_DOES_NOT_EXIST: 203,
    CLIENT_VERIFIED: 204,
    CLIENT_NOT_VERIFIED: 205,
    GENERATE_TOKEN: 206,   

    ERROR: 500
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
    PAGE_4: 4,
    PAGE_5: 5
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

//export const uploadStates = {
//    IDLE: 0,
//    UPLOADING: 1,
//    UPLOADED: 2,
//    ERROR: 3
//}
