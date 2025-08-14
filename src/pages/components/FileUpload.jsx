//
// FILE UPLOAD
// ===========
// This is a general-purpose React component that allows resources such as pictures, videos, or
// other specified file types. 
//
// Documentation
// =============
// Resources are contextual: you would not upload a Word document to be your picture in you
// Strength Coaching Online user profile. That is why this component allows you to specify
// which file types are acceptable in each situation. The component parameters used are:
//
// The code used in this component was adapted from the example available in the Cosden tutorial
// available here: https://www.youtube.com/watch?v=pWd6Enu2Pjs
//
// The parameters that must be supplied to the component are: 
//
//
// Revision History
// ================
// 13.08.2025 BRD Original version.
//
import {useState} from "react";
import {uploadStates} from "../Constants";

import { getBaseURL } from "../getBaseURL";
const baseURL = getBaseURL();
import Axios from 'axios';
const axios = Axios;

//
// FileUpload()
// ============
export default function FileUpload(params) {
    const [file, setFile] = useState(null);
    const [uploadState, setUploadState] = useState(uploadStates.IDLE);
    console.log("JWT " + params.JWT);

    //
    // handleFileChange()
    // ==================
    function handleFileChange(e) {
        if (e.target.files) {
            setFile(e.target.files[0]); 
        }
    }

    //
    // handleFileUpload()
    // ==================
    // This makes an asynchronous call to the back-end function that can receive
    // a file resource and save it to the appropriate directory on the server.
    //
    async function handleFileUpload(JWT) {
        if (!file) {
            // No file was selected so do not attempt the upload.
            return;
        } else {
            console.log("\nposting...")
            setUploadState(uploadStates.UPLOADING);
            const formData = new FormData();
            formData.append('file', file);
            
            axios.put(baseURL + "uploadFile?JWT=" + JWT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                setUploadState(uploadStates.UPLOADED);        
            })                
            .catch(err => {
                setUploadState(uploadStates.ERROR); 
            })
        }
    }

    return (
        <div className="space-y-4">            
            <input className="ml-14"                
                   type="file" 
                   file-selector                         
                   onChange={handleFileChange}
            />

            {file && uploadState != uploadStates.UPLOADING &&
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
                                        mt-2 ml-5"
                        id="Upload"
                        style={{ width: "100px" }}
                        onClick={handleFileUpload(params.JWT)}>                    
                    Upload
                </button>
            }

            {uploadState === uploadStates.UPLOADED && (
                <p className="mt-2 text-sm text-cyan-600">
                    Image was uploaded successfully.
                </p>
            )}

            {uploadState === uploadStates.ERROR && (
                <p className="mt-2 text-sm text-cyan-600">
                    Image could not be uploaded. Please try again.
                </p>
            )}            

            {file && (
                <div className="mb-4 ml-14 text-white text-sm">
                    <p>File name: {file.name}</p>
                    <p>File size: {(file.size / 1024).toFixed(2)} KB</p>
                    <p>File type: {file.type}</p>
                </div>  
            )}
        </div>
    );
}