//
// UTILITY LIBRARY
// ===============
// This is a library of general-purpose utilities common to
// many of the React pages.
//
// Revision History
// ================
// 06.09.2022 BRD Original version.
// 03.03.2023 BRD Changed the listener port for the back-end to be 3005 so that
//                it does not conflict with other back-ends on the same server.
// 16.03.2023 BRD Moved getBaseURL() to its own component file. Since the function
//                has to be customised for each app, it should not have been placed
//                in a general-purpose library.
//                Added the minMax() function to validate the range of numeric input
//                fields.

//
// minMax()
// ========
// This function returns either the minimum or maximum limit value if the value passed in
// is outside of the range on either side. It can be used in React numeric input text input
// elements like this:
//
//       onChange = {e => setSomeValue(minMax(0, 100, e.target.value))}
//
// Note that there is currently a documented "bug" in React and the DOM generally. Since leading
// zeros do not change the true value of a number, a text input field that originally contained
// 0 will often show 04 after you enter 4 rather than the actual value of the field, which after
// calling this function is 4. This results in the text input field not refreshing since the
// useState() does not think it needs to update the display. Refer to the discussion at
// https://github.com/facebook/react/issues/9402.
//
export function minMax(minLimit, maxLimit, value) {
    return Math.max(minLimit, Math.min(maxLimit, Number(value.replace(/^0+/, ''))));
}

//
// setCombo()
// ==========
// Sets the value into the text portion of a named combo box
//
// setCombo("Salutation", Salutation) searches for the combo
// box with an id="Salutation". If found, the function then sets
// the value displayed in the linked text box by searching for the
// entry in the drop-down list and setting it as the selectedIndex.
//
export function setCombo(name, value) {
    try {
        var cBox = document.getElementById(name);
        for (var i = 0; i < cBox.options.length; i++) {
            if (cBox.options[i].value === value) {
             //   console.log(" " + i);
                cBox.selectedIndex = i;
            }
        }
    } catch (e) {
        console.log("setCombo(): DOM element " + name + " not found");
    }
};

//
// setReadOnly()
// =============
// Selects the input elements in the named section and toggles them to read-only
// or makes them editable. This is often used in maintenance forms to ensure that
// fields cannot be edited until a database record has been loaded.
//
export function setReadOnly(sectionName, state) {
    var fields = document.getElementById(sectionName).getElementsByTagName("*");
    for (var ptr = 0; ptr < fields.length; ptr++) {
        fields[ptr].readOnly = state;
    }
}

//
// disable()
// =========
export function disable(fieldName) {
    var element = document.getElementById(fieldName);
    //console.log("disable() :" + fieldName + " " + state);
    element.readOnly = true;
}

//
// enable()
// ========
export function enable(fieldName) {
    var element = document.getElementById(fieldName);
    //console.log("disable() :" + fieldName + " " + state);
    element.readOnly = false;
}
//

//
// disableOptionButton()
// =====================
export function disableOptionButton(fieldName, state) {
    var element = document.getElementById(fieldName);
    console.log("disableOptionButton() :" + fieldName )
    if (state === true) {
        element.setAttribute('disabled', true);
    } else {
        element.removeAttribute('disabled');
    }
}

//
// escQuote()
// ==========
// Replaces all the single quotes in a text field with
// the escaped version '' to stop syntax errors in SQL
// query strings.
//
export function escQuote(param) {
    return param.replace(/'/g, param);
}
