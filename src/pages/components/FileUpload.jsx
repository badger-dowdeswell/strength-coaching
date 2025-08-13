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


export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [uploadState, setUploadState] = useState(uploadStates.IDLE);

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
    async function handleFileUpload() {
        if (!file) {
            // No file was selected so do not attempt the upload.
            return;
        } else {
            setUploadState(uploadStates.UPLOADING);
            const formDate = new FormData();
            FormData.append('file', file);

            try {
                // 14:22

            } catch {

            }
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
                        style={{ width: "100px" }}>                    
                    Upload
                </button>
            }

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