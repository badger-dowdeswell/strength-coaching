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
// https://www.youtube.com/watch?v=3R05wQXAdkY 
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
// https://www.youtube.com/watch?v=SMim5-ox0K4
// https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#example_using_object_urls_to_display_images
// https://www.youtube.com/watch?v=JJ0pjRotdKI
//
export default function FileUpload(params) {  
    const [uploadState, setUploadState] = useState(uploadStates.IDLE); 

    const [files, setFiles] = useState([]);
    const [preview, setPreview] = useState(null);
    const changeFiles = (e) => {
        setFiles(e.target.files);
        setPreview(URL.createObjectURL(e.target.files[0])); 
        //const objectURL =  URL.createObjectURL(files);
        //params.SetUserImage(objectURL);           
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
            setFiles(e.target.files); 
            console.log("\nUploading...")
            const formData = new FormData();
            formData.append('image', e.target.files);
            setUploadState(uploadStates.UPLOADING);
            //uploadFile(params.JWT, files[0].name, formData);
        }
    }

    

    const uploadFiles = (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const file of files) {
            formData.append("photos", file);
        }
        uploadFile(params.JWT, files[0].name, formData);
    } 
    
    //
    // uploadFile()
    // ============
    const uploadFile = async (JWT, filename, formData) => { 
        await axios.post(baseURL + "uploadFile?JWT=" + JWT, formData, {                                 
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then((response) => {
            console.log("Uploaded file. " + filename );    
            setUploadState(uploadStates.UPLOADED);             
        })                
        .catch(err => {
            console.log("uploadFile error " + err);            
            setUploadState(uploadStates.ERROR);            
        })
    }

    return (  
        <div className="space-y-4"> 
            <form onSubmit={uploadFiles}
                id="submit">                 
                <label className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded ml-12"
                       htmlFor="SelectImage"> 
                    Choose image    
                </label>       
                <input className="hidden"
                       id="SelectImage"                
                       type="file" 
                       onChange={changeFiles}                      
                /> 
                <button className="bg-cyan-600 text-white font-bold text-sm py-2 px-2 rounded ml-24"
                        id="submit"                                
                        type = "submit"
                        onChange={(e) => {selectFile(e)}}>
                    Upload files    
                </button> 
            </form>  

            {files[0] && (
                <div className="mb-4 ml-14 text-white text-sm">
                    <img className="ml-5 mb-5 mt-0"
                        src={preview}
                        alt="/"
                        draggable={false}
                        height={175}
                        width={175}
                        
                    />
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
