//
// UTILITY LIBRARY
// ===============
// A library of general-purpose utility routines that can be called by other
// components.
//
// Revision History
// ================
// 05.08.2025 BRD Original version.
// 14.01.2026 BRD Added the stringToArray() and the validKey() functions to this
//                library.
//
// validateEmail()
// ===============
// Verifies that the email address is valid. This regular expression checks
// the most important criteria of the email standard RFC 5322.
//
export function validateEmail(emailAddress) {
    if (!/\S+@\S+\.\S+/.test(emailAddress)) {
        return false;
    } else {
        return true;
    }
}

//
// stringToArray()
// ===============
// Converts a delimited string, perhaps with unwanted extra spaces in it, into
// an array.

// For example, this string from a multi-line text input box is delimited with
// new line characters, including a blank entry padded with extra spaces as well
// as a true blank entry:
//
//     640\n78\n\909\n     \n34.5\n\n56\n
//
// stringToArray(source, "\n") will convert this to a new array containing only
// five entries which it returns.
//
//     640 78 909 34.5 56
//
// Note the use of the toString() function to convert the source parameter type
// to be string. If variables contains just digits, their its implied type is
// numeric. The causes the string functions like includes() and split() to throw
// an error. Casting the variable to a string with toString() prevents this.
//
// If there is no data to pack into the array, an empty array will be returned.
// Refer to MyBlockSchedule() for more examples of how this function is used.
//
export function stringToArray(source, delimiter) {
    var returnArray = [];
    if (source == "") {
        // there is no data to pack into the array.
    } else if (source.toString().includes(delimiter)) {
        // there is at least one delimiter in the source, implying that there
        // is at least one potential array entry. Note that split() fails if
        // there if no delimiter is found.
        var newArray = source.toString().split(delimiter);
        for (var ptr = 0; ptr < newArray.length; ptr++) {
            if (newArray[ptr].trim() !== "") {
                // The array entry is not blank so save it.
                returnArray.push(newArray[ptr].trim());
            }
        }
    } else {
        // There is just one entry in the string, with no delimiter.
        returnArray.push(source.toString().trim());
    }
    return returnArray;
}

//
// validKey()
// ==========
// This function is used to verify the characters entered while editing lists of numbers
// such as MyWeights or Reps in MyBlockSchedule() in the section Page_Exercise(). It checks
// for valid numeric and editing keys, including decimal points, while rejecting letters
// and other punctuation. However spaces are allowed that will be filtered out later by
// the stringToArray function.
//
export function validKey(event, decimalAllowed) {
    var valid = true;

    switch (event.key) {
        case " ":
        case "Enter":
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown":
        case "Backspace":
        case "Delete":
            // these are valid keys.
            break;

        case ".":
            if (!decimalAllowed) {
                valid = false;
            }
            break;

        default:
            if (event.key < "0" || event.key > "9") {
                // this is a non-numeric key and not one of the other exceptions.
                valid = false;
            }
    }
    return valid;
}

     
