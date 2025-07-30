//
// BACK-END UTILITY LIBRARY
// ========================
// This is a library of general-purpose utilities common to
// many of the back-end database functions.
//
// Revision History
// ================
// 19.09.2022 1.0 BRD Original version.
//
// encodeISOdate()
// ===============
export function encodeISOdate(dateValue) {
    let ISOdateValue = dateValue.substr(6,4) + "-" + dateValue.substr(3,2) + "-" +
                       dateValue.substr(0,2) + "T00:00:000Z";
    return ISOdateValue;
}
