//
// getBaseURL()
// ============
// Returns the base Uniform Resource Locator (URL) that a particular front end needs for accessing
// the back-end Express routes.
//
// Revision History
// ================
// 16.03.2023 BRD Original version. This was moved out of the UtilLib since it gets customised for
//                each app. Hence, it should not be in the general-purpose utility library.
//
export function getBaseURL() {
    const baseURL = process.env.NODE_ENV === 'production' ? "api/": "http://localhost:3010/api/";  
    return baseURL;
}
