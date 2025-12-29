//
// UTILITY LIBRARY
// ===============
// A library of general-purpose utility routines that can be called by other
// components.
//
// Documentation
// =============
//
// Revision History
// ================
// 05.08.2025 BRD Original version.
//
//
// validateEmail()
// ===============
// Verifies that the email address is valid. This regular expression
// checks the most important criteria of the email standard RFC 5322.
//
export function validateEmail(emailAddress) {
    if (!/\S+@\S+\.\S+/.test(emailAddress)) {
        return false;
    } else {
        return true;
    }
}
     