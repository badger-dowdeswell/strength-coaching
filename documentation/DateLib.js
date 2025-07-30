//
// DATE LIBRARY
// ============
// A library of general-purpose date processing functions common to
// many of the React pages. Refer to the unicode standard for date
// symbols here:
// https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
//
// Revision History
// ================
// 23.10.2022 BRD Original version.
// 23-10-2022 BRD Added the ability to define null dates for fields
//                processed by encodeISOdate() and decodeISOdate().
// 23.10.2022 BRD Migrating all date functions to use the date-fns
//                react library https://date-fns.org/
//
import { differenceInYears, format, isLeapYear } from "date-fns";

const CUTOFF_DATE = "01011800" // Used to encode blank dates.
const CUTOFF_MIN_YEAR = 1870;  // Used to validate years against a basline.

//
// formatDate()
// ============
export function formatDate(dateFormat, dateValue) {
    var formattedDate = "";
    switch (dateFormat) {
        case "DD MMMM YYYY":
            if (dateValue === "") {
              formattedDate = "";
            } else {
                try {
                    formattedDate = format(new Date(dateValue.substr(4,4), (dateValue.substr(2,2) - 1), dateValue.substr(0,2)),
                                        "do MMMM yyyy");
                } catch {
                    // date is invalid
                }
            }
            break;

        default:
            break;
    }
    // console.log("formatDate() : " + dateValue + " " + formattedDate);
    return formattedDate;
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
// ageCalc()
// =========
// Given a data of birth, the function returns their age in
// complete years.
//
export function ageCalc(birthDate) {
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
// Hence using that library function is not reccomended.
//
export function validateDate(dateFormat, dateValue) {
    var isValid = false;
    switch (dateFormat) {
        case "DDMMYYYY":
            var dateString = cleanUpDate(dateValue);
            //console.log("validateDate() dataString = [" + dateString + "]");
            var year = Number(dateString.slice(4,8));
            var month = Number(dateString.slice(2,4));
            var day = Number(dateString.slice(0,2));
            console.log("validateDate() : [" + dateString + "] " + day + " " + month + " " + year + " " + isLeapYear(new Date(year, 1, 1)));
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
            // Unsupported date format.
            isValid = false;
            break;
    }
    console.log("validateDate() " + isValid);
    return isValid;
}
//
// cleanUpDate()
// =============
// Cleans up formatting characters in the date so that it can be
// validated.
//
export function cleanUpDate(dateString) {
    var dateTemp = dateString.split(" ").join("");
    dateTemp = dateTemp.split("/").join("");
    dateTemp = dateTemp.split("-").join("");
    dateTemp = dateTemp.split(".").join("");
    return dateTemp;
}
