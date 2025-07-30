//
// DATE LIBRARY
// ============
// A library of general-purpose date processing functions common to
// many of the React pages. Refer to the unicode standard for date
// symbols here:
// https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
//
// Documentation
// =============
// This module relies on the React library date-fns found at https://date-fns.org/
// This can be installed using npm with the command: npm install date-fns --save
//
// Revision History
// ================
// 23.10.2022 BRD Original version.
// 23-10-2022 BRD Added the ability to define null dates for fields
//                processed by encodeISOdate() and decodeISOdate().
// 23.10.2022 BRD Migrating all date functions to use the date-fns
//                React library. 
// 17.03.2025 BRD Updated for use in Strength Research Online. This 
//                includes changes to the validateDate() function so
//                it works properly with the input text box format
//                supported by type="date". The formatDate() method
//                now supports more date formats.
//
import { differenceInYears, format, isLeapYear } from "date-fns";

const CUTOFF_DATE = "01011800" // Used to encode blank dates.
const CUTOFF_MIN_YEAR = 1870;  // Used to validate years against a baseline.

//
// formatDate()
// ============
// RA_Badger... these functions need to be checked and tested...
//
export function formatDate(dateFormat, dateValue) {
    var formattedDate = "";
    switch (dateFormat) {
    case "DD MMMM YYYY":
        if (dateValue !== "") {            
            try {
                formattedDate = format(new Date(dateValue.substr(4,4), (dateValue.substr(2,2) - 1), dateValue.substr(0,2)),
                                        "do MMMM yyyy");
            } catch {
                // date is invalid
            }
        }
        break;

    case "DDMMYYYY":
        if (dateValue !=="") {
            const date = new Date(dateValue).toString();
            console.log("date = " + date);
            try {
                formattedDate = date.getDay() + date.getMonth()+1 + date.getFullYear();                                           
            } catch {
                // date is invalid
            }
        }
        console.log(formattedDate);
        break;

    case "DD/MM/YYYY":
        if (dateValue !=="") {
            const date = new Date(dateValue).toString();
            console.log("date = " + date);
            try {
                formattedDate = date.getDay() + "/" + date.getMonth()+1 + "/" + date.getFullYear();                                           
            } catch {
                // date is invalid
            }
        }
        console.log(formattedDate);
        break;

    case "YYYY-MM-DD": 
        if (dateValue !=="") {
            formattedDate = dateValue.substring(4, 8) + "-" + dateValue.substring(2, 4) + "-" + dateValue.substring(0, 2);                
        }            
        break;    

    default:            
        break;
    }    
    return formattedDate;
}

//
// editFormat()
// ============
// Updates an input field with a specifed edit format within the onFocus() event
// of the element. This is typically used to reformat a date entry field from its
// friendly display format into a format that is easier to edit. 
//
export function editFormat(elementID, editValue) {    
    var field = document.getElementById(elementID);
    console.log("editFormat [" + elementID + "] [" + field.value + "]");    
    field.value = editValue;   
}

//
// decodeISOdate()
// ===============
// Unpacks an ISO date in the format YYYY-MM-DDT:HH:SS:000Z
// into a string date in the format DD-MM-YYYY.
//
export function decodeISOdate(ISOdate) {
    var date = new Date(ISOdate)
    let returnDate = ("0" + date.getDate().toString()).slice(-2) +
        ("0" + (date.getMonth() + 1).toString()).slice(-2) +
        date.getFullYear().toString();
    if (returnDate === CUTOFF_DATE) {
        // This is the agreed value for a null date.
        returnDate = "";
    }
    return returnDate;
}

//
// encodeISOdate()
// ===============
// Packs a date in the format DDMMYYYY into the ISO date
// format YYYY-MM-DDT:HH:SS:000Z. This can be used when
// sending a date to the back-end that will be written to
// an SQL table.
//
// RA_Badger. This needs to be checked and tested.
//
export function encodeISOdate(ISOdate) {
    let returnDate = "";
    console.log(ISOdate);
    if (!ISOdate.trim()) {
        // Encode the default null date.
        returnDate = "1800-01-01T00:00:000Z";
    } else {
        returnDate = ISOdate.substr(4, 4) + "-" +
            ISOdate.substr(2, 2) + "-" +
            ISOdate.substr(0, 2) + "T00:00:000Z";
    }
    return returnDate;
}

//
// CalcAge()
// =========
// Given a data of birth in the format ??????, the function returns the age of
// the person in complete years.
//
// RA_Badger. The substr() method has been deprecated. This method needs
//            to be refactored.
//
export function CalcAge(birthDate) {
    let today = new Date();
    let day = today.getDay();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();

    var calculatedAge = differenceInYears(new Date(year, month, day),
                                          new Date(birthDate.substr(4, 4),
                                          birthDate.substr(2, 2),
                                          birthDate.substr(0, 2)));
    return calculatedAge;
};

//
// validateDate()
// ==============
// This function relies on traditional tests for the legal day, month,
// and year combinations, relying on isLeapYear() from the date-fns
// library. The date-fns library function isValid() only validates dates
// that are in the correct format. It is easily fooled by missing values.
// It will also extrapolate results in incorrect dates being returned.
// Hence using that library function is not reccomended so the code
// function provided here is a more reliable alternative.
//
export function validateDate(dateFormat, dateString) {
    var isValid = false;
    switch (dateFormat) {
    case "YYYY-MM-DD":
        // This is the format returned from the input text box with type="date".  
        var year = Number(dateString.slice(0,4));
        var month = Number(dateString.slice(5,7));
        var day = Number(dateString.slice(8,10));
        console.log("validateDate() : [" + dateString + "] day = " + day + " month = " + 
                    month + " year = " + year + " Leap Year = " + 
                    isLeapYear(new Date(year, 1, 1)));

        if ((day > 0) && (year > CUTOFF_MIN_YEAR)) {
            switch (month) {
            case 2:
                if ((day === 29) && (isLeapYear(new Date(year, 1, 1)))) {
                    // That date is only valid in a leap year.
                    isValid = true;
                } else if (day < 29) {
                    isValid = true;
                }
                break;

            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                if (day < 32) {
                    isValid = true;
                }
                break;

            default:
                if (day < 31) {
                    isValid = true;
                }
                break;
            }
        }
        break;

    default:
        // The date format specified is not supported.
        isValid = false;
        break;
    }    
    return isValid;
}

//
// cleanUpDate()
// =============
// Cleans up formatting characters in a manually-entered date
// so that it can be validated.
//
export function cleanUpDate(dateString) {
    var dateTemp = dateString.split(" ").join("");
    dateTemp = dateTemp.split("/").join("");
    dateTemp = dateTemp.split("-").join("");
    dateTemp = dateTemp.split(".").join("");
    return dateTemp + " ";
}
