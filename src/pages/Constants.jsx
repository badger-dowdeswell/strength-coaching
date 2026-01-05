//
// CONSTANTS
// =========
// Library of constants used by Strength Coaching Online.
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
// These enumerated constants are used to track the state of a record update or a
// process during maintenance or data entry. They are the discrete values used by
// the state machine implemented via a useState hook. The example below shows the
// way the state variable is configured initially for a typical React page:
//
// const [state, setState] = useState(states.SELECTING);
//
// The state change actions are then typically managed by a useEffect hook:
//
// useEffect(() => {
//    switch (state) {
//        case states.LOADING:
//           ... perform appropriate action code;
//           break;
//
//        case states.EDITING:
//           ... different action code;
//           break;
//
export const states = {
    UNDEFINED: 0,
    IDLE: 1,
    SELECTING: 2,
    GET_CLIENT: 3,
    LOADED_CLIENT: 4,
    LOADING: 5,
    LOADED: 6,
    UPLOADING: 7,
    UPLOADED: 8,
    NOT_FOUND: 9,
    EXITING: 12,

    NOT_AUTHENTICATED: 15,
    AUTHENTICATING: 16,
    AUTHENTICATED: 17,
    
    ADDING: 20,
    EDITING: 21,
    CANCELLING: 22,
    UPDATING: 23,
    DELETING: 24,

    EMAILING:25,

    FORGOT_PASSWORD: 26,
    CHANGING_PASSWORD: 27,            
    VALIDATING: 28,  
    VALIDATING_STAGE_1: 29,
    VALIDATING_STAGE_2: 30,  
    VALIDATING_STAGE_3: 31, 
    VALIDATING_STAGE_4: 32,

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
// Predefined constants for numbering pages in tabbed dialogue components
// or nested multi-page environments like MyBlockSchedule. The constants
// PAGE_DAY and PAGE_EXERCICE are just more expressive versions that make
// more sense in the context of the MyBlockSchedule page control.
//
export const pages = {
    UNDEFINED: 0,
    PAGE_1: 1,
    PAGE_DAY: 1,
    PAGE_2: 2,
    PAGE_EXERCISE: 2,
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
