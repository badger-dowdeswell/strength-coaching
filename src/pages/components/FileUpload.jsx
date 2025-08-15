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
// https://www.youtube.com/watch?v=3R05wQXAdkY ????
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
    const [uploadState, setUploadState] = useState(uploadStates.IDLE); 

    const [files, setFiles] = useState([]);
    const changeFiles = (e) => {
        setFiles(e.target.files);
    };

    //
    // selectFile
    // ==========
    // This creates a form object to save the file properties of the 
    // selected file so that it can be uploaded to the server via an
    // api call to the back end.
    //
    // RA_BRD Need to send in a parameter to ensure that only valid
    // images can be uploaded to the server. This is an important
    // security consideration.
    //
    async function selectFile(e) {
        if (e.target.files) {
            setFile(e.target.files[0]);             
            console.log("\nUploading...")
            const formData = new FormData();
            formData.append('image', e.target.files);
            setUploadState(uploadStates.UPLOADING);
            // uploadFile(params.JWT, formData);
        }
    }

    //
    // uploadFile()
    // ============
    const uploadFile = async (JWT, formData) => { 
        await axios.post(baseURL + "uploadFile?JWT=" + JWT, formData, {                                 
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then((response) => {
            console.log("response ", response.data);
            setUploadState(uploadStates.UPLOADED);             
        })                
        .catch(err => {
            setUploadState(uploadStates.ERROR);            
        })
    }

    const uploadFiles = (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const file of files) {
            formData.append("photos", file);
        }
        uploadFile(params.JWT, formData);

        //console.log("uploadFiles: ", files);

    }

    return (
        <div className="space-y-4"> 
            <form onSubmit={uploadFiles}>        
                <input className="ml-14"
                        id="SelectImage"                
                        type="file" multiple 
                        onChange={changeFiles}
                /> 

                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded"                                
                    type = "submit"
                    onChange={(e) => {selectFile(e)}}
                    >
                    Upload files    
                </button> 
            </form>               

            {files[0] && (
                <div className="mb-4 ml-14 text-white text-sm">
                    <p>File name: {files[0].name}</p>
                    <p>File size: {(files[0].size / 1024).toFixed(2)} KB</p>
                    <p>File type: {files[0].type}</p>
                </div>  
            )}

            {uploadState === uploadStates.UPLOADED && ( 
                <p className="mt-2 text-sm text-cyan-600">
                     Image was uploaded successfully.
                </p>
            )}

            {uploadState === uploadStates.ERROR && ( 
                <p className="mt-2 text-sm text-cyan-600">
                     Whoops - image was not uploaded successfully.
                </p>
            )}    
        </div>
    );
}

// {file && uploadState !== uploadStates.UPLOADING &&
//                 <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded
//                                         mt-2 ml-5"
//                         id="Upload"
//                         style={{ width: "100px" }}
//                         onClick={handleFileUpload(params.JWT)}>                    
//                     Upload
//                 </button>
//             }

//             {uploadState === uploadStates.UPLOADED && (
//                 <p className="mt-2 text-sm text-cyan-600">
//                     Image was uploaded successfully.
//                 </p>
//             )}

//             {uploadState === uploadStates.ERROR && (
//                 <p className="mt-2 text-sm text-cyan-600">
//                     Image could not be uploaded. Please try again.
//                 </p>
//             )}      

//
    // handleFileChange()
    // ==================
    //function handleFileChange(e) {
    //    if (e.target.files) {
    //        setFile(e.target.files[0]); 
    //        setUploadState(uploadStates.IDLE);
    //    }
    //}