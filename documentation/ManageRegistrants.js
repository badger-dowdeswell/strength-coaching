//
// MANAGE REGISTRANT INFORMATION
// =============================
// This module allows administrators to select individual registrants,
// load their information from the database, and then make changes.
//
// Documentation
// =============
// For further information on the Bulma tabbed diaglog functionality,
// see The Net Ninja tutorial on tabs and the JavaScript code for them
// on YouTube at https://www.youtube.com/watch?v=G_UcEYjib58
//
// Revision History
// ================
// 01.09.2022 BRD Original version.
// 13.09.2022 BRD Extensive re-factoring after writing the
//                ManageConfiguration module.
// 31.10.2022 BRD Extensive changes to the tabbed page management
//                and switching code. This is now documented in
//                the guide "to be written..." RA_BRD.
// 03.03.2023 BRD Upgraded all data requests to provide JSON Web Tokens
//                (JWTs) during communication with the back end. This
//                addresses some outstanding issues on authentication
//                and authorisation.
// 13.03.2023 BRD Lots of small modifications from the review by
//                the Dancesport project team. These include rationalising
//                some of the data entry functionality and moving some
//                fields to more logical positions.
// 13.03.2023 BRD Added some general modal dialog functionalty from the
//                SweetAlert libraries (https://sweetalert.js.org/)
// 30.04.2023 BRD Latest updates from the team meeting 20th March.
// 06.05.2023 BRD Latest updates from the team meeting on 3rd May. This
//                refined the Pro Am and Qualified Scrutineer classifications.
//                Also includes new fields for World Dance Organisation and
//                the World Dance Council.
// 20.06.2023 BRD Corrected errors in date validation routines and related
//                data entry fields.
// 27.11.2023 BRD Added boolean Newsletter field to manage email distribution lists.
// 11.01.2024 BRD Added override notes for the Age Groups page.
// 13.02.2024 BRD Improved the naming of Styles and Wins variables to make them
//                easier to read.
// 09.06.2024 BRD Added the Override Notes feature to allow administrators to
//                explain why a registrant was allowed to dance outside their
//                Age Group. This includes full transactional support with
//                commits and automatic rollbacks.
//
import React from "react"
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import overrideImage from "./graphics/yellow_postIt_2.png";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import swal from 'sweetalert';

import Axios from 'axios';

import "bulma/css/bulma.css";
import "./Dancesport.css";

import { PageHeader } from "./PageHeader";
import { getBaseURL } from "./getBaseURL";
import { setCombo, setReadOnly, enable, disable, disableOptionButton, minMax } from './Utilities/UtilLib';
import {
   formatDate, decodeISOdate, encodeISOdate, ageCalc, validateDate,
   cleanUpDate
} from "./Utilities/DateLib";
import { Salutations, Genders, RegistrantStatuses, TeacherStatuses, UserAuthorities, Countries } from "./LookupLists";
import { editingStates } from "./Constants";

const baseURL = getBaseURL();

var GUARDIAN_REQU_AGE = 16;  //RA_BRD should this come from the Configuration file?

//
// MARK: ManageRegistrants()
// =========================
export function ManageRegistrants() {
   const axios = Axios;
   const navigate = useNavigate();
   document.addEventListener('keydown', keyListener);
   const JWT = sessionStorage.getItem('JWT');

   const [errors, setErrors] = useState([]);
   const [CalcAge, setCalcAge] = useState(0);

   const [selectionMsg, setSelectionMsg] = useState();
   // eslint-disable-next-line no-unused-vars
   const [CurrentTab, setCurrentTab] = useState();

   const [openBR, setOpenBR] = useState(false);
   const [openLA, setOpenLA] = useState(false);
   const [openNV, setOpenNV] = useState(false);
   const [openCS, setOpenCS] = useState(false);
   const [openAS, setOpenAS] = useState(false);
   const [openAR, setOpenAR] = useState(false);

   // Flags used to open the registrant search modal dialog and other dialogs to
   // perform different tasks.
   const [SearchRegistrant, setSearchRegistrant] = useState(false);
   const [SearchSupervisingProfessional, setSearchSupervisingProfessional] = useState(false);
   const [SearchGuardian, setSearchGuardian] = useState(false);
   const [AddRegistrant, setAddRegistrant] = useState(false);
   const [Cancel, setCancel] = useState(false);

   // Structure to manage the individual override notes used on the Age Groups
   // and Grading page.
   const MAX_NOTES_LENGTH = 1000;
   const [Notes, setNotes] = useState("");
   const [Title, setTitle] = useState("");
   const [OverrideNotes, setOverrideNotes] = useState(false);

   //
   // MARK: Authenticate User
   // =======================
   // Checks to see if the local storage has a UserID value set to ensure
   // that only authenticated users can access this page. Users who are not
   // authenticated are directed back to the Sign-on page.
   //
   const UserID = sessionStorage.getItem('userID');
   useEffect(() => {
      if (!UserID) {
         return navigate("/");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [UserID]);

   //
   // MARK: Define editable fields and track them
   // ===========================================
   // Defines each of the editable fields and tracks when they change
   // during editing using a useState hook. This ensures that React
   // re-renders them to update the UI properly.
   //
   const [RegistrantID, setRegistrantID] = useState("");
   const [UserAuthority, setUserAuthority] = useState("");
   const [Password, setPassword] = useState("");
   const [PasswordStatus, setPasswordStatus] = useState("N");
   const [Salutation, setSalutation] = useState("");
   const [FirstName, setFirstName] = useState("");
   const [MiddleName, setMiddleName] = useState("");
   const [LastName, setLastName] = useState("");
   const [ApproveLastName, setApproveLastName] = useState(false);
   const [ShowApproveLastName, setShowApproveLastName] = useState(false);
   const [Gender, setGender] = useState("");
   const [Pronouns, setPronouns] = useState("");

   const [PhoneNumber, setPhoneNumber] = useState("");
   const [EmailAddress, setEmailAddress] = useState("");
   const [Address1, setAddress1] = useState("");
   const [Address2, setAddress2] = useState("");
   const [Address3, setAddress3] = useState("");
   const [Suburb, setSuburb] = useState("");
   const [City, setCity] = useState("");
   const [Postcode, setPostcode] = useState("");
   const [Country, setCountry] = useState("");
   const [DateOfBirth, setDateOfBirth] = useState("");
   const [editDateOfBirth, setEditDateOfBirth] = useState("");
   const [StudioName, setStudioName] = useState("");
   const [Newsletter, setNewsletter] = useState(false);

   const [RegistrantType, setRegistrantType] = useState("");
   const [IsProAm, setIsProAm] = useState(false);
   const [IsQualifiedScrutineer, setIsQualifiedScrutineer] = useState(false);
   const [RegistrantStatus, setRegistrantStatus] = useState("");
   const [AnnualRegAmtPaid, setAnnualRegAmtPaid] = useState(0.00);
   const [AnnualRegDatePaid, setAnnualRegDatePaid] = useState("");
   const [editAnnualRegDatePaid, setEditAnnualRegDatePaid] = useState("");

   const [AmateurTeacher, setAmateurTeacher] = useState(false);
   const [TeacherStatus, setTeacherStatus] = useState("");
   const [TeacherRegAmtPaid, setTeacherRegAmtPaid] = useState(0.00);
   const [TeacherRegDatePaid, setTeacherRegDatePaid] = useState("");
   const [editTeacherRegDatePaid, setEditTeacherRegDatePaid] = useState("");
   const [TeacherApprovalDate, setTeacherApprovalDate] = useState("");
   const [editTeacherApprovalDate, setEditTeacherApprovalDate] = useState("");
   const [SupervisingProfessionalID, setSupervisingProfessionalID] = useState("");
   const [SupervisingProfessionalName, setSupervisingProfessionalName] = useState("");
   const [SupervisingProfessionalPhone, setSupervisingProfessionalPhone] = useState("");
   const [SupervisingProfessionalEmailAddress, setSupervisingProfessionalEmailAddress] = useState("");

   const [AGSubJuvenile, setAGSubJuvenile] = useState(false);
   const [AGSubJuvenileOverride, setAGSubJuvenileOverride] = useState(false);
   const [AGJuvenile, setAGJuvenile] = useState(false);
   const [AGJuvenileOverride, setAGJuvenileOverride] = useState(false);
   const [AGJunior, setAGJunior] = useState(false);
   const [AGJuniorOverride, setAGJuniorOverride] = useState(false);
   const [AGYouth, setAGYouth] = useState(false);
   const [AGYouthOverride, setAGYouthOverride] = useState(false);
   const [AGAdult, setAGAdult] = useState(false);
   const [AGAdultOverride, setAGAdultOverride] = useState(false);
   const [AGMasters1, setAGMasters1] = useState(false);
   const [AGMasters1Override, setAGMasters1Override] = useState(false);
   const [AGMasters2, setAGMasters2] = useState(false);
   const [AGMasters2Override, setAGMasters2Override] = useState(false);
   const [AGMasters3, setAGMasters3] = useState(false);
   const [AGMasters3Override, setAGMasters3Override] = useState(false);
   const [AGMasters4, setAGMasters4] = useState(false);
   const [AGMasters4Override, setAGMasters4Override] = useState(false);
   const [AGMasters5, setAGMasters5] = useState(false);
   const [AGMasters5Override, setAGMasters5Override] = useState(false);

   const [SubJuvenileNote, setSubJuvenileNote] = useState();
   const [JuvenileNote, setJuvenileNote] = useState();
   const [JuniorNote, setJuniorNote] = useState();
   const [YouthNote, setYouthNote] = useState();
   const [AdultNote, setAdultNote] = useState();
   const [Masters1Note, setMasters1Note] = useState();
   const [Masters2Note, setMasters2Note] = useState();
   const [Masters3Note, setMasters3Note] = useState();
   const [Masters4Note, setMasters4Note] = useState();
   const [Masters5Note, setMasters5Note] = useState();

   const [AG_Reg_BR_grade, setAG_Reg_BR_grade] = useState("");
   const [AG_Reg_BR_wins, setAG_Reg_BR_wins] = useState(0);
   const [AG_PA_BR_grade, setAG_PA_BR_grade] = useState("");
   const [AG_PA_BR_wins, setAG_PA_BR_wins] = useState(0);
   const [AG_SL_BR_grade, setAG_SL_BR_grade] = useState("");
   const [AG_SL_BR_wins, setAG_SL_BR_wins] = useState(0);
   const [AG_NR_BR_qwins, setAG_NR_BR_qwins] = useState("");

   const [AG_Reg_LA_grade, setAG_Reg_LA_grade] = useState("");
   const [AG_Reg_LA_wins, setAG_Reg_LA_wins] = useState(0);
   const [AG_PA_LA_grade, setAG_PA_LA_grade] = useState("");
   const [AG_PA_LA_wins, setAG_PA_LA_wins] = useState(0);
   const [AG_SL_LA_grade, setAG_SL_LA_grade] = useState("");
   const [AG_SL_LA_wins, setAG_SL_LA_wins] = useState(0);
   const [AG_NR_LA_qwins, setAG_NR_LA_qwins] = useState("");

   // RA_BRD replace these
   const [AGRegNVgrade, setAGRegNVgrade] = useState("");
   const [AGRegNVwins, setAGRegNVwins] = useState(0);
   const [AGPANVgrade, setAGPANVgrade] = useState("");
   const [AGPANVwins, setAGPANVwins] = useState(0);
   const [AGSLNVgrade, setAGSLNVgrade] = useState("");
   const [AGSLNVwins, setAGSLNVwins] = useState(0);
   const [AGNRNVqwins, setAGNRNVqwins] = useState("");

   const [AGRegCSgrade, setAGRegCSgrade] = useState("");
   const [AGRegCSwins, setAGRegCSwins] = useState(0);
   const [AGPACSgrade, setAGPACSgrade] = useState("");
   const [AGPACSwins, setAGPACSwins] = useState(0);
   const [AGSLCSgrade, setAGSLCSgrade] = useState("");
   const [AGSLCSwins, setAGSLCSwins] = useState(0);
   const [AGNRCSqwins, setAGNRCSqwins] = useState("");

   const [AGRegASgrade, setAGRegASgrade] = useState("");
   const [AGRegASwins, setAGRegASwins] = useState(0);
   const [AGPAASgrade, setAGPAASgrade] = useState("");
   const [AGPAASwins, setAGPAASwins] = useState(0);
   const [AGSLASgrade, setAGSLASgrade] = useState("");
   const [AGSLASwins, setAGSLASwins] = useState(0);
   const [AGNRASqwins, setAGNRASqwins] = useState("");

   const [AGRegARgrade, setAGRegARgrade] = useState("");
   const [AGRegARwins, setAGRegARwins] = useState(0);
   const [AGPAARgrade, setAGPAARgrade] = useState("");
   const [AGPAARwins, setAGPAARwins] = useState(0);
   const [AGSLARgrade, setAGSLARgrade] = useState("");
   const [AGSLARwins, setAGSLARwins] = useState(0);
   const [AGNRARqwins, setAGNRARqwins] = useState("");

   // Professional details
   const [NZQualifiedProfessional, setNZQualifiedProfessional] = useState(false);
   const [NZQualifierScrutineer, setNZQualifierScrutineer] = useState(false);
   const [IntQualifiedProfessional, setIntQualifiedProfessional] = useState(false);
   const [IntQualifiedScrutineer, setIntQualifiedScrutineer] = useState(false);
   const [IntCountryQualified, setIntCountryQualified] = useState("");

   const [WDCdancer, setWDCdancer] = useState(false);
   const [WDCadjudicator, setWDCadjudicator] = useState(false);
   const [WDCchairperson, setWDCchairperson] = useState(false);

   const [WDOdancer, setWDOdancer] = useState(false);
   const [WDOadjudicator, setWDOadjudicator] = useState(false);
   const [WDOchairperson, setWDOchairperson] = useState(false);

   const [PSLBR, setPSLBR] = useState("");
   const [PSLadjudicatorBR, setPSLadjudicatorBR] = useState("");
   const [PSLLA, setPSLLA] = useState("");
   const [PSLadjudicatorLA, setPSLadjudicatorLA] = useState("");
   const [PSLNV, setPSLNV] = useState("");
   const [PSLadjudicatorNV, setPSLadjudicatorNV] = useState("");
   const [PSLCS, setPSLCS] = useState("");
   const [PSLadjudicatorCS, setPSLadjudicatorCS] = useState("");
   const [PSLAS, setPSLAS] = useState("");
   const [PSLadjudicatorAS, setPSLadjudicatorAS] = useState("");
   const [PSLAR, setPSLAR] = useState("");
   const [PSLadjudicatorAR, setPSLadjudicatorAR] = useState("");

   const [GuardianID, setGuardianID] = useState("");
   const [GuardianName, setGuardianName] = useState("");
   const [GuardianPhone, setGuardianPhone] = useState("");
   const [GuardianEmailAddress, setGuardianEmailAddress] = useState("");

   const [saved, setSaved] = useState([]);

   // Configuration settings
   const [Lw_Sub_Juvenile_Age, setLw_Sub_Juvenile_Age] = useState(0);
   const [Up_Sub_Juvenile_Age, setUp_Sub_Juvenile_Age] = useState(0);
   const [Lw_Juvenile_Age, setLw_Juvenile_Age] = useState(0);
   const [Up_Juvenile_Age, setUp_Juvenile_Age] = useState(0);
   const [Lw_Junior_Age, setLw_Junior_Age] = useState(0);
   const [Up_Junior_Age, setUp_Junior_Age] = useState(0);
   const [Lw_Youth_Age, setLw_Youth_Age] = useState(0);
   const [Up_Youth_Age, setUp_Youth_Age] = useState(0);
   const [Lw_Adult_Age, setLw_Adult_Age] = useState(0);
   const [Up_Adult_Age, setUp_Adult_Age] = useState(0);
   const [Lw_Masters_1_Age, setLw_Masters_1_Age] = useState(0);
   const [Up_Masters_1_Age, setUp_Masters_1_Age] = useState(0);
   const [Lw_Masters_2_Age, setLw_Masters_2_Age] = useState(0);
   const [Up_Masters_2_Age, setUp_Masters_2_Age] = useState(0);
   const [Lw_Masters_3_Age, setLw_Masters_3_Age] = useState(0);
   const [Up_Masters_3_Age, setUp_Masters_3_Age] = useState(0);
   const [Lw_Masters_4_Age, setLw_Masters_4_Age] = useState(0);
   const [Up_Masters_4_Age, setUp_Masters_4_Age] = useState(0);
   const [Lw_Masters_5_Age, setLw_Masters_5_Age] = useState(0);
   const [Up_Masters_5_Age, setUp_Masters_5_Age] = useState(0);

   //
   // MARK: Editing state control
   // ===========================
   // This section defines the state machine that controls the maintenance
   // cycle of a registrant record. The useState hook ensures that the
   // environment gets re-configured each time the state changes.
   //
   // MARK: Editing state control
   //
   const [editingState, setEditingState] = useState(editingStates.LOADING);
   const [SavedEditingState, setSavedEditingState] = useState(editingStates.UNDEFINED);

   useEffect(() => {
      switch (editingState) {
         case editingStates.LOADING:
            getConfiguration();
            break;

         case editingStates.SELECTING:
            console.log("Selecting:\n");
            switchTab("general-details")
            clearAllData();
            setReadOnly("tab-content", true);
            enable("RegistrantID");
            break;

         case editingStates.NOT_FOUND:
            // The registrant number entered was not found the database.
            // Confirm that the user wishes to create a new registrant.
            setAddRegistrant(true);
            break;

         case editingStates.ADDING:
            // Configures the maintenance windows to allow a new registrant
            // to be created. Some of these settings ensure that the new user
            // is forced to set their password when they try to log in for the
            // first time.
            disable("RegistrantID");
            setPasswordStatus("N");
            setSelectionMsg("creating ");
            setReadOnly("tab-content", false);
            break;

         case editingStates.EDITING:
            // The registrant was found, so setting the state
            // to EDITING ensures that the record is later
            // updated and not inserted.
            console.log("Editing:\n");
            disable("RegistrantID");
            setSelectionMsg(" - ");
            setReadOnly("tab-content", false);
            break;

         case editingStates.CANCELLING:
            if (isChanged() && RegistrantID !== "") {
               setSavedEditingState(editingState);
               setCancel(true);
            } else if (RegistrantID.trim() === "") {
               setEditingState(editingStates.EXITING);
            } else {
               setEditingState(editingStates.SELECTING);
            }
            break;

         case editingStates.DELETING:
            // RA_BRD Not implemented yet.
            console.log("\neditingState: DELETING");
            break;

         case editingStates.ERROR:
            swal("Manage Registrant Information",
                 "This program has encountered a problem.\n\n" +
                 "The details have been logged and the site administrator has been notified.\n\n" +
                 "Please click OK to exit.");
            setEditingState(editingStates.EXITING);
            break;

         case editingStates.EXITING:
            document.removeEventListener('keydown', keyListener);
            return navigate("/MainPage");

         default:
            break;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [editingState]);

   //
   // MARK: keyListener()
   // ===================
   // Sets a document key listener to detect the Enter key being pressed.
   // This is used to trigger the default submission behaviour for a
   // page whose elements are not wrapped in a form.
   //
   function keyListener(event) {
      if (event.defaultPrevented) {
         return;
      }
      var key = event.key || event.keyCode;
      if (key === 'Enter') {
         event.preventDefault();
         console.log("keyListener Enter. EditingState = " + editingState);
         event.stopPropagation();
         if (SearchRegistrant) {
            console.log("SearchRegistrant");

         } else if (SearchSupervisingProfessional) {

         } else if (SearchGuardian) {

         } else if (editingState !== editingStates.SELECTING) {
            console.log("Enter validate");
            setErrors(validate());
         }
         //event.stopPropagation();
         //try {
         //    //document.getElementById("Update").click();
         //    setErrors(validate());
         //} catch {
         //}
      } else if (key === 'Escape') {
         event.preventDefault();
         // stopPropagation();
         //try {
         //    document.getElementById("Cancel").click();
         //} catch {
         //}
      };
   }

   //
   // MARK: isChanged()
   // =================
   // RA_BRD - the list is incomplete
   //
   // Uses the savedData object that was returned from the
   // getConfiguration function to provide a point of reference
   // to track changes. This is used to implement the Cancel
   // functionality if the user attempts to cancel rather than
   // update after changes have been made.
   //
   function isChanged() {
      if (Salutation !== saved.salutation ||
         FirstName !== saved.first_name ||
         MiddleName !== saved.middle_name ||
         LastName !== saved.last_name ||
         Gender !== saved.gender ||
         Pronouns !== saved.pronouns ||
         StudioName !== saved.studio_name ||
         PhoneNumber !== saved.phone_number ||
         EmailAddress !== saved.email_address ||
         Address1 !== saved.address_1 ||
         Address2 !== saved.address_2 ||
         Address3 !== saved.address_3 ||
         Suburb !== saved.suburb ||
         City !== saved.city ||
         Postcode !== saved.postcode ||
         Country !== saved.country ||
         DateOfBirth !== saved.date_of_birth ||
         StudioName !== saved.studio_name ||
         RegistrantType !== saved.registrant_type ||
         IsProAm !== saved.is_pro_am ||
         IsQualifiedScrutineer !== saved.is_qualified_scrutineer ||
         RegistrantStatus !== saved.registrant_status ||
         AnnualRegAmtPaid !== saved.annual_reg_amt_paid ||
         AnnualRegDatePaid !== saved.annual_reg_date_paid ||
         AmateurTeacher !== saved.amateur_teacher ||
         TeacherStatus !== saved.teacher_status ||
         TeacherRegAmtPaid !== saved.teacher_reg_amt_paid ||
         TeacherRegDatePaid !== saved.teacher_reg_date_paid ||
         TeacherApprovalDate !== saved.teacher_approval_date ||
         SupervisingProfessionalID !== saved.supervising_professional_ID ||
         SupervisingProfessionalName !== saved.supervising_professional_name ||
         SupervisingProfessionalPhone !== saved.supervising_professional_phone ||
         SupervisingProfessionalEmailAddress !== saved.supervising_professional_email_address ||
         AGSubJuvenile !== saved.ag_sub_juvenile ||
         AGSubJuvenileOverride !== saved.ag_sub_juvenile_override ||
         AGJuvenile !== saved.ag_juvenile ||
         AGJuvenileOverride !== saved.ag_juvenile_override ||
         AGJunior !== saved.ag_junior ||
         AGJuniorOverride !== saved.ag_junior_override ||
         AGYouth !== saved.ag_youth ||
         AGYouthOverride !== saved.ag_youth_override ||
         AGAdult !== saved.ag_adult ||
         AGAdultOverride !== saved.ag_adult_override ||
         AGMasters1 !== saved.ag_masters_1 ||
         AGMasters1Override !== saved.ag_masters_1_override ||
         AGMasters2 !== saved.ag_masters_2 ||
         AGMasters2Override !== saved.ag_masters_2_override ||
         AGMasters3 !== saved.ag_masters_3 ||
         AGMasters3Override !== saved.ag_masters_3_override ||
         AGMasters4 !== saved.ag_masters_4 ||
         AGMasters4Override !== saved.ag_masters_4_override ||
         AGMasters5 !== saved.ag_masters_5 ||
         AGMasters5Override !== saved.ag_masters_5_override ||
         AG_Reg_BR_grade !== saved.ag_reg_br_grade ||
         AG_Reg_BR_wins !== saved.ag_reg_br_wins ||
         AG_PA_BR_grade !== saved.ag_pa_br_grade ||
         AG_PA_BR_wins !== saved.ag_pa_br_wins ||
         AG_SL_BR_grade !== saved.ag_sl_br_grade ||
         AG_SL_BR_wins !== saved.ag_sl_br_wins ||
         AG_NR_BR_qwins !== saved.ag_nr_br_qwins ||
         AG_Reg_LA_grade !== saved.ag_reg_la_grade ||
         AG_Reg_LA_wins !== saved.ag_reg_la_wins ||
         AG_PA_LA_grade !== saved.ag_pa_la_grade ||
         AG_PA_LA_wins !== saved.ag.ag_pa_la_wins ||
         AG_SL_LA_grade !== saved.ag_sl_la_grade ||
         AG_SL_LA_wins !== saved.ag_sl_la_wins ||
         AG_NR_LA_qwins !== saved.ag_nr_la_qwins ||
         AGRegNVgrade !== saved.ag_reg_nv_grade ||
         AGRegNVwins !== saved.ag_reg_nv_wins ||
         AGPANVgrade !== saved.ag_pa_nv_grade ||
         AGPANVwins !== saved.ag_pa_nv_wins ||
         AGSLNVgrade !== saved.ag_sl_nv_grade ||
         AGSLNVwins !== saved.ag_sl_nv_wins ||
         AGNRNVqwins !== saved.ag_nr_nv_qwins ||
         AGRegCSgrade !== saved.ag_reg_cs_grade ||
         AGRegCSwins !== saved.ag_reg_cs_wins ||
         AGPACSgrade !== saved.ag_pa_cs_grade ||
         AGPACSwins !== saved.ag_pa_cs_wins ||
         AGSLCSgrade !== saved.ag_sl_cs_grade ||
         AGSLCSwins !== saved.ag_sl_cs_wins ||
         AGNRCSqwins !== saved.ag_nr_cs_qwins ||
         AGRegASgrade !== saved.ag_reg_as_grade ||
         AGRegASwins !== saved.ag_reg_as_wins ||
         AGPAASgrade !== saved.ag_pa_as_grade ||
         AGPAASwins !== saved.ag_pa_as_wins ||
         AGSLASgrade !== saved.ag_sl_as_grade ||
         AGSLASwins !== saved.ag_sl_as_wins ||
         AGNRASqwins !== saved.ag_nr_as_qwins ||
         AGRegARgrade !== saved.ag_reg_ar_grade ||
         AGRegARwins !== saved.ag_reg_ar_wins ||
         AGPAARgrade !== saved.ag_pa_ar_grade ||
         AGPAARwins !== saved.ag_pa_ar_wins ||
         AGSLARgrade !== saved.ag_sl_ar_grade ||
         AGSLARwins !== saved.ag_sl_ar_wins ||
         AGNRARqwins !== saved.ag_nr_ar_qwins ||
         NZQualifiedProfessional !== saved.nz_qualified_professional ||
         NZQualifierScrutineer !== saved.nz_qualified_scrutineer ||
         IntQualifiedProfessional !== saved.int_qualified_professional ||
         IntQualifiedScrutineer !== saved.int_qualified_scrutineer ||
         IntCountryQualified !== saved.int_country_qualified ||
         WDCdancer !== saved.wdc_dancer ||
         WDCadjudicator !== saved.wdc_adjudicator ||
         WDCchairperson !== saved.wdc_chairperson ||
         WDOdancer !== saved.wdo_dancer ||
         WDOadjudicator !== saved.wdo_adjudicator ||
         WDOchairperson !== saved.wdo_chairperson ||
         PSLBR !== saved.psl_br ||
         PSLadjudicatorBR !== saved.psl_adjudicator_br ||
         PSLLA !== saved.psl_la ||
         PSLadjudicatorLA !== saved.psl_adjudicator_la ||
         PSLNV !== saved.psl_nv ||
         PSLadjudicatorNV !== saved.psl_adjudicator_nv ||
         PSLCS !== saved.psl_cs ||
         PSLadjudicatorCS !== saved.psl_adjudicator_cs ||
         PSLAS !== saved.psl_as ||
         PSLadjudicatorAS !== saved.psl_adjudicator_as ||
         PSLAR !== saved.psl_ar ||
         PSLadjudicatorAR !== saved.psl_adjudicator_ar ||
         GuardianID !== saved.guardian_ID ||
         GuardianName !== saved.guardian_name ||
         GuardianPhone !== saved.guardian_phone ||
         GuardianEmailAddress !== saved.guardian_email_address) {
         return true;
      } else {
         return false;
      }
   }

   //
   // MARK: Field interaction
   // =======================
   // Certain fields have dependencies on other fields. This useEffect hook ensure that
   // when a dependent field changes, its related fields enable, disable, and synchronise
   // their values.
   //
   useEffect(() => {
      //console.log("Field interaction: " + RegistrantType + " " + DateOfBirth + " AmateurTeacher " + AmateurTeacher);

      if ((editingState === editingStates.EDITING) || (editingState === editingStates.ADDING)) {
         // The registrant must be an Amateur Dancer before they can become an
         // Amateur Teacher.
         if (RegistrantType === "AD") {
            disableOptionButton("AmateurTeacher", false);
         } else {
            disableOptionButton("AmateurTeacher", true);
            setAmateurTeacher(false);
         }

         if (!AmateurTeacher) {
            setTeacherStatus(" ");
            setCombo("TeacherStatus", " ");
            setTeacherRegAmtPaid(0.00);
            setTeacherRegDatePaid("");
            setEditTeacherRegDatePaid("");
         }

         if (DateOfBirth !== "") {
            setCalcAge(ageCalc(DateOfBirth));
         } else {
            setCalcAge(0);
         }

         if (GuardianID !== "") {
            disable("GuardianName");
            disable("GuardianPhone");
            disable("GuardianEmailAddress");
         } else {
            enable("GuardianName");
            enable("GuardianPhone");
            enable("GuardianEmailAddress");
         }

         if (SupervisingProfessionalID !== "") {
            disable("SupervisingProfessionalName");
            disable("SupervisingProfessionalPhone");
            disable("SupervisingProfessionalEmailAddress");
         } else {
            enable("SupervisingProfessionalName");
            enable("SupervisingProfessionalPhone");
            enable("SupervisingProfessionalEmailAddress");
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [RegistrantType, AmateurTeacher, DateOfBirth, SupervisingProfessionalID, GuardianID]);

   //
   // MARK: clearAllData()
   // ====================
   // This re-initialises all fields before and after editing a registrant. While editing, the
   // individual clear data functions are called just to re-initialise specific sections.
   //
   function clearAllData() {
      setRegistrantID("");
      setUserAuthority(" ");
      setSalutation(" ");
      setGender(" ");
      setPronouns("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setApproveLastName(false);
      setShowApproveLastName(false);
      setPhoneNumber("");;
      setEmailAddress("");
      setAddress1("");
      setAddress2("");
      setAddress3("");
      setSuburb("");
      setCity("");
      setPostcode("");
      setCountry("");
      setDateOfBirth("");
      setEditDateOfBirth("");
      setStudioName("");
      setNewsletter(false);

      setRegistrantType("");
      setIsProAm(false);
      setIsQualifiedScrutineer(false);
      setRegistrantStatus(" ");
      setCombo("RegistrantStatus", " ");
      setAnnualRegAmtPaid(0.00);
      setAnnualRegDatePaid("");
      setEditAnnualRegDatePaid("");
      setCalcAge(0);

      setAmateurTeacher(false);
      clearAmateurTeacherData();
      clearGuardianData();

      setAGSubJuvenile(false)
      setAGSubJuvenileOverride(false);
      setAGJuvenile(false);
      setAGJuvenileOverride(false);
      setAGJunior(false);
      setAGJuniorOverride(false);
      setAGYouth(false);
      setAGYouthOverride(false);
      setAGAdult(false);
      setAGAdultOverride(false);
      setAGMasters1(false);
      setAGMasters1Override(false);
      setAGMasters2(false);
      setAGMasters2Override(false);
      setAGMasters3(false);
      setAGMasters3Override(false);
      setAGMasters4(false);
      setAGMasters4Override(false);
      setAGMasters5(false);
      setAGMasters5Override(false);

      setSubJuvenileNote("");
      setJuvenileNote("");
      setJuniorNote("");
      setYouthNote("");
      setAdultNote("");
      setMasters1Note("");
      setMasters2Note("");
      setMasters3Note("");
      setMasters4Note("");
      setMasters5Note("");

      setAG_Reg_BR_grade("C");
      setAG_Reg_BR_wins(0);
      setAG_PA_BR_grade("C");
      setAG_PA_BR_wins(0);
      setAG_SL_BR_grade("C");
      setAG_SL_BR_wins(0);
      setAG_NR_BR_qwins("");

      setAG_Reg_LA_grade("C");
      setAG_Reg_LA_wins(0);
      setAG_PA_LA_grade("C");
      setAG_PA_LA_wins(0);
      setAG_SL_LA_grade("C");
      setAG_SL_LA_wins(0);
      setAG_NR_LA_qwins("");

      setAGRegNVgrade("C");
      setAGRegNVwins(0);
      setAGPANVgrade("C");
      setAGPANVwins(0);
      setAGSLNVgrade("C");
      setAGSLNVwins(0);
      setAGNRNVqwins("");

      setAGRegCSgrade("C");
      setAGRegCSwins(0);
      setAGPACSgrade("C");
      setAGPACSwins(0);
      setAGSLCSgrade("C");
      setAGSLCSwins(0);
      setAGNRCSqwins("");

      setAGRegASgrade("C");
      setAGRegASwins(0);
      setAGPAASgrade("C");
      setAGPAASwins(0);
      setAGSLASgrade("C");
      setAGSLASwins(0);
      setAGNRASqwins("");

      setAGRegARgrade("C");
      setAGRegARwins(0);
      setAGPAARgrade("C");
      setAGPAARwins(0);
      setAGSLARgrade("C");
      setAGSLARwins(0);
      setAGNRARqwins("");

      clearProfessionalData();
      clearGuardianData();
      setSelectionMsg("");
   }

   //
   // MARK: clearAmateurTeacherData()
   // ===============================
   function clearAmateurTeacherData() {
      setTeacherStatus(" ");
      setCombo("TeacherStatus", " ");
      setTeacherRegAmtPaid(0.00);
      setTeacherRegDatePaid("");
      setEditTeacherRegDatePaid("");
      setTeacherApprovalDate("");
      setEditTeacherApprovalDate("");
   }

   //
   // MARK: clearGuardianData()
   // =========================
   function clearGuardianData() {
      setGuardianID("");
      setGuardianName("");
      setGuardianPhone("");
      setGuardianEmailAddress("");
   }

   //
   // MARK: clearProfessionalData()
   // =============================
   function clearProfessionalData() {
      setNZQualifiedProfessional(false);
      setNZQualifierScrutineer(false);
      setCombo("IntCountryQualified", " ");
      setIntQualifiedProfessional(false);
      setIntQualifiedScrutineer(false);
      setIntCountryQualified("");
      setWDCdancer(false);
      setWDCadjudicator(false);
      setWDCchairperson(false);
      setWDOdancer(false);
      setWDOadjudicator(false);
      setWDOchairperson(false);

      setPSLBR("");
      setPSLadjudicatorBR("");
      setPSLLA("");
      setPSLadjudicatorLA("");
      setPSLNV("");
      setPSLadjudicatorNV("");
      setPSLCS("");
      setPSLadjudicatorCS("");
      setPSLAS("");
      setPSLadjudicatorAS("");
      setPSLAR("");
      setPSLadjudicatorAR("");
   }

   //
   // MARK: validate()
   // ================
   // Validates the fields prior to updating the Registrant record. The return value
   // is the errors object. This contains properties for each of the error messages
   // that are to be displayed. If the data is valid, the dancer record is updated.
   //
   function validate() {
      let errors = {};
      errors.page = 0;

      if (RegistrantStatus === "R") {
         if (!validateDate("DDMMYYYY", AnnualRegDatePaid)) {
            errors.AnnualRegDatePaid = "Invalid date entered";
            errors.page = 1;
         }
         if (AnnualRegAmtPaid === "") {
            errors.AnnualRegAmtPaid = "Enter an amount or 0.00";
            errors.page = 1;
         }
      }

      if (AmateurTeacher) {
         if (TeacherStatus.trim() === "") {
            errors.TeacherStatus = "A status must be selected";
            errors.page = 1;
         } else if (TeacherStatus === "R") {
            // A registered teacher must have a payment registration date.
            if (!validateDate("DDMMYYYY", TeacherRegDatePaid)) {
               errors.TeacherRegDatePaid = "Invalid date entered";
               errors.page = 1;
            }
            if (TeacherRegAmtPaid === "") {
               errors.TeacherRegAmtPaid = "Enter an amount or 0.00";
               errors.page = 1;
            }
         }
      }

      // console.log("validate() DateOfBirth [" + DateOfBirth + "]");
      if (!validateDate("DDMMYYYY", DateOfBirth)) {
         errors.DateOfBirth = "Invalid date entered";
         errors.page = 1;
      }

      if (!UserAuthority.trim()) {
         errors.UserAuthority = "An authority is required";
         errors.page = 1;
      }

      if (!FirstName.trim()) {
         errors.FirstName = "A first name must be entered";
         errors.page = 1;
      }

      if (!LastName.trim() && !ApproveLastName) {
         errors.LastName = "Last name is blank. Please approve";
         setShowApproveLastName(true);
         errors.page = 1;
      }

      if (!PhoneNumber.trim()) {
         errors.PhoneNumber = "A phone number is required";
         errors.page = 2;;
      }
      if (!EmailAddress.trim()) {
         errors.EmailAddress = "An email address must be entered.";
         errors.page = 2;
      } else if (!/\S+@\S+\.\S+/.test(EmailAddress)) {
         errors.EmailAddress = "The email address entered is not valid.";
         errors.page = 2;
      }

      if (!Address1.trim()) {
         errors.Address1 = "An address must be entered";
         errors.page = 2;
      }

      if (!Suburb.trim()) {
         errors.Suburb = "A suburb is required";
         errors.page = 2;
      }

      if (!City.trim()) {
         errors.City = "A city name is required";
         errors.page = 2;
      }

      if (!Postcode.trim()) {
         errors.Postcode = "A post code is required";
         errors.page = 2;
      }

      if (!Country.trim()) {
         errors.Country = "The country name is required";
         errors.page = 2;
      }

      if (!/\d{0,5}\.?\d{2}/.test(AnnualRegAmtPaid)) {
         errors.AnnualRegAmtPaid = "An amount must be entered";
         errors.page = 1;
      }

      if (ageCalc(DateOfBirth) <= GUARDIAN_REQU_AGE) {
         if (!GuardianName.trim()) {
            errors.GuardianName = "A name is required";
            errors.page = 6;
         }

         if (!GuardianPhone) {
            errors.GuardianPhone = "A phone number is required";
            errors.page = 6;
         }

         if ((!/\S+@\S+\.\S+/.test(GuardianEmailAddress))) {
            errors.GuardianEmailAddress = "The email address entered is not valid.";
         }
      }

      // Validate the age group and grading overide approvals.
      const msg = "Please approve";
      if ((CalcAge < Lw_Sub_Juvenile_Age || CalcAge > Up_Sub_Juvenile_Age) && !AGSubJuvenileOverride && AGSubJuvenile) {
         errors.AGSubJuvenileOverride = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Juvenile_Age || CalcAge > Up_Juvenile_Age) && !AGJuvenileOverride && AGJuvenile) {
         errors.AGJuvenileOverride = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Junior_Age || CalcAge > Up_Junior_Age) && !AGJuniorOverride && AGJunior) {
         errors.AGJuniorOverride = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Youth_Age || CalcAge > Up_Youth_Age) && !AGYouthOverride && AGYouth) {
         errors.AGYouthOverride = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Adult_Age || CalcAge > Up_Adult_Age) && !AGAdultOverride && AGAdult) {
         errors.AGAdultOverride = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Masters_1_Age || CalcAge > Up_Masters_1_Age) && !AGMasters1Override && AGMasters1) {
         errors.AGMasters1Override = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Masters_2_Age || CalcAge > Up_Masters_2_Age) && !AGMasters2Override && AGMasters2) {
         errors.AGMasters2Override = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Masters_3_Age || CalcAge > Up_Masters_3_Age) && !AGMasters3Override && AGMasters3) {
         errors.AGMasters3Override = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Masters_4_Age || CalcAge > Up_Masters_4_Age) && !AGMasters4Override && AGMasters4) {
         errors.AGMasters4Override = msg;
         errors.page = 3;
      }

      if ((CalcAge < Lw_Masters_5_Age || CalcAge > Up_Masters_5_Age) && !AGMasters5Override && AGMasters5) {
         errors.AGMasters5Override = msg;
         errors.page = 3;
      }

      switch (errors.page) {
         case 0:
            updateRegistrant(RegistrantID);
            break;

         case 1:
            switchTab("general-details");
            break;

         case 2:
            switchTab("contact-information");
            break;

         case 3:
            switchTab("age-groups");
            break;

         case 6:
            switchTab("guardian-info")
            break;

         default:
            break;
      }
      return errors;
   };

   //
   // MARK: getRegistrant()
   // =====================
   // Reads the registrant information from the database and loads it into the editing fields.
   // Note since this method operates within an aync Promise, it is the safest place to
   // set the editingState so that that state does not get triggered before the read is complete.
   //
   const getRegistrant = async (key, mode) => {
      try {
         let response = await axios.get(baseURL + "getRegistrant?registrant_ID=" + key + "&JWT=" + JWT);
         if (response.status === 200) {
            switch (mode) {
               case "R":
                  // Selecting the registrant record for maintenance.
                  setSaved(response.data);
                  setRegistrantID(response.data.registrant_ID);
                  setUserAuthority(response.data.user_authority || "");
                  setCombo("UserAuthority", UserAuthority || "");
                  setRegistrantStatus(response.data.registrant_status || "");
                  setCombo("RegistrantStatus", RegistrantStatus || "");

                  setPassword(response.data.password || "");
                  setSalutation(response.data.salutation || "");
                  setCombo("Salutation", Salutation);
                  setFirstName(response.data.first_name || "");
                  setMiddleName(response.data.middle_name || "");
                  setLastName(response.data.last_name || "");
                  setGender(response.data.gender || "");
                  setCombo("Gender", Gender || "");
                  setPronouns(response.data.pronouns || "");
                  setPhoneNumber(response.data.phone_number || "");
                  setEmailAddress(response.data.email_address || "");
                  setAddress1(response.data.address_1 || "");
                  setAddress2(response.data.address_2 || "");
                  setAddress3(response.data.address_3 || "");
                  setSuburb(response.data.suburb || "");
                  setCity(response.data.city || "");
                  setPostcode(response.data.postcode || "");
                  setCountry(response.data.country || "");
                  setDateOfBirth(decodeISOdate(response.data.date_of_birth || "1/01/1800"));
                  setEditDateOfBirth(formatDate("DD MMMM YYYY",
                     decodeISOdate(response.data.date_of_birth)));
                  setStudioName(response.data.studio_name || "");
                  setNewsletter(response.data.newsletter);
                  setRegistrantType(response.data.registrant_type || "");
                  setIsProAm(response.data.is_pro_am === true);
                  setIsQualifiedScrutineer(response.data.is_qualified_scrutineer === true);

                  setAmateurTeacher(response.data.amateur_teacher === true);
                  setAnnualRegAmtPaid(response.data.annual_reg_amt_paid);
                  setAnnualRegDatePaid(decodeISOdate(response.data.annual_reg_date_paid || "1/01/1800"));
                  setEditAnnualRegDatePaid(formatDate("DD MMMM YYYY",
                     decodeISOdate(response.data.annual_reg_date_paid)));
                  setTeacherStatus(response.data.teacher_status || "");
                  setCombo("TeacherStatus", TeacherStatus);
                  setTeacherRegAmtPaid(response.data.teacher_reg_amt_paid || "0.00");
                  setTeacherRegDatePaid(decodeISOdate(response.data.teacher_reg_date_paid || "1/01/1800"));
                  setEditTeacherRegDatePaid(formatDate("DD MMMM YYYY",
                     decodeISOdate(response.data.teacher_reg_date_paid)));
                  setTeacherApprovalDate(decodeISOdate(response.data.teacher_approval_date || "1/01/1800"));
                  setEditTeacherApprovalDate(formatDate("DD MMMM YYYY",
                     decodeISOdate(response.data.teacher_approval_date)));
                  setSupervisingProfessionalID(response.data.supervising_professional_ID || "");
                  setSupervisingProfessionalName(response.data.supervising_professional_name || "");
                  setSupervisingProfessionalPhone(response.data.supervising_professional_phone || "");
                  setSupervisingProfessionalEmailAddress(response.data.supervising_professional_email_address || "");

                  setAGSubJuvenile(response.data.ag_sub_juvenile);
                  setAGSubJuvenileOverride(response.data.ag_sub_juvenile_override);
                  setAGJuvenile(response.data.ag_juvenile);
                  setAGJuvenileOverride(response.data.ag_juvenile_override);
                  setAGJunior(response.data.ag_junior);
                  setAGJuniorOverride(response.data.ag_junior_override);
                  setAGYouth(response.data.ag_youth);
                  setAGYouthOverride(response.data.ag_youth_override);
                  setAGAdult(response.data.ag_adult);
                  setAGAdultOverride(response.data.ag_adult_override);
                  setAGMasters1(response.data.ag_masters_1);
                  setAGMasters1Override(response.data.ag_masters_1_override);
                  setAGMasters2(response.data.ag_masters_2);
                  setAGMasters2Override(response.data.ag_masters_2_override);
                  setAGMasters3(response.data.ag_masters_3);
                  setAGMasters3Override(response.data.ag_masters_3_override);
                  setAGMasters4(response.data.ag_masters_4);
                  setAGMasters4Override(response.data.ag_masters_4_override);
                  setAGMasters5(response.data.ag_masters_5);
                  setAGMasters5Override(response.data.ag_masters_5_override);

                  setAG_Reg_BR_grade(response.data.ag_reg_br_grade);
                  setAG_Reg_BR_wins(response.data.ag_reg_br_wins);
                  setAG_PA_BR_grade(response.data.ag_pa_br_grade);
                  setAG_PA_BR_wins(response.data.ag_pa_br_wins);
                  setAG_SL_BR_grade(response.data.ag_sl_br_grade);
                  setAG_SL_BR_wins(response.data.ag_sl_br_wins);
                  setAG_NR_BR_qwins(response.data.ag_nr_br_qwins + " ");

                  setAG_Reg_LA_grade(response.data.ag_reg_la_grade);
                  setAG_Reg_LA_wins(response.data.ag_reg_la_wins);
                  setAG_PA_LA_grade(response.data.ag_pa_la_grade);
                  setAG_PA_LA_wins(response.data.ag_pa_la_wins);
                  setAG_SL_LA_grade(response.data.ag_sl_la_grade);
                  setAG_SL_LA_wins(response.data.ag_sl_la_wins);
                  setAG_NR_LA_qwins(response.data.ag_nr_la_qwins + " ");

                  setAGRegNVgrade(response.data.ag_reg_nv_grade);
                  setAGRegNVwins(response.data.ag_reg_nv_wins);
                  setAGPANVgrade(response.data.ag_pa_nv_grade);
                  setAGPANVwins(response.data.ag_pa_nv_wins);
                  setAGSLNVgrade(response.data.ag_sl_nv_grade);
                  setAGSLNVwins(response.data.ag_sl_nv_wins);
                  setAGNRNVqwins(response.data.ag_nr_nv_qwins + " ");

                  setAGRegCSgrade(response.data.ag_reg_cs_grade);
                  setAGRegCSwins(response.data.ag_reg_cs_wins);
                  setAGPACSgrade(response.data.ag_pa_cs_grade);
                  setAGPACSwins(response.data.ag_pa_cs_wins);
                  setAGSLCSgrade(response.data.ag_sl_cs_grade);
                  setAGSLCSwins(response.data.ag_sl_cs_wins);
                  setAGNRCSqwins(response.data.ag_nr_cs_qwins + " ");

                  setAGRegASgrade(response.data.ag_reg_as_grade);
                  setAGRegASwins(response.data.ag_reg_as_wins);
                  setAGPAASgrade(response.data.ag_pa_as_grade);
                  setAGPAASwins(response.data.ag_pa_as_wins);
                  setAGSLASgrade(response.data.ag_sl_as_grade);
                  setAGSLASwins(response.data.ag_sl_as_wins);
                  setAGNRASqwins(response.data.ag_nr_as_qwins + " ");

                  setAGRegARgrade(response.data.ag_reg_ar_grade);
                  setAGRegARwins(response.data.ag_reg_ar_wins);
                  setAGPAARgrade(response.data.ag_pa_ar_grade);
                  setAGPAARwins(response.data.ag_pa_ar_wins);
                  setAGSLARgrade(response.data.ag_sl_ar_grade);
                  setAGSLARwins(response.data.ag_sl_ar_wins);
                  setAGNRARqwins(response.data.ag_nr_ar_qwins + " ");

                  setNZQualifiedProfessional(response.data.nz_qualified_professional);
                  setNZQualifierScrutineer(response.data.nz_qualified_scrutineer);
                  setIntQualifiedProfessional(response.data.int_qualified_professional);
                  setIntQualifiedScrutineer(response.data.int_qualified_scrutineer);
                  setIntCountryQualified(response.data.int_country_qualified || "");
                  setCombo("IntCountryQualified", IntCountryQualified);

                  setWDCdancer(response.data.wdc_dancer);
                  setWDCadjudicator(response.data.wdc_adjudicator);
                  setWDCchairperson(response.data.wdc_chairperson);
                  setWDOdancer(response.data.wdo_dancer);
                  setWDOadjudicator(response.data.wdo_adjudicator);
                  setWDOchairperson(response.data.wdo_chairperson);

                  setPSLBR(response.data.psl_br);
                  setPSLadjudicatorBR(response.data.psl_adjudicator_br);
                  setPSLLA(response.data.psl_la);
                  setPSLadjudicatorLA(response.data.psl_adjudicator_la);
                  setPSLNV(response.data.psl_nv);
                  setPSLadjudicatorNV(response.data.psl_adjudicator_nv);
                  setPSLCS(response.data.psl_cs);
                  setPSLadjudicatorCS(response.data.psl_adjudicator_cs);
                  setPSLAS(response.data.psl_as);
                  setPSLadjudicatorAS(response.data.psl_adjudicator_as);
                  setPSLAR(response.data.psl_ar);
                  setPSLadjudicatorAR(response.data.psl_adjudicator_ar);
                  setGuardianID(response.data.guardian_ID || "");
                  setGuardianName(response.data.guardian_name || "");
                  setGuardianPhone(response.data.guardian_phone || "");
                  setGuardianEmailAddress(response.data.guardian_email_address || "");

                  // Override notes are read via a join to the separate Notes table.
                  setSubJuvenileNote(response.data.subjuvenile_note || "");
                  setJuvenileNote(response.data.juvenile_note || "");
                  setJuniorNote(response.data.junior_note || "");
                  setYouthNote(response.data.youth_note || "");
                  setAdultNote(response.data.adult_note || "");
                  setMasters1Note(response.data.masters1_note || "");
                  setMasters2Note(response.data.masters2_note || "");
                  setMasters3Note(response.data.masters3_note || "");
                  setMasters4Note(response.data.masters4_note || "");
                  setMasters5Note(response.data.masters5_note || "");

                  setEditingState(editingStates.EDITING)
                  break;

               case "SP":
                  // Loading the supervising professional information
                  setSupervisingProfessionalID(response.data.registrant_ID || "");
                  setSupervisingProfessionalName(response.data.first_name + " " + response.data.last_name || "");
                  setSupervisingProfessionalPhone(response.data.phone_number || "");
                  setSupervisingProfessionalEmailAddress(response.data.email_address || "");
                  break;

               case "G":
                  // Loading the guardian information
                  setGuardianID(response.data.registrant_ID || "");
                  setGuardianName(response.data.first_name + " " + response.data.last_name || "");
                  setGuardianPhone(response.data.phone_number || "");
                  setGuardianEmailAddress(response.data.email_address || "");
                  break;

               default:
                  break;
            }
         } else {
            if (response.status === 404) {
               setEditingState(editingStates.NOT_FOUND);
            }
         }
      } catch (err) {
         console.log("getRegistrant() error:" + err.status);
         setEditingState(editingStates.NOT_FOUND);
      }
   };

   //
   // MARK: updateRegistrant()
   // ========================
   // Based on the current editingState, the correct route to update an existing
   // registrant or insert a new one is called.
   //
   const updateRegistrant = () => {
      var route = "";
      if (editingState === editingStates.ADDING) {
         route = baseURL + "insertRegistrant?JWT=" + JWT;
      } else {
         route = baseURL + "updateRegistrant?JWT=" + JWT;
      }

      axios.put(route, {
         id: RegistrantID,
         user_authority: UserAuthority,
         password: Password,
         password_status: PasswordStatus,
         salutation: Salutation,
         first_name: FirstName,
         middle_name: MiddleName,
         last_name: LastName,
         gender: Gender,
         pronouns: Pronouns,
         phone_number: PhoneNumber,
         email_address: EmailAddress,
         address_1: Address1,
         address_2: Address2,
         address_3: Address3,
         suburb: Suburb,
         city: City,
         postcode: Postcode,
         country: Country,
         date_of_birth: encodeISOdate(DateOfBirth),
         studio_name: StudioName,
         newsletter: Newsletter,
         registrant_type: RegistrantType,
         is_pro_am: IsProAm,
         is_qualified_scrutineer: IsQualifiedScrutineer,
         registrant_status: RegistrantStatus,
         annual_reg_amt_paid: AnnualRegAmtPaid,
         annual_reg_date_paid: encodeISOdate(AnnualRegDatePaid),
         amateur_teacher: AmateurTeacher,
         teacher_status: TeacherStatus,
         teacher_reg_amt_paid: TeacherRegAmtPaid,
         teacher_reg_date_paid: encodeISOdate(TeacherRegDatePaid),
         teacher_approval_date: encodeISOdate(TeacherApprovalDate),
         supervising_professional_ID: SupervisingProfessionalID,
         supervising_professional_name: SupervisingProfessionalName,
         supervising_professional_phone: SupervisingProfessionalPhone,
         supervising_professional_email_address: SupervisingProfessionalEmailAddress,

         ag_sub_juvenile: AGSubJuvenile,
         ag_sub_juvenile_override: AGSubJuvenileOverride,
         ag_juvenile: AGJuvenile,
         ag_juvenile_override: AGJuvenileOverride,
         ag_junior: AGJunior,
         ag_junior_override: AGJuniorOverride,
         ag_youth: AGYouth,
         ag_youth_override: AGYouthOverride,
         ag_adult: AGAdult,
         ag_adult_override: AGAdultOverride,
         ag_masters_1: AGMasters1,
         ag_masters_1_override: AGMasters1Override,
         ag_masters_2: AGMasters2,
         ag_masters_2_override: AGMasters2Override,
         ag_masters_3: AGMasters3,
         ag_masters_3_override: AGMasters3Override,
         ag_masters_4: AGMasters4,
         ag_masters_4_override: AGMasters4Override,
         ag_masters_5: AGMasters5,
         ag_masters_5_override: AGMasters5Override,

         ag_reg_br_grade: AG_Reg_BR_grade,
         ag_reg_br_wins: AG_Reg_BR_wins,
         ag_pa_br_grade: AG_PA_BR_grade,
         ag_pa_br_wins: AG_PA_BR_wins,
         ag_sl_br_grade: AG_SL_BR_grade,
         ag_sl_br_wins: AG_SL_BR_wins,
         ag_nr_br_qwins: AG_NR_BR_qwins,

         ag_reg_la_grade: AG_Reg_LA_grade,
         ag_reg_la_wins: AG_Reg_LA_wins,
         ag_pa_la_grade: AG_PA_LA_grade,
         ag_pa_la_wins: AG_PA_LA_wins,
         ag_sl_la_grade: AG_SL_LA_grade,
         ag_sl_la_wins: AG_SL_LA_wins,
         ag_nr_la_qwins: AG_NR_LA_qwins,

         ag_reg_nv_grade: AGRegNVgrade,
         ag_reg_nv_wins: AGRegNVwins,
         ag_pa_nv_grade: AGPANVgrade,
         ag_pa_nv_wins: AGPANVwins,
         ag_sl_nv_grade: AGSLNVgrade,
         ag_sl_nv_wins: AGSLNVwins,
         ag_nr_nv_qwins: AGNRNVqwins,

         ag_reg_cs_grade: AGRegCSgrade,
         ag_reg_cs_wins: AGRegCSwins,
         ag_pa_cs_grade: AGPACSgrade,
         ag_pa_cs_wins: AGPACSwins,
         ag_sl_cs_grade: AGSLCSgrade,
         ag_sl_cs_wins: AGSLCSwins,
         ag_nr_cs_qwins: AGNRCSqwins,

         ag_reg_as_grade: AGRegASgrade,
         ag_reg_as_wins: AGRegASwins,
         ag_pa_as_grade: AGPAASgrade,
         ag_pa_as_wins: AGPAASwins,
         ag_sl_as_grade: AGSLASgrade,
         ag_sl_as_wins: AGSLASwins,
         ag_nr_as_qwins: AGNRASqwins,

         ag_reg_ar_grade: AGRegARgrade,
         ag_reg_ar_wins: AGRegARwins,
         ag_pa_ar_grade: AGPAARgrade,
         ag_pa_ar_wins: AGPAARwins,
         ag_sl_ar_grade: AGSLARgrade,
         ag_sl_ar_wins: AGSLARwins,
         ag_nr_ar_qwins: AGNRARqwins,

         nz_qualified_professional: NZQualifiedProfessional,
         nz_qualified_scrutineer: NZQualifierScrutineer,
         int_qualified_professional: IntQualifiedProfessional,
         int_qualified_scrutineer: IntQualifiedScrutineer,
         int_country_qualified: IntCountryQualified,
         wdc_dancer: WDCdancer,
         wdc_adjudicator: WDCadjudicator,
         wdc_chairperson: WDCchairperson,
         wdo_dancer: WDCdancer,
         wdo_adjudicator: WDCadjudicator,
         wdo_chairperson: WDCchairperson,

         psl_br: PSLBR,
         psl_adjudicator_br: PSLadjudicatorBR,
         psl_la: PSLLA,
         psl_adjudicator_la: PSLadjudicatorLA,
         psl_nv: PSLNV,
         psl_adjudicator_nv: PSLadjudicatorNV,
         psl_cs: PSLCS,
         psl_adjudicator_cs: PSLadjudicatorCS,
         psl_as: PSLAS,
         psl_adjudicator_as: PSLadjudicatorAS,
         psl_ar: PSLAR,
         psl_adjudicator_ar: PSLadjudicatorAR,

         guardian_ID: GuardianID,
         guardian_name: GuardianName,
         guardian_phone: GuardianPhone,
         guardian_email_address: GuardianEmailAddress,

         subjuvenile_note: SubJuvenileNote,
         juvenile_note: JuvenileNote,
         junior_note: JuniorNote,
         youth_note: YouthNote,
         adult_note: AdultNote,
         masters1_note: Masters1Note,
         masters2_note: Masters2Note,
         masters3_note: Masters3Note,
         masters4_note: Masters4Note,
         masters5_note: Masters5Note
      })
         .then((response) => {
         })
         .catch(err => {
            // console.log(".catch() updateRegistrant() err: " + err.message);
            swal("Manage Registrant Information",
               "This registrant could not be updated because the program has encountered a problem.\n\n" +
               "The details have been logged and the site administrator has been notified.\n\n" +
               "Please click OK to continue.");
         })
      setEditingState(editingStates.SELECTING);
   };

   //
   // MARK: getConfiguration()
   // ========================
   //
   const getConfiguration = async (token) => {
      try {
         let response = await axios.get(baseURL + "getConfiguration?JWT=" + JWT);
         if (response.status === 200) {
            setLw_Sub_Juvenile_Age(response.data.lw_sub_juvenile_age);
            setUp_Sub_Juvenile_Age(response.data.up_sub_juvenile_age);
            setLw_Juvenile_Age(response.data.lw_juvenile_age);
            setUp_Juvenile_Age(response.data.up_juvenile_age);
            setLw_Junior_Age(response.data.lw_junior_age);
            setUp_Junior_Age(response.data.up_junior_age);
            setLw_Youth_Age(response.data.lw_youth_age);
            setUp_Youth_Age(response.data.up_youth_age);
            setLw_Adult_Age(response.data.lw_adult_age);
            setUp_Adult_Age(response.data.up_adult_age);
            setLw_Masters_1_Age(response.data.lw_masters_1_age);
            setUp_Masters_1_Age(response.data.up_masters_1_age);
            setLw_Masters_2_Age(response.data.lw_masters_2_age);
            setUp_Masters_2_Age(response.data.up_masters_2_age);
            setLw_Masters_3_Age(response.data.lw_masters_3_age);
            setUp_Masters_3_Age(response.data.up_masters_3_age);
            setLw_Masters_4_Age(response.data.lw_masters_4_age);
            setUp_Masters_4_Age(response.data.up_masters_4_age);
            setLw_Masters_5_Age(response.data.lw_masters_5_age);
            setUp_Masters_5_Age(response.data.up_masters_5_age);
            setEditingState(editingStates.SELECTING);
         } else {
            if (response.status === 404) {
               setEditingState(editingStates.NOT_FOUND);
            }
         }
      } catch (err) {
         console.log("getConfiguration() error:" + err.status + err.message);
         setEditingState(editingStates.ERROR);
      }
   };

   //
   // MARK: switchTab()
   // =================
   // Provides a way for tab headings to be clicked on so that the user can switch to a
   // different tabbed page.
   //
   // This function also allows the validate() function to switch automatically to the tab
   // where an error is displayed. The tabContentBoxes constant selects the <div>
   // content that are the direct children of the element with the id of
   // "tab-content".
   //
   function switchTab(tabName) {
      const tabContentBoxes = document.querySelectorAll('#tab-content > div');
      tabContentBoxes.forEach(box => {
         if (box.getAttribute('id') === tabName) {
            // This is the content for the tab that is to be selected so make
            // it visible.
            setCurrentTab(tabName);
            box.classList.remove('is-hidden');
         } else {
            // It is not the active tab so hide its contents.
            box.classList.add('is-hidden');
         }
      });

      // Highlight the new active tab.
      const tabs = document.querySelectorAll('.tabs li');
      tabs.forEach((tab) => {
         if (tab.getAttribute('data-target') === tabName) {
            tab.classList.add('is-active');
         } else {
            tab.classList.remove('is-active');
         }
      });
   };

   //
   // MARK: addEventListener()
   // ========================
   // Listen for the Enter and Escape keys and map them
   // to the Update and Cancel buttons.
   //
   //document.addEventListener('keyup', keyListener);

   //
   // MARK: AddRegistrantDialog()
   // ===========================
   // Displays a modal dialog to confirm that a new registrant is to be created.
   // It is activated by setting AddRegistrant true. The response returns a constant
   // for yes or no from the buttons shown in the dialog.
   //
   const AddRegistrantDialog = () => {
      return (
         <React.Fragment>
            <div className="container is-centered">
               <div className="modal is-active" id="modalAddRegistrant">
                  <div className="modal-content is-center">
                     <div className="box has-background-blue" style={{ width: "350px", borderStyle: "solid" }}>
                        <p style={{ fontSize: "20pt" }}>Registrant {RegistrantID} has not been found in the database</p>
                        <br></br>
                        <p>Click <b>Yes</b> to create a new registrant and begin entering their information or</p>
                        <br></br>
                        <p>Click <b>No</b> to cancel and select another registrant.</p>
                        <br></br>
                        <div className="field is-grouped ">
                           <div className="field ml-6 pr-4">
                              <button
                                 className="button is-danger"
                                 id="modalYes"
                                 style={{ width: "100px" }}
                                 onClick={() => {
                                    setAddRegistrant(false);
                                    setEditingState(editingStates.ADDING);
                                 }} >
                                 Yes
                              </button>
                           </div>

                           <div className="field">
                              <button
                                 className="button is-danger"
                                 id="modalNo"
                                 style={{ width: "100px" }}
                                 onClick={() => {
                                    setAddRegistrant(false);
                                    setEditingState(editingStates.SELECTING);
                                 }} >
                                 No
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </React.Fragment>
      );
   }

   //
   // MARK: CancelDialog()
   // ====================
   const CancelDialog = (mode, response) => {
      return (
         <React.Fragment>
            <div className="container is-centered" >
               <div className="columns is-centered">
                  <div className="column">
                     <div className="modal is-active" id="modalCancel" >
                        <div className="modal-content is-center">
                           <div className="box has-background-blue" style={{ width: "350px", borderStyle: "solid" }}>
                              <p style={{ fontSize: "20pt" }}>Information about registrant {RegistrantID} has been changed</p>
                              <br></br>
                              <p>Do you really want to cancel these changes?</p>
                              <br></br>
                              <p>Click <b>Yes</b> to cancel these changes or</p>
                              <br></br>
                              <p>Click <b>No</b> to continue editing.</p>
                              <br></br>
                              <div className="field is-grouped ">
                                 <div className="field ml-6 pr-4">
                                    <button
                                       className="button is-danger"
                                       id="modalYes"
                                       style={{ width: "100px" }}
                                       onClick={() => {
                                          setCancel(false);
                                          setEditingState(editingStates.SELECTING);
                                       }} >
                                       Yes
                                    </button>
                                 </div>

                                 <div className="field">
                                    <button
                                       className="button is-danger"
                                       id="modalNo"
                                       style={{ width: "100px" }}
                                       onClick={() => {
                                          setCancel(false);
                                          if (SavedEditingState === editingStates.ADDING) {
                                             setEditingState(editingStates.ADDING);
                                          } else {
                                             setEditingState(editingStates.EDITING);
                                          }
                                       }} >
                                       No
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </React.Fragment>
      );
   }

   //
   // MARK: Search Dialog
   // ============+======
   // Displays a modal dialog box containing a list of registrants. If this
   // is called using the Search button, then a registrant can be selected
   // for editing. If it is called from Find button on the Amateur Teacher
   // page, a list containing only Supervising Professional registrants is
   // displayed. This code is embedded in the page as a fragment.
   //
   // onChange={e => setGuardianEmailAddress(e.target.value)}
   // const Search= (mode, response, setSearchText) => {
   //
   const Search = () => {
      const [SearchText, setSearchText] = useState("");
      const [IsLoaded, setIsLoaded] = useState(false);

      //
      // Configure the search grid
      // =========================
      // Configures the dynamic loading of the registrant search box.
      //
      const [rowData, setRowData] = useState([]);
      // eslint-disable-next-line
      const [columnDefs] = useState([
         {
            field: 'registrant_ID', 'width': 90, headerName: "Number", filter: false,
            sortable: true, cellStyle: { fontSize: "12pt" }
         },

         {
            field: 'first_name', 'width': 150, headerName: "First name", filter: false,
            sortable: true, cellStyle: { fontSize: "12pt" }
         },
         {
            field: 'last_name', 'width': 150, headerName: "Last Name", filter: false,
            sortable: true, cellStyle: { fontSize: "12pt" }
         },
         {
            field: 'email_address', 'width': 160, headerName: "Email address", filter: false,
            sortable: true, cellStyle: { fontSize: "12pt" }
         }
      ]);

      //
      // MARK: Select Registrant
      // =======================
      // Returns either the registrant whose information is to be edited, the ID and information of the supervising
      // professional for an amateur teacher, or the ID and information for a Guardian.
      //
      function SelectRegistrant(event) {
         //console.log("SelectRegistrant: " + event.rowIndex + " " + rowData[event.rowIndex].registrant_ID + " " + CurrentTab);
         if (SearchRegistrant) {
            setSearchRegistrant(false);
            getRegistrant(rowData[event.rowIndex].registrant_ID, "R");
         } else if (SearchSupervisingProfessional) {
            // Find the Supervising Professional who supervises this amateur teacher.
            setSearchSupervisingProfessional(false);
            const ID = rowData[event.rowIndex].registrant_ID;
            if (ID !== RegistrantID) {
               getRegistrant(rowData[event.rowIndex].registrant_ID, "SP");
               errors.SupervisingProfessionalID = "";
            } else {
               errors.SupervisingProfessionalID = "You cannot supervise yourself.";
            }
         } else if (SearchGuardian) {
            // Find the guardian of this registrant if their age is below the
            // minimum age.
            setSearchGuardian(false);
            const ID = rowData[event.rowIndex].registrant_ID;
            if (ID !== RegistrantID) {
               getRegistrant(rowData[event.rowIndex].registrant_ID, "G");
               errors.GuardianID = "";
            } else {
               errors.GuardianID = "You cannot be your own guardian";
            }
         }
      };

      //
      // MARK: getRegistrantList
      // =======================
      const getRegistrantList = async (searchString) => {
         let filter = searchString || "";

         let mode = "ALL";
         if (SearchSupervisingProfessional) {
            // Only return registrants who are Supervising Professionals
            mode = "PR";
         } else if (SearchGuardian) {
            // Ensure that the registrants returned are older than the guardian
            // age.
            mode = "GA";
         } else if (filter !== "") {
            // Searching by a wildcard while selecting a registrant.
            mode = "WC";
         }

         try {
            let response = await axios.get(baseURL + "getRegistrantList" +
               "?mode=" + mode +
               "&searchString=" + filter +
               "&JWT=" + JWT);
            if (response.status === 200) {
               setRowData(response.data);
            } else {
            }
         } catch (err) {
            console.log("getRegistrantList() error:" + err.status);
         }
         setIsLoaded(true);
      };

      //
      // MARK: Modal dialog search window
      // ================================
      return (
         <React.Fragment>
            <div className="container is-centered">
               <div className="modal is-active" id="modalSearch">
                  <div className="modal-content is-center">
                     <div className="box" style={{ borderStyle: "solid", width: "640px" }} >
                        <p style={{ fontSize: "20pt" }}>Search</p>
                        <br></br>

                        <div className="field is-grouped">
                           <input
                              className="input is-size-6"
                              id="SearchText"
                              type="text"
                              style={{ width: "530px", height: "35px" }}
                              autoComplete="new-password"
                              value={SearchText}
                              onChange={e => setSearchText(e.target.value)}
                           />

                           <div className="field">
                              <button
                                 className="button is-success"
                                 id="Find"
                                 style={{ width: "50px", height: "35px", marginLeft: "10px" }}
                                 onClick={e => { getRegistrantList(SearchText) }} >
                                 Find
                              </button>
                           </div>
                        </div>

                        <div className="ag-theme-alpine"
                           style={{ height: "550px", width: "590px" }}>
                           <AgGridReact
                              id="AgGridReact"
                              rowData={rowData}
                              columnDefs={columnDefs}
                              onCellClicked={SelectRegistrant} />
                        </div>

                        <br></br>
                        <div className="field">
                           <button
                              className="button is-success"
                              id="closeSearch"
                              style={{ width: "100px" }}
                              onShow={((!IsLoaded) && getRegistrantList(""))}
                              onClick={e => { closeSearch() }} >
                              Close
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </React.Fragment>
      );
   };

   //
   // MARK: closeSearch()
   // ===================
   function closeSearch() {
      if (SearchRegistrant) {
         // Resume selecting a registrant since the Close button was clicked
         // without selecting one from the list.
         setEditingState(editingStates.SELECTING);
         setSearchRegistrant(false);
      } else {
         // These searches only operate when the editing mode is either adding or editing.
         setSearchSupervisingProfessional(false);
         setSearchGuardian(false);
      }
   }

   //
   // MARK: editFormat()
   // ==================
   // Formats the date field from its long display format into its
   // editing DDMMYYYY numeric format.
   //
   function editFormat(inputName, editValue) {
      if (editingState !== editingStates.SELECTING) {
         switch (inputName) {
            case "DateOfBirth":
            case "AnnualRegDatePaid":
            case "TeacherRegDatePaid":
            case "TeacherApprovalDate":
               console.log("onFocus");
               var field = document.getElementById(inputName);
               console.log(field.id + " " + field.value);
               field.value = editValue;
               break;

            default:
               break;
         }
      }
   }

   //
   // MARK: handleAGclick()
   // =====================
   // Processes the selection made in the custom dropdown list box
   // for Ages and Grades.
   //
   const handleAGclick = (style, value) => {
      var ptr = 0;
      if (value !== "") {
         switch (style) {
            case "BR":
               ptr = AG_NR_BR_qwins.indexOf(value);
               if (ptr === -1) {
                  // Insert the new style
                  setAG_NR_BR_qwins(AG_NR_BR_qwins + " " + value);
               } else {
                  // Remove the style
                  setAG_NR_BR_qwins(AG_NR_BR_qwins.replace(value, ""));
               }
               setOpenBR(!openBR);
               break;

            case "LA":
               ptr = AG_NR_LA_qwins.indexOf(value);
               if (ptr === -1) {
                  // Insert the new style
                  setAG_NR_LA_qwins(AG_NR_LA_qwins.trim() + " " + value);
               } else {
                  // Remove the style
                  setAG_NR_LA_qwins(AG_NR_LA_qwins.replace(value, ""));
               }
               setOpenLA(!openLA);
               break;

            case "NV":
               ptr = AGNRNVqwins.indexOf(value);
               if (ptr === -1) {
                  // Insert the new style
                  setAGNRNVqwins(AGNRNVqwins.trim() + " " + value);
               } else {
                  // Remove the style
                  setAGNRNVqwins(AGNRNVqwins.replace(value, ""));
               }
               setOpenNV(!openNV);
               break;

            case "CS":
               ptr = AGNRCSqwins.indexOf(value);
               if (ptr === -1) {
                  // Insert the new style
                  setAGNRCSqwins(AGNRCSqwins.trim() + " " + value);
               } else {
                  // Remove the style
                  setAGNRCSqwins(AGNRCSqwins.replace(value, ""));
               }
               setOpenCS(!openCS);
               break;

            case "AS":
               ptr = AGNRASqwins.indexOf(value);
               if (ptr === -1) {
                  // Insert the new style
                  setAGNRASqwins(AGNRASqwins.trim() + " " + value);
               } else {
                  // Remove the style
                  setAGNRASqwins(AGNRASqwins.replace(value, ""));
               }
               setOpenAS(!openAS);
               break;

            case "AR":
               ptr = AGNRARqwins.indexOf(value);
               if (ptr === -1) {
                  // Insert the new style
                  setAGNRARqwins(AGNRARqwins.trim() + " " + value);
               } else {
                  // Remove the style
                  setAGNRARqwins(AGNRARqwins.replace(value, ""));
               }
               setOpenAR(!openAR);
               break;

            default:
               break;
         }
      }
   };

   //
   // MARK: showAGlists()
   // ===================
   // The Age Groups and Grading drop-down lists for the Non-Registered Qualifying Wins fields
   // are displayed when their button is clicked. This function makes sure that if the user
   // then clicks on another button, any list that is open is closed first before the
   // new list is displayed. If we did not do this, the screen would get cluttered up with
   // multiple open lists.
   //
   function showAGlist(listName) {
      setOpenBR(listName === "BR" && !openBR);
      setOpenLA(listName === "LA" && !openLA);
      setOpenNV(listName === "NV" && !openNV);
      setOpenCS(listName === "CS" && !openCS);
      setOpenAS(listName === "AS" && !openAS);
      setOpenAR(listName === "AR" && !openAR);
   }

   //
   // MARK: BRlist()
   // ==============
   // The Age Groups and grading drop-down list for Non-Registered Qualifying Wins for Ballroom.
   //
   function BRlist() {
      return (
         <React.Fragment>
            <div className="dropdown">
               <ul className="menu"
                  style={{ width: "200px", marginRight: "200px" }}>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("BR", "W")}>
                     Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("BR", "T")}>
                     Tango
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("BR", "SF")}>
                     Slow Foxtrot
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("BR", "Q")}>
                     Quickstep
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("BR", "VW")}>
                     Viennese Waltz
                  </li>
               </ul>
            </div>
         </React.Fragment>
      );
   }

   //
   // MARK: LAlist()
   // ==============
   // The Age Groups and grading drop-down list for Non-Registered Qualifying Wins for Latin American
   //
   function LAlist() {
      return (
         <React.Fragment>
            <div className="dropdown">
               <ul className="menu"
                  style={{ width: "200px", marginRight: "200px" }}>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("LA", "C")}>
                     Cha Cha Cha
                  </li>

                  <li className="menu-item"
                     onClick={(e) => handleAGclick("LA", "S")}>
                     Samba
                  </li>

                  <li className="menu-item"
                     onClick={(e) => handleAGclick("LA", "R")}>
                     Rumba
                  </li>

                  <li className="menu-item"
                     onClick={(e) => handleAGclick("LA", "Pd")}>
                     Paso Doble
                  </li>

                  <li className="menu-item"
                     onClick={(e) => handleAGclick("LA", "J")}>
                     Jive
                  </li>
               </ul>
            </div>
         </React.Fragment>
      );
   }

   //
   // MARK: NVlist()
   // ==============
   // The Age Groups and grading drop-down list for Non-Registered Qualifying Wins for New Vogue
   //
   function NVlist() {
      return (
         <React.Fragment>
            <div className="dropdown">
               <ul className="menu"
                  style={{
                     height: "370px", width: "200px", marginRight: "1000px",
                     overflow: "hidden", "overflowY": "scroll"
                  }}>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "Twi")}>
                     Twilight Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "SW")}>
                     Swing Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "Luc")}>
                     Lucille Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "PW")}>
                     Parma Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "TLW")}>
                     Tracie Leigh Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "PoE")}>
                     Pride of Erin
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "Ch")}>
                     Charmaine
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "M")}>
                     Merrilyn
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "ExS")}>
                     Excelsior Schottische
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "BB")}>
                     Barclay Blues
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "Car")}>
                     Carousel
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "LB")}>
                     La Bomba
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "Tgt")}>
                     Tangoette
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "CT")}>
                     Camelia Tango
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "TT")}>
                     Tango Terrific
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "GT")}>
                     Gypsy Tap
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "E3S")}>
                     Evening Three Step
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("NV", "C3S")}>
                     Canadian Three Step
                  </li>
               </ul>
            </div>
         </React.Fragment>
      );
   }

   //
   // MARK: CSlist()
   // ==============
   // The Age Groups and grading drop-down list for Non-Registered Qualifying Wins for Classical Sequence
   //
   function CSlist() {
      return (
         <React.Fragment>
            <div className="dropdown">
               <ul className="menu"
                  style={{
                     height: "330px", width: "210px", marginRight: "1000px",
                     overflow: "hidden", "overflowY": "scroll"
                  }}>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "LW")}>
                     Lilac Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "OTW")}>
                     Old Time Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "VEL")}>
                     Velenta
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "WC")}>
                     Waltz Camay
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "FW")}>
                     Fylde Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "RET")}>
                     Royal Empress Tango
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "LT")}>
                     Lola Tango
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "TSo")}>
                     Tango Solair
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "TSe")}>
                     Tango Serida
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "TMa")}>
                     Tango Magenta
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "Bal")}>
                     Balmoral Blues
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "BS")}>
                     Britannia Saunter
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "SR")}>
                     Saunter Reve
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "GG")}>
                     Gainsborough Glide
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "LS")}>
                     Latchford Schottische
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "WBG")}>
                     Wedgewood Blue Gavotte
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "LMa")}>
                     La Mascotte
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "MQ")}>
                     Mayfair Quickstep
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "B2S")}>
                     Boston Two Step
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "M2S")}>
                     Military Two Step
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "R2S")}>
                     Rialto Two Step
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "L2S")}>
                     Liberty Two Step
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "W2S")}>
                     Waverly Two Step
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("CS", "P2S")}>
                     Premier Two Step
                  </li>
               </ul>
            </div>
         </React.Fragment>
      );
   }

   //
   // MARK: ASlist()
   // ==============
   // The Age Groups and grading drop-down list for Non-Registered Qualifying Wins for American Smooth.
   //
   function ASlist() {
      return (
         <React.Fragment>
            <div className="dropdown">
               <ul className="menu"
                  style={{ width: "200px", marginRight: "200px" }}>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AS", "SW")}>
                     Smooth Waltz
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AS", "SF")}>
                     Smooth Foxtrot
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AS", "ST")}>
                     Smooth Tango
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AS", "SV")}>
                     Smooth Viennese
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AS", "SQ")}>
                     Smooth Quickstep
                  </li>
               </ul>
            </div>
         </React.Fragment>
      );
   }

   //
   // MARK: ARlist()
   // ==============
   // The Age Groups and grading drop-down list for Non-Registered Qualifying Wins for American Rhythm.
   //
   function ARlist() {
      return (
         <React.Fragment>
            <div className="dropdown">
               <ul className="menu"
                  style={{ width: "200px", marginRight: "200px" }}>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AR", "RC")}>
                     Rhythm ChaCha
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AR", "RR")}>
                     Rhythm Rumba
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AR", "RS")}>
                     Rhythm Swing
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AR", "RB")}>
                     Rhythm Bolero
                  </li>
                  <li className="menu-item"
                     onClick={(e) => handleAGclick("AR", "RM")}>
                     Rhythm Mambo
                  </li>
               </ul>
            </div>
         </React.Fragment>
      );
   }

   //
   //
   // MARK: SetNotes
   // ==============
   function SetNotes(title, notes) {
      setTitle(title);
      setNotes(notes);
      setOverrideNotes(true);
   };

   //
   // MARK: ShowOverrideNotes
   // =======================
   // Displays the entry window use to create notes for Age Group approvals.
   //
   const ShowNotes = () => {
      return (
         <React.Fragment>
            <div className="container">
               <div className="modal is-active" id="overideNotes">
                  <div className="modal-content is-centered">
                     <div className="box" style={{ borderStyle: "solid", height: "700px", width: "625px"}} >
                        <p style={{ fontSize: "20pt" }}>{Title} Override Notes</p>
                        <br></br>

                        <textarea
                           class="textarea has-fixed-size"
                           id="notes"
                           rows = "21"
                           maxLength = {MAX_NOTES_LENGTH}
                           defaultValue = {Notes}
                           onKeyDown={e => {e.stopPropagation()}}
                           >
                        </textarea>

                        <div className="field">
                           <button
                              className="button is-success"
                              id="closeSearch"
                              style={{ width: "100px", marginTop: "15px" }}
                              onClick={e => {updateNotes(document.getElementById("notes").value);
                              }}
                              >
                              Close
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </React.Fragment>
      );
   };

   //
   // MARK: updateNotes()
   // ===================
   function updateNotes(notes) {
      switch (Title) {
         case "Sub-Juvenile":
            setSubJuvenileNote(notes);
            break;

         case "Juvenile":
            setJuvenileNote(notes);
            break;

         case "Junior":
            setJuniorNote(notes);
            break;

         case "Youth":
            setYouthNote(notes);
            break;

         case "Adult":
            setAdultNote(notes);
            break;

         case "Masters 1":
            setMasters1Note(notes);
            break;

         case "Masters 2":
            setMasters2Note(notes);
            break;

         case "Masters 3":
            setMasters3Note(notes);
            break;

         case "Masters 4":
            setMasters4Note(notes);
            break;

         case "Masters 5":
            setMasters5Note(notes);
            break;

         default:
      }
      setOverrideNotes(false);
   }

   //
   // MARK: Main Page Body
   // ====================
   return (
      <section className="hero is-primary is-fullheight has-background-grey-lighter">
         <PageHeader />
         <div className="container is-centered"
            onClick={e => {
               // Catches the mouse click if an Age groups and grading page drop down
               // list is open and the user has clicked somewhere else. This closes
               // the drop down and tidies up.
               if (openBR || openLA || openNV || openCS || openAS || openAR) {
                  showAGlist("");
               }
            }} >
            <section className="has-background-light box"
               style={{ width: "1450px", height: "830px" }} >
               <p className="is-size-3 mx-6 mt-0">
                  Manage Registrant Information {selectionMsg} {FirstName} {LastName}
               </p>

               {/* Modal search dialog windows */}
               {SearchRegistrant || SearchSupervisingProfessional || SearchGuardian ? (
                  <Search />
               ) : null}

               {AddRegistrant ? (
                  <AddRegistrantDialog />
               ) : null}

               {Cancel ? (
                  <CancelDialog />
               ) : null}

               {/*  Main registrant selection section */}
               <section className="section">
                  {/* Enter a registrant ID and load their information */}
                  <div className="field is-grouped mt-0">
                     <div className="field pr-3">
                        <div className="field">
                           <label className="label">
                              Registrant number
                           </label>
                           <div className="field has-addons">
                              <div className="control">
                                 <input className="input"
                                    id="RegistrantID"
                                    tabIndex="-1"
                                    type="number"
                                    style={{ width: "150px", height: "35px" }}
                                    placeholder=""
                                    value={RegistrantID}
                                    onChange={e => setRegistrantID(e.target.value)}
                                    onBlur={e => {
                                       if (e.target.value) {
                                          getRegistrant(RegistrantID, "R");
                                       } else {
                                          setSearchRegistrant(true);
                                       }
                                    }}
                                 />
                              </div>
                              <div className="control">
                                 <span className="button is-success"
                                    id="Search"
                                    style={{ height: "35px" }}
                                    onClick={() => {
                                       console.log("Search: editingState = " + editingState);
                                       if (editingState === editingStates.SELECTING) {
                                          setSearchRegistrant(true);
                                       }
                                    }} >
                                    Search
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Define the individual tab page heading buttons*/}
                  <div className="tabs is-toggle pt-2 pb-2 mb-4">
                     <ul className="tablist">
                        <li data-target="general-details"
                           className="is-active"
                           tabIndex="-1">
                           <a href="#top"
                              style={{ width: "150px" }}
                              onClick={e => switchTab("general-details")}>
                              General Details
                           </a>
                        </li>
                        <li data-target="contact-information"
                           tabIndex="-1">
                           <a href="#top"
                              onClick={e => {
                                 if (editingState !== editingStates.SELECTING) {
                                    switchTab("contact-information");
                                 }
                              }}>
                              Contact information
                           </a>
                        </li>
                        <li data-target="age-groups"
                           tabIndex="-1">
                           <a href="#top"
                              onClick={e => {
                                 if (editingState !== editingStates.SELECTING) {
                                    switchTab("age-groups");
                                 }
                              }}>
                              Age groups and grading
                           </a>
                        </li>
                        <li data-target="professional-details"
                           tabIndex="-1">
                           <a href="#top"
                              onClick={e => {
                                 if ((editingState !== editingStates.SELECTING) && (RegistrantType === "PR")) {
                                    switchTab("professional-details");
                                 }
                              }}>
                              Professional details
                           </a>
                        </li>
                        <li data-target="amateur-teacher"
                           tabIndex="-1">
                           <a href="#top"
                              onClick={e => {
                                 if (((editingState === editingStates.EDITING) || (editingState === editingStates.ADDING)) && AmateurTeacher) {
                                    if (SupervisingProfessionalID.trim() !== "") {
                                       // Refresh the Supervising Professional details. They may have
                                       // changed since this registrant was last edited.
                                       getRegistrant(SupervisingProfessionalID, "SP");
                                    }
                                    switchTab("amateur-teacher");
                                 }
                              }}>
                              Amateur teacher
                           </a>
                        </li>
                        <li data-target="guardian-info"
                           tabIndex="-1">
                           <a href="#top"
                              onClick={e => {
                                 if (((editingState === editingStates.EDITING) || (editingState === editingStates.ADDING)) && CalcAge < 16) {
                                    if (GuardianID !== "") {
                                       // Refresh the guardian details. They may have
                                       // changed since this registrant was last edited.
                                       getRegistrant(GuardianID, "G");
                                    }
                                    switchTab("amateur-teacher");
                                    switchTab("guardian-info");
                                 }
                              }}>
                              Guardian
                           </a>
                        </li>
                        <li data-target="history"
                           tabIndex="-1">
                           <a href="#top"
                              onClick={e => {
                                 if (((editingState === editingStates.EDITING) || (editingState === editingStates.ADDING))) {
                                    switchTab("history");
                                 }
                              }}>
                              History
                           </a>
                        </li>
                     </ul>
                  </div>


                  {/* Define the individual tab content pages*/}
                  <div id="tab-content">
                     {/* GENERAL DETAILS PAGE*/}
                     <div id="general-details">
                        <div className="columns" >
                           {/* LEFT-HAND COLUMN */}
                           <div className="column is-2">
                              {/* Salutation */}
                              <div className="label is-size-6">
                                 <label htmlFor="" className="label">
                                    Salutation or title
                                 </label>
                                 <select
                                    className="select is-size-6"
                                    style={{ width: "180px", height: "35px" }}
                                    id="Salutation"
                                    tabIndex="1"
                                    value={Salutation}
                                    onChange={e => setSalutation(e.target.value)}>
                                    <Salutations />
                                 </select>
                                 <p className="help is-danger is-size-6">{errors.Salutation}&nbsp;</p>
                              </div>

                              {/* Gender */}
                              <div className="field is-size-6">
                                 <label htmlFor="Gender" className="label" style={{ marginTop: "12px" }}>
                                    Gender
                                 </label>
                                 <select
                                    className="select is-size-6"
                                    tabIndex="5"
                                    style={{ width: "180px", height: "35px" }}
                                    id="Gender"
                                    value={Gender}
                                    onChange={e => setGender(e.target.value)}>
                                    <Genders />
                                 </select>
                                 <p className="help is-danger is-size-6">{errors.Gender}&nbsp;</p>
                              </div>

                              {/* Registrant status */}
                              <div className="field is-size-6">
                                 <label htmlFor="" className="label">
                                    Registrant status
                                 </label>
                                 <select
                                    className="select is-size-6"
                                    style={{ width: "180px", height: "35px" }}
                                    id="RegistrantStatus"
                                    tabIndex="9"
                                    value={RegistrantStatus}
                                    onChange={e => setRegistrantStatus(e.target.value)}>
                                    <RegistrantStatuses />
                                 </select>
                                 <p className="help is-danger is-size-6">{errors.RegistrantStatus}&nbsp;</p>
                              </div>

                              {/* Amateur teacher */}
                              <div className="field is-grouped">
                                 <div className="field">
                                    <label className="label is-size-6" style={{ width: "135px", height: "20px", marginTop: "45px" }}>
                                       Amateur teacher
                                    </label>
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AmateurTeacher"
                                       tabIndex="13"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginTop: "50px" }}
                                       value={AmateurTeacher}
                                       checked={AmateurTeacher}
                                       onChange={e => setAmateurTeacher(AmateurTeacher => !AmateurTeacher)}
                                    />
                                 </div>
                                 <p className="help is-danger is-size-6">&nbsp;</p>
                              </div>
                           </div>

                           {/* CENTER COLUMN ONE */}
                           <div className="column is-3">
                              {/* First name */}
                              <div className="field">
                                 <label className="label">
                                    First name
                                 </label>
                                 <input className="input is-size-6"
                                    type="text"
                                    id="FirstName"
                                    tabIndex="2"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    maxLength={25}
                                    value={FirstName}
                                    onChange={e => setFirstName(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.FirstName}&nbsp;</p>
                              </div>

                              {/* Pronouns */}
                              <div className="field">
                                 <label className="label">
                                    Pronouns
                                 </label>
                                 <input className="input is-size-6"
                                    type="text"
                                    tabIndex="6"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    maxLength={20}
                                    value={Pronouns}
                                    onChange={e => setPronouns(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.Pronouns}&nbsp;</p>
                              </div>

                              {/* Registration amount paid and the date it was paid */}
                              <div className="field is-grouped">
                                 <div className="field">
                                    <label className="label is-size-6">
                                       Fee paid
                                    </label>
                                    <input
                                       type="number"
                                       className="input is-size-6"
                                       tabIndex="10"
                                       style={{ width: "110px", height: "35px" }}
                                       value={AnnualRegAmtPaid}
                                       onChange={e => setAnnualRegAmtPaid(e.target.value)}
                                    />
                                    <p className="help is-danger is-size-6">{errors.AnnualRegAmtPaid}&nbsp;</p>
                                 </div>

                                 <div className="field">
                                    <label className="label is-size-6 ml-3">
                                       Date paid
                                    </label>
                                    <input
                                       className="input is-size-6 ml-3"
                                       tabIndex="11"
                                       id="AnnualRegDatePaid"
                                       type="text"
                                       style={{ width: "180px", height: "35px" }}
                                       autoComplete="new-password"
                                       value={editAnnualRegDatePaid}
                                       onFocus={() => editFormat("AnnualRegDatePaid", AnnualRegDatePaid)}
                                       onChange={e => setEditAnnualRegDatePaid(e.target.value)}
                                       onBlur={e => {
                                          if (validateDate("DDMMYYYY", e.target.value)) {
                                             setAnnualRegDatePaid(cleanUpDate(e.target.value) + " ");
                                             setEditAnnualRegDatePaid(formatDate("DD MMMM YYYY", cleanUpDate(e.target.value)));
                                             errors.AnnualRegDatePaid = " ";
                                          } else {
                                             setAnnualRegDatePaid(e.target.value + " ");
                                             errors.AnnualRegDatePaid = "Invalid date entered";
                                          }
                                          setErrors(errors);
                                       }}
                                    />
                                    <p className="help is-danger is-size-6 ml-3">{errors.AnnualRegDatePaid}&nbsp;</p>
                                 </div>
                              </div>

                              {/* Amateur Teacher status */}
                              <div className="field is-size-6">
                                 <label className="label">
                                    Teacher status
                                 </label>
                                 <select className="select is-size-6"
                                    style={{ width: "200px", height: "35px" }}
                                    id="TeacherStatus"
                                    tabIndex="14"
                                    value={TeacherStatus}
                                    onChange={e => setTeacherStatus(e.target.value)}>
                                    <TeacherStatuses />
                                 </select>
                                 <p className="help is-danger is-size-6">{errors.TeacherStatus}&nbsp;</p>
                              </div>
                           </div>

                           {/* CENTER COLUMN TWO */}
                           <div className="column is-3">
                              {/* Middle name */}
                              <div className="field">
                                 <label className="label">
                                    Middle name
                                 </label>
                                 <input
                                    type="text"
                                    className="input is-size-6"
                                    id="MiddleName"
                                    tabIndex="3"
                                    style={{ width: "330px", height: "35px" }}
                                    autoComplete="new-password"
                                    maxLength={25}
                                    value={MiddleName}
                                    onChange={e => setMiddleName(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.MiddleName}&nbsp;</p>
                              </div>

                              <div className="field">
                                 <label className="label">
                                    Studio name
                                 </label>
                                 <input className="input is-size-6"
                                    type="text"
                                    tabIndex="7"
                                    style={{ width: "330px", height: "35px", marginBottom: "32px" }}
                                    autoComplete="new-password"
                                    maxLength={30}
                                    value={StudioName}
                                    onChange={e => setStudioName(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.StudioName}&nbsp;</p>
                              </div>

                              <div className="field is-grouped">
                                 {/* Affiliate */}
                                 <div className="field is-grouped">
                                    <div className="field">
                                       <label className="label is-size-6"
                                          style={{ width: "90px", height: "60px" }}>
                                          Affiliate &nbsp;
                                          <input
                                             type="radio"
                                             name="RegistrantType"
                                             tabIndex="12"
                                             style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                             value={RegistrantType === "AF"}
                                             checked={RegistrantType === "AF"}
                                             onChange={() => setRegistrantType("AF")}
                                          />
                                       </label>
                                    </div>

                                    {/* Solo only */}
                                    <div className="field">
                                       <label className="label is-size-6"
                                          style={{ width: "80px", height: "25px", marginLeft: "35px" }} >
                                          Solo &nbsp;
                                          <input
                                             type="radio"
                                             tabIndex="12"
                                             name="RegistrantType"
                                             style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                             value={RegistrantType === "SO"}
                                             checked={RegistrantType === "SO"}
                                             onChange={() => setRegistrantType("SO")}
                                          />
                                       </label>
                                    </div>

                                    {/* Amateur Dancer */}
                                    <div className="field">
                                       <label className="label is-size-6"
                                          style={{ width: "110px", height: "25px", marginLeft: "7px" }} >
                                          Amateur &nbsp;
                                          <input
                                             type="radio"
                                             name="RegistrantType"
                                             tabIndex="12"
                                             style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                             value={RegistrantType === "AD"}
                                             checked={RegistrantType === "AD"}
                                             onChange={() => setRegistrantType("AD")}
                                          />
                                       </label>
                                    </div>
                                 </div>
                              </div>

                              {/* Registration amount paid and the date it was paid */}
                              <div className="field is-grouped">
                                 <div className="field">
                                    <label className="label is-size-6">
                                       Fee paid
                                    </label>
                                    <input className="input is-size-6"
                                       type="number"
                                       tabIndex="15"
                                       style={{ width: "110px", height: "35px" }}
                                       value={TeacherRegAmtPaid}
                                       onChange={e => setTeacherRegAmtPaid(e.target.value)}
                                    />
                                    <p className="help is-danger is-size-6">{errors.TeacherRegAmtPaid}&nbsp;</p>
                                 </div>

                                 <div className="field">
                                    <label className="label is-size-6 ml-3">
                                       Date paid
                                    </label>
                                    <input
                                       className="input is-size-6 ml-3"
                                       tabIndex="16"
                                       id="TeacherRegDatePaid"
                                       type="text"
                                       style={{ width: "180px", height: "35px" }}
                                       autoComplete="new-password"
                                       value={editTeacherRegDatePaid}
                                       onFocus={() => editFormat("TeacherRegDatePaid", TeacherRegDatePaid)}
                                       onChange={e => setEditTeacherRegDatePaid(e.target.value)}
                                       onBlur={e => {
                                          if (TeacherStatus === "R") {
                                             if (validateDate("DDMMYYYY", e.target.value)) {
                                                setTeacherRegDatePaid(cleanUpDate(e.target.value) + " ");
                                                setEditTeacherRegDatePaid(formatDate("DD MMMM YYYY", cleanUpDate(e.target.value)));
                                                errors.TeacherRegDatePaid = " ";
                                             } else {
                                                setTeacherRegDatePaid(e.target.value + " ");
                                                errors.TeacherRegDatePaid = "Invalid date entered";
                                             }
                                             setErrors(errors);
                                          } else {
                                             setTeacherRegDatePaid("");
                                          }
                                       }}
                                    />
                                    <p className="help is-danger is-size-6 ml-3">{errors.TeacherRegDatePaid}&nbsp;</p>
                                 </div>
                              </div>
                           </div>

                           {/* RIGHT-HAND COLUMN */}
                           <div className="column is-3">
                              {/* Last name */}
                              <div className="field">
                                 <label htmlFor="" className="label">
                                    Last name
                                 </label>
                                 <input className="input is-size-6"
                                    type="text"
                                    id="LastName"
                                    tabIndex="4"
                                    style={{ width: "280px", height: "35px" }}
                                    autoComplete="new-password"
                                    maxLength={30}
                                    value={LastName}
                                    onChange={e => setLastName(e.target.value)}
                                 />
                                 <div className="field is-grouped">
                                    <p className="help is-danger is-size-6">{errors.LastName}&nbsp;</p>
                                    {ShowApproveLastName ? (
                                       <input
                                          type="checkbox"
                                          name="ApproveLastName"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginTop: "8px" }}
                                          value={ApproveLastName === true}
                                          checked={ApproveLastName === true}
                                          onChange={() => setApproveLastName(!ApproveLastName)}
                                       />
                                    ) : null}
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 {/* Date of Birth */}
                                 <div className="field ">
                                    <label className="label is-size-6"
                                       style={{ width: "230px" }} >
                                       Date of birth
                                    </label>
                                    <input className="input is-size-6"
                                       tabIndex="8"
                                       id="DateOfBirth"
                                       type="text"
                                       style={{ width: "180px", height: "35px", marginBottom: "20px" }}
                                       autoComplete="new-password"
                                       value={editDateOfBirth}
                                       onFocus={() => editFormat("DateOfBirth", DateOfBirth)}
                                       onChange={e => setEditDateOfBirth(e.target.value)}
                                       onBlur={e => {
                                          if (validateDate("DDMMYYYY", e.target.value)) {
                                             setDateOfBirth(cleanUpDate(e.target.value) + " ");
                                             setEditDateOfBirth(formatDate("DD MMMM YYYY", cleanUpDate(e.target.value)));
                                             errors.DateOfBirth = " ";
                                          } else {
                                             setDateOfBirth(e.target.value + " ");
                                             errors.DateOfBirth = "Invalid date entered";
                                          }
                                          setErrors(errors);
                                       }}
                                    />
                                    <p className="help is-danger is-size-6">{errors.DateOfBirth}&nbsp;</p>
                                 </div>

                                 {/* Calculated age - this is a read-only field */}
                                 <div className="field">
                                    <label className="label is-size-6">
                                       Age
                                    </label>
                                    <input
                                       className="input is-size-6"
                                       type="text"
                                       readOnly={true}
                                       style={{ width: "50px", height: "35px", marginBottom: "30px" }}
                                       value={CalcAge}
                                    />
                                    <p className="help is-danger is-size-6">&nbsp;</p>
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 {/* Professional */}
                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "75px", height: "25px", marginLeft: "0px" }} >
                                       Pro &nbsp;
                                       <input
                                          type="radio"
                                          tabIndex="12"
                                          name="RegistrantType"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={RegistrantType === "PR"}
                                          checked={RegistrantType === "PR"}
                                          onChange={() => setRegistrantType("PR")}
                                       />
                                    </label>
                                 </div>

                                 {/* Professional dancing with an Amateur */}
                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "100px", height: "25px", marginLeft: "0px" }} >
                                       Pro Am &nbsp;
                                       <input
                                          type="checkbox"
                                          tabIndex="12"
                                          id="IsProAm"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={IsProAm}
                                          checked={IsProAm}
                                          onChange={e => setIsProAm(IsProAm => !IsProAm)}
                                       />
                                    </label>
                                 </div>

                                 {/* Qualified Scrutineer */}
                                 <div className="field is-grouped">
                                    <div className="field">
                                       <label className="label is-size-6"
                                          style={{ width: "110px", height: "20px", marginLeft: "0px" }}>
                                          Scrutineer &nbsp;
                                          <input
                                             type="checkbox"
                                             id="QualifiedScrutineer"
                                             tabIndex="13"
                                             style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                             value={IsQualifiedScrutineer}
                                             checked={IsQualifiedScrutineer}
                                             onChange={e => setIsQualifiedScrutineer(IsQualifiedScrutineer => !IsQualifiedScrutineer)}
                                          />
                                       </label>
                                    </div>
                                    <p className="help is-danger is-size-6">&nbsp;</p>
                                 </div>
                              </div>

                              {/* User authority - administrator or standard user */}
                              <div className="field is-size-6">
                                 <label className="label is-size-6"
                                    style={{ marginTop: "55px" }} >
                                    User authority
                                 </label>
                                 <select
                                    className="select is-size-6"
                                    tabIndex="17"
                                    style={{ width: "180px", height: "32px" }}
                                    id="UserAuthority"
                                    value={UserAuthority}
                                    onChange={e => setUserAuthority(e.target.value)}>
                                    <UserAuthorities />
                                 </select>
                                 <p className="help is-danger is-size-6">{errors.UserAuthority}&nbsp;</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* CONTACT INFORMATION AND ADDRESSES PAGE */}
                     <div className="is-hidden" id="contact-information">
                        <div className="columns">
                           {/* LEFT-HAND COLUMN */}
                           <div className="column">
                              {/* Address line one*/}
                              <div className="field">
                                 <label className="label">
                                    Address line one
                                 </label>
                                 <input className="input"
                                    type="text"
                                    tabIndex="100"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    maxLength={30}
                                    value={Address1}
                                    onChange={e => setAddress1(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.Address1}&nbsp;</p>
                              </div>

                              {/* Post code */}
                              <div className="field">
                                 <label className="label">
                                    Postal code
                                 </label>
                                 <input className="input"
                                    type="text"
                                    maxLength={30}
                                    tabIndex="104"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={Postcode}
                                    onChange={e => setPostcode(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.Postcode}&nbsp;</p>
                              </div>

                              {/* EMAIL ADDRESS (MAIN) */}
                              <div className="field">
                                 <label className="label">
                                    Email address
                                 </label>
                                 <input className="input"
                                    type="text"
                                    maxLength={320}
                                    tabIndex="107"
                                    id="EmailAddress"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={EmailAddress}
                                    onChange={e => setEmailAddress(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.EmailAddress}&nbsp;</p>
                              </div>
                              <div className="field">
                                 <label className="label" style={{ height: "118px" }}>
                                 </label>
                              </div>
                           </div>

                           {/* CENTER-LEFT COLUMN */}
                           <div className="column">
                              <div className="field">
                                 <label className="label">
                                    Address line two
                                 </label>
                                 <input className="input"
                                    type="text"
                                    tabIndex="101"
                                    maxLength={30}
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={Address2}
                                    onChange={e => setAddress2(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.Address2}&nbsp;</p>
                              </div>

                              {/* City name */}
                              <div className="field">
                                 <label className="label">
                                    City
                                 </label>
                                 <input className="input"
                                    type="text"
                                    tabIndex="105"
                                    maxLength={30}
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={City}
                                    onChange={e => setCity(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.City}&nbsp;</p>
                              </div>

                              <div className="field">
                                 <label className="label">
                                    Contact phone number
                                 </label>
                                 <input className="input"
                                    type="text"
                                    tabIndex="108"
                                    maxLength={15}
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={PhoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.PhoneNumber}&nbsp;</p>
                              </div>
                           </div>

                           {/* CENTER-RIGHT COLUMN */}
                           <div className="column">
                              <div className="field">
                                 <label className="label">
                                    Address line three
                                 </label>
                                 <input className="input"
                                    type="text"
                                    tabIndex="102"
                                    maxLength={30}
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={Address3}
                                    onChange={e => setAddress3(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.Address3}&nbsp;</p>
                              </div>

                              {/* Country */}
                              <div className="field">
                                 <label className="label">
                                    Country
                                 </label>
                                 <input className="input"
                                    type="text"
                                    tabIndex="106"
                                    maxLength={30}
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={Country}
                                    onChange={e => setCountry(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.Country}&nbsp;</p>
                              </div>

                              <div className="field is-grouped">
                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "170px", height: "20px", marginLeft: "0px", marginTop: "35px" }}>
                                       Newsletter &nbsp;
                                       <input
                                          type="checkbox"
                                          id="Newsletter"
                                          tabIndex="13"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={Newsletter}
                                          checked={Newsletter}
                                          onChange={() => { setNewsletter(Newsletter => !Newsletter) }}
                                       />
                                    </label>
                                 </div>
                                 <p className="help is-danger is-size-6">&nbsp;</p>
                              </div>
                           </div>

                           {/* RIGHT COLUMN */}
                           <div className="column">
                              <div className="field">
                                 <label className="label">
                                    Suburb
                                 </label>
                                 <input className="input"
                                    type="text"
                                    tabIndex="103"
                                    maxLength={30}
                                    style={{ width: "250px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={Suburb}
                                    onChange={e => setSuburb(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.Suburb}&nbsp;</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* AGE GROUPS AND GRADING PAGE */}
                     <div className="is-hidden" id="age-groups">
                        <div className="columns">
                           {/* LEFT-HAND COLUMN */}
                           <div className="column is-3">
                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ width: "150px", height: "35px" }}>
                                    Age group
                                 </div>
                                 <div className="label">
                                    Override
                                 </div>
                                 <p className="help is-danger">&nbsp;</p>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Sub-Juvenile
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGSubJuvenile"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGSubJuvenile}
                                       checked={AGSubJuvenile}
                                       onChange={() => { setAGSubJuvenile(AGSubJuvenile => !AGSubJuvenile) }}
                                    />
                                 </div>

                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGSubJuvenileOverride"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGSubJuvenileOverride && AGSubJuvenile}
                                       checked={AGSubJuvenileOverride && AGSubJuvenile}
                                       onChange={() => { setAGSubJuvenileOverride(AGSubJuvenileOverride => !AGSubJuvenileOverride) }}
                                    />
                                 </div>

                                 {AGSubJuvenileOverride ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             // MARK: Override
                                             errors.AGSubJuvenileOverride = "";
                                             SetNotes("Sub-Juvenile", SubJuvenileNote);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 { OverrideNotes ? (
                                    <ShowNotes />
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGSubJuvenileOverride}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Juvenile
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGJuvenile"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGJuvenile}
                                       checked={AGJuvenile}
                                       onChange={() => setAGJuvenile(AGJuvenile => !AGJuvenile)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGJuvenileOverride"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGJuvenileOverride && AGJuvenile}
                                       checked={AGJuvenileOverride && AGJuvenile}
                                       onChange={() => setAGJuvenileOverride(AGJuvenileOverride => !AGJuvenileOverride)}
                                    />
                                 </div>

                                 {AGJuvenileOverride ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             // MARK: Override
                                             errors.AGJuvenileOverride = "";
                                             SetNotes("Juvenile", JuvenileNote);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGJuvenileOverride}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Junior
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGJunior"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGJunior}
                                       checked={AGJunior}
                                       onChange={() => setAGJunior(AGJunior => !AGJunior)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGJuniorOverride"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGJuniorOverride && AGJunior}
                                       checked={AGJuniorOverride && AGJunior}
                                       onChange={() => setAGJuniorOverride(AGJuniorOverride => !AGJuniorOverride)}
                                   />
                                 </div>

                                 {AGJuniorOverride ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             // MARK: Override
                                             errors.AGJuniorOverride = "";
                                             SetNotes("Junior", JuniorNote);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGJuniorOverride}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Youth
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGYouth"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGYouth}
                                       checked={AGYouth}
                                       onChange={() => setAGYouth(AGYouth => !AGYouth)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGYouthOverride"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGYouthOverride && AGYouth}
                                       checked={AGYouthOverride && AGYouth}
                                       onChange={() => setAGYouthOverride(AGYouthOverride => !AGYouthOverride)}
                                    />
                                 </div>

                                 {AGYouthOverride ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             // MARK: Override
                                             errors.AGYouthOverride = "";
                                             SetNotes("Youth", YouthNote);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGYouthOverride}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Adult
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGAdult"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGAdult}
                                       checked={AGAdult}
                                       onChange={() => setAGAdult(AGAdult => !AGAdult)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGAdultOverride"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGAdultOverride && AGAdult}
                                       checked={AGAdultOverride && AGAdult}
                                       onChange={() => setAGAdultOverride(AGAdultOverride => !AGAdultOverride)}
                                    />
                                 </div>

                                 {AGAdultOverride ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             // MARK: Override
                                             errors.AGAdultOverride = "";
                                             SetNotes("Adult", AdultNote);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGAdultOverride}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Masters 1
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGMasters1"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGMasters1}
                                       checked={AGMasters1}
                                       onChange={() => setAGMasters1(AGMasters1 => !AGMasters1)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="OverrideApproveMasters1"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGMasters1Override && AGMasters1}
                                       checked={AGMasters1Override && AGMasters1}
                                       onChange={() => setAGMasters1Override(AGMasters1Override => !AGMasters1Override)}
                                    />
                                 </div>

                                 {AGMasters1Override ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             // MARK: Override
                                             errors.AGMasters1Override = "";
                                             SetNotes("Masters 1", Masters1Note);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGMasters1Override}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Masters 2
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="IsMasters2"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGMasters2}
                                       checked={AGMasters2}
                                       onChange={() => setAGMasters2(AGMasters2 => !AGMasters2)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="OverrideApproveMasters2"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGMasters2Override && AGMasters2}
                                       checked={AGMasters2Override && AGMasters2}
                                       onChange={() => setAGMasters2Override(AGMasters2Override => !AGMasters2Override)}
                                    />
                                 </div>

                                 {AGMasters2Override ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             // MARK: Override
                                             errors.AGMasters2Override = "";
                                             SetNotes("Masters 2", Masters2Note);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGMasters2Override}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Masters 3
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGMasters3"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGMasters3}
                                       checked={AGMasters3}
                                       onChange={() => setAGMasters3(AGMasters3 => !AGMasters3)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGMasters3Override"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGMasters3Override && AGMasters3}
                                       checked={AGMasters3Override && AGMasters3}
                                       onChange={() => setAGMasters3Override(AGMasters3Override => !AGMasters3Override)}
                                    />
                                 </div>

                                 {AGMasters3Override ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             errors.AGMasters2Override = "";
                                             SetNotes("Masters 3", Masters3Note);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGMasters3Override}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Masters 4
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGMasters4"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGMasters4}
                                       checked={AGMasters4}
                                       onChange={() => setAGMasters4(AGMasters4 => !AGMasters4)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="OverrideApproveMasters4"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGMasters4Override && AGMasters4}
                                       checked={AGMasters4Override && AGMasters4}
                                       onChange={() => setAGMasters4Override(AGMasters4Override => !AGMasters4Override)}
                                    />
                                 </div>

                                 {AGMasters4Override ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             errors.AGMasters4Override = "";
                                             SetNotes("Masters 4", Masters4Note);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}
                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGMasters4Override}</p>
                                 </div>
                              </div>

                              <div className="field is-grouped"
                                 style={{ height: "25px" }}>
                                 <div className="label"
                                    style={{ width: "120px", height: "20px" }}>
                                    Masters 5
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGMasters5"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={AGMasters5}
                                       checked={AGMasters5}
                                       onChange={() => setAGMasters5(AGMasters5 => !AGMasters5)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       id="AGMasters5Override"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "30px" }}
                                       value={AGMasters5Override && AGMasters5}
                                       checked={AGMasters5Override && AGMasters5}
                                       onChange={() => setAGMasters5Override(AGMasters5Override => !AGMasters5Override)}
                                    />
                                 </div>

                                 {AGMasters5Override ? (
                                    <div className="field">
                                       <img src={overrideImage}
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "10px" }}
                                          alt="override reason"
                                          href="#top"
                                          onClick={() => {
                                             // MARK: Override
                                             errors.AGMasters5Override = "";
                                             SetNotes("Masters 5", Masters5Note);
                                             }
                                          }
                                       />
                                    </div>
                                 ) : null}

                                 <div className="field">
                                    <p className="help is-danger is-size-6">&nbsp;{errors.AGMasters5Override}</p>
                                 </div>
                              </div>
                              <div className="label" style={{ height: "14px" }}>
                                 &nbsp;
                              </div>
                           </div>

                           <div className="column" >
                              <div className="field is-grouped">
                                 <div className="label" style={{ width: "185px", height: "8px" }}>
                                    Dance Style
                                 </div>
                                 <div className="label" style={{ width: "160px", height: "8px" }}>
                                    Registered
                                 </div>
                                 <div className="label" style={{ width: "155px", height: "8px" }}>
                                    Pro/Am
                                 </div>
                                 <div className="label" style={{ width: "90px", height: "8px" }}>
                                    Solo
                                 </div>
                                 <div className="label" style={{ width: "200px", height: "8px", marginLeft: "20px" }}>
                                    Non-Registered
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label" style={{ width: "65px", height: "8px", marginLeft: "170px" }}>
                                    Grades
                                 </div>
                                 <div className="label" style={{ width: "40px", height: "8px", marginLeft: "5px" }}>
                                    Wins
                                 </div>
                                 <div className="label" style={{ width: "65px", height: "8px", marginLeft: "35px" }}>
                                    Grades
                                 </div>
                                 <div className="label" style={{ width: "40px", height: "8px", marginLeft: "5px" }}>
                                    Wins
                                 </div>
                                 <div className="label" style={{ width: "65px", height: "8px", marginLeft: "35px" }}>
                                    Grades
                                 </div>
                                 <div className="label" style={{ width: "75px", height: "8px", marginLeft: "5px" }}>
                                    Wins
                                 </div>
                                 <div className="label" style={{ width: "200px", height: "8px", marginLeft: "5px" }}>
                                    Qualifying Wins
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "170px" }}>
                                    Ballroom
                                 </div>
                                 <div className="field">
                                    <input className="input"
                                       id="AG_Reg_BR_grade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AG_Reg_BR_grade}
                                       onChange={e => setAG_Reg_BR_grade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_Reg_BR_wins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AG_Reg_BR_wins}
                                       onChange={e => setAG_Reg_BR_wins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_PA_BR_grade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AG_PA_BR_grade}
                                       onChange={e => setAG_PA_BR_grade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_PA_BR_wins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AG_PA_BR_wins}
                                       onChange={e => setAG_PA_BR_wins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_SL_BR_grade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AG_SL_BR_grade}
                                       onChange={e => setAG_SL_BR_grade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_SL_BR_wins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AG_SL_BR_wins}
                                       onChange={e => setAG_SL_BR_wins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_NR_BR_qwins"
                                       type="text"
                                       readOnly={true}
                                       maxLength={200}
                                       style={{ width: "350px", height: "23px", marginLeft: "30px" }}
                                       autoComplete="new-password"
                                       value={AG_NR_BR_qwins}

                                    />
                                 </div>

                                 <div>
                                    <button className="button"
                                       type="submit"
                                       id="AGNRBRlookup"
                                       style={{ width: "23px", height: "23px", fontWeight: "bolder" }}
                                       onClick={(e) => showAGlist("BR")}>
                                       v
                                    </button>
                                    {openBR ? (
                                       <BRlist />
                                    ) : null}
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "170px" }}>
                                    Latin American
                                 </div>
                                 <div className="field">
                                    <input className="input"
                                       id="AG_Reg_LA_grade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AG_Reg_LA_grade}
                                       onChange={e => setAG_Reg_LA_grade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_Reg_LA_wins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AG_Reg_LA_wins}
                                       onChange={e => setAG_Reg_LA_wins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_PA_LA_grade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AG_PA_LA_grade}
                                       onChange={e => setAG_PA_LA_grade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_PA_LA_wins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AG_PA_LA_wins}
                                       onChange={e => setAG_PA_LA_wins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_SL_LA_grade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AG_SL_LA_grade}
                                       onChange={e => setAG_SL_LA_grade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_SL_LA_wins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AG_SL_LA_wins}
                                       onChange={e => setAG_SL_LA_wins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AG_NR_LA_qwins"
                                       type="text"
                                       readOnly={true}
                                       maxLength={200}
                                       style={{ width: "350px", height: "23px", marginLeft: "30px" }}
                                       autoComplete="new-password"
                                       value={AG_NR_LA_qwins}
                                    />
                                 </div>
                                 <div>
                                    <button className="button"
                                       type="submit"
                                       id="AGNRLatinlookup"
                                       style={{ width: "23px", height: "23px", fontWeight: "bolder" }}
                                       onClick={(e) => showAGlist("LA")}>
                                       v
                                    </button>
                                    {openLA ? (
                                       <LAlist />
                                    ) : null}
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "170px" }}>
                                    New Vogue
                                 </div>
                                 <div className="field">
                                    <input className="input"
                                       id="AGRegNVgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGRegNVgrade}
                                       onChange={e => setAGRegNVgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGRegNVwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGRegNVwins}
                                       onChange={e => setAGRegNVwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGPANVgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGPANVgrade}
                                       onChange={e => setAGPANVgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGPANVwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGPANVwins}
                                       onChange={e => setAGPANVwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGSLNVgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGSLNVgrade}
                                       onChange={e => setAGSLNVgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGSLNVwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGSLNVwins}
                                       onChange={e => setAGSLNVwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGNRNVqwins"
                                       type="text"
                                       readOnly={true}
                                       maxLength={200}
                                       style={{ width: "350px", height: "23px", marginLeft: "30px" }}
                                       autoComplete="new-password"
                                       value={AGNRNVqwins}
                                    />
                                 </div>
                                 <div>
                                    <button className="button"
                                       type="submit"
                                       id="AGNRNewVoguelookup"
                                       style={{ width: "23px", height: "23px", fontWeight: "bolder" }}
                                       onClick={(e) => showAGlist("NV")}>
                                       v
                                    </button>
                                    {openNV ? (
                                       <NVlist />
                                    ) : null}
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "170px" }}>
                                    Classical Sequence
                                 </div>
                                 <div className="field">
                                    <input className="input"
                                       id="AGRegCSgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGRegCSgrade}
                                       onChange={e => setAGRegCSgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGRegCSwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGRegCSwins}
                                       onChange={e => setAGRegCSwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGPACSgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGPACSgrade}
                                       onChange={e => setAGPACSgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGPACSwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGPACSwins}
                                       onChange={e => setAGPACSwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGSLCSgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGSLCSgrade}
                                       onChange={e => setAGSLCSgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGSLCSwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGSLCSwins}
                                       onChange={e => setAGSLCSwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGNRCSqwins"
                                       type="text"
                                       readOnly={true}
                                       maxLength={200}
                                       style={{ width: "350px", height: "23px", marginLeft: "30px" }}
                                       autoComplete="new-password"
                                       value={AGNRCSqwins}
                                    />
                                 </div>

                                 <div>
                                    <button className="button"
                                       type="submit"
                                       id="AGNRCSlookup"
                                       style={{ width: "23px", height: "23px", fontWeight: "bolder" }}
                                       onClick={(e) => showAGlist("CS")}>
                                       v
                                    </button>
                                    {openCS ? (
                                       <CSlist />
                                    ) : null}
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "170px" }}>
                                    American Smooth
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGRegASgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGRegASgrade}
                                       onChange={e => setAGRegASgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGRegASwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGRegASwins}
                                       onChange={e => setAGRegASwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGPAASgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGPAASgrade}
                                       onChange={e => setAGPAASgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGPAASwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGPAASwins}
                                       onChange={e => setAGPAASwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGSLASgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGSLASgrade}
                                       onChange={e => setAGSLASgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGSLASwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGSLASwins}
                                       onChange={e => setAGSLASwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGNRASqwins"
                                       type="text"
                                       readOnly={true}
                                       maxLength={200}
                                       style={{ width: "350px", height: "23px", marginLeft: "30px" }}
                                       autoComplete="new-password"
                                       value={AGNRASqwins}
                                    />
                                 </div>

                                 <div>
                                    <button className="button"
                                       type="submit"
                                       id="AGNRASlookup"
                                       style={{ width: "23px", height: "23px", fontWeight: "bolder" }}
                                       onClick={(e) => showAGlist("AS")}>
                                       v
                                    </button>
                                    {openAS ? (
                                       <ASlist />
                                    ) : null}
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "170px" }}>
                                    American Rhythm
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGRegARgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGRegARgrade}
                                       onChange={e => setAGRegARgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGRegARwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGRegARwins}
                                       onChange={e => setAGRegARwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGPAARgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGPAARgrade}
                                       onChange={e => setAGPAARgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGPAARwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGPAARwins}
                                       onChange={e => setAGPAARwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGSLARgrade"
                                       type="text"
                                       maxLength={5}
                                       style={{ width: "50px", height: "23px", marginLeft: "30px", textAlign: "center" }}
                                       autoComplete="new-password"
                                       value={AGSLARgrade}
                                       onChange={e => setAGSLARgrade(e.target.value.toUpperCase())}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGSLARwins"
                                       type="number"
                                       style={{ width: "50px", height: "23px", marginLeft: "15px", textAlign: "right" }}
                                       autoComplete="new-password"
                                       value={AGSLARwins}
                                       onChange={e => setAGSLARwins(minMax(0, 100, e.target.value))}
                                    />
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="AGNRARqwins"
                                       type="text"
                                       readOnly={true}
                                       maxLength={200}
                                       style={{ width: "350px", height: "23px", marginLeft: "30px" }}
                                       autoComplete="new-password"
                                       value={AGNRARqwins}
                                    />
                                 </div>

                                 <div>
                                    <button className="button"
                                       type="submit"
                                       id="AGNRARlookup"
                                       style={{ width: "23px", height: "23px", fontWeight: "bolder" }}
                                       onClick={(e) => showAGlist("AR")}>
                                       v
                                    </button>
                                    {openAR ? (
                                       <ARlist />
                                    ) : null}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* PROFESSIONAL DETAILS PAGE */}
                     <div className="is-hidden" id="professional-details">
                        <div className="columns">
                           {/* COLUMN ONE*/}
                           <div className="column">
                              <div className="label is-size-6"
                                 style={{ width: "210px", height: "35px" }}>
                                 New Zealand Registration :
                              </div>

                              <div className="field is-grouped">
                                 {/* Qualified professional */}
                                 <div className="label is-size-6"
                                    style={{ width: "210px", height: "25px" }}>
                                    Qualified professional
                                 </div>
                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "70px", height: "20px" }}>
                                       Yes &nbsp;
                                       <input
                                          type="radio"
                                          name="NZQualifiedProfessional"
                                          tabIndex="301"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={NZQualifiedProfessional === true}
                                          checked={NZQualifiedProfessional === true}
                                          onChange={() => setNZQualifiedProfessional(true)}
                                       />
                                    </label>
                                 </div>

                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "70px", height: "20px" }}>
                                       No &nbsp;
                                       <input
                                          type="radio"
                                          name="NZQualifiedProfessional"
                                          tabIndex="302"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={NZQualifiedProfessional === false}
                                          checked={NZQualifiedProfessional === false}
                                          onChange={() => setNZQualifiedProfessional(false)}
                                       />
                                    </label>
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label is-size-6"
                                    style={{ width: "210px", height: "40px" }}>
                                    Qualified scrutineer
                                 </div>
                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "70px", height: "20px" }}>
                                       Yes &nbsp;
                                       <input
                                          type="radio"
                                          name="NZQualifierScrutineer"
                                          tabIndex="303"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={NZQualifierScrutineer === true}
                                          checked={NZQualifierScrutineer === true}
                                          onChange={() => setNZQualifierScrutineer(true)}
                                       />
                                    </label>
                                 </div>
                                 <div className="field">
                                    <label htmlFor="Qualified scrutineer"
                                       className="label is-size-6"
                                       style={{ width: "70px", height: "20px" }}>
                                       No &nbsp;
                                       <input
                                          type="radio"
                                          name="NZQualifierScrutineer"
                                          tabIndex="304"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={NZQualifierScrutineer === false}
                                          checked={NZQualifierScrutineer === false}
                                          onChange={() => setNZQualifierScrutineer(false)}
                                       />
                                    </label>
                                 </div>
                              </div>

                              <div className="label is-size-6"
                                 style={{ width: "210px", height: "35px" }}>
                                 International Registration :
                              </div>

                              <div className="field is-grouped">
                                 {/* Qualified professional */}
                                 <div className="label is-size-6"
                                    style={{ width: "210px", height: "25px" }}>
                                    Qualified professional
                                 </div>
                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "70px", height: "20px" }}>
                                       Yes &nbsp;
                                       <input
                                          type="radio"
                                          name="IntQualifiedProfessional"
                                          tabIndex="301"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={IntQualifiedProfessional === true}
                                          checked={IntQualifiedProfessional === true}
                                          onChange={() => setIntQualifiedProfessional(true)}
                                       />
                                    </label>
                                 </div>
                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "70px", height: "20px" }}>
                                       No &nbsp;
                                       <input
                                          type="radio"
                                          name="IntQualifiedProfessional"
                                          tabIndex="302"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={IntQualifiedProfessional === false}
                                          checked={IntQualifiedProfessional === false}
                                          onChange={() => setIntQualifiedProfessional(false)}
                                       />
                                    </label>
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label is-size-6"
                                    style={{ width: "210px", height: "30px" }}>
                                    Qualified scrutineer
                                 </div>
                                 <div className="field">
                                    <label className="label is-size-6"
                                       style={{ width: "70px", height: "20px" }}>
                                       Yes &nbsp;
                                       <input
                                          type="radio"
                                          name="IntQualifiedScrutineer"
                                          tabIndex="303"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={IntQualifiedScrutineer === true}
                                          checked={IntQualifiedScrutineer === true}
                                          onChange={() => setIntQualifiedScrutineer(true)}
                                       />
                                    </label>
                                 </div>
                                 <div className="field">
                                    <label htmlFor="Qualified scrutineer"
                                       className="label is-size-6"
                                       style={{ width: "70px", height: "30px" }}>
                                       No &nbsp;
                                       <input
                                          type="radio"
                                          name="IntQualifiedScrutineer"
                                          tabIndex="304"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={IntQualifiedScrutineer === false}
                                          checked={IntQualifiedScrutineer === false}
                                          onChange={() => setIntQualifiedScrutineer(false)}
                                       />
                                    </label>
                                 </div>
                              </div>

                              {/* Internationally qualified */}
                              <div className="field is-grouped">
                                 <div className="label is-size-6"
                                    style={{ width: "210px", height: "20px" }}>
                                    Country qualified in
                                 </div>
                                 <select
                                    className="select is-size-6"
                                    style={{ width: "150px", height: "25px" }}
                                    id="IntCountryQualified"
                                    tabIndex="305"
                                    value={IntCountryQualified}
                                    onChange={e => setIntCountryQualified(e.target.value)}>
                                    <Countries />
                                 </select>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ width: "70px", height: "20px", marginLeft: "210px" }}>
                                    Dancer
                                 </div>

                                 <div className="label"
                                    style={{ width: "100px", height: "20px" }}>
                                    Adjudicator
                                 </div>

                                 <div className="label"
                                    style={{ width: "100px", height: "20px" }}>
                                    Chairperson
                                 </div>
                              </div>

                              {/* World Dance Council registered*/}
                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ width: "230px", height: "25px", marginTop: "0px" }}>
                                    World Dance Council
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       name="WDCdancer"
                                       tabIndex="306"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={WDCdancer}
                                       checked={WDCdancer}
                                       onChange={() => setWDCdancer(WDCdancer => !WDCdancer)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       name="WDCadjudicator"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "68px" }}
                                       value={WDCadjudicator}
                                       checked={WDCadjudicator}
                                       onChange={() => setWDCadjudicator(WDCadjudicator => !WDCadjudicator)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       name="WDCchairperson"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "75px" }}
                                       value={WDCchairperson}
                                       checked={WDCchairperson}
                                       onChange={() => setWDCchairperson(WDCchairperson => !WDCchairperson)}
                                    />
                                 </div>
                              </div>

                              {/* World Dance Organisation Registered*/}
                              <div className="field is-grouped"
                                 style={{ height: "25px" }} >
                                 <div className="label"
                                    style={{ width: "230px", height: "10px", marginBottom: "0px" }}>
                                    World Dance Organisation
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       name="WDOdancer"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                       value={WDOdancer}
                                       checked={WDOdancer}
                                       onChange={() => setWDOdancer(WDOdancer => !WDOdancer)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       name="WDOadjudicator"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "68px" }}
                                       value={WDOadjudicator}
                                       checked={WDOadjudicator}
                                       onChange={() => setWDOadjudicator(WDOadjudicator => !WDOadjudicator)}
                                    />
                                 </div>
                                 <div className="field">
                                    <input
                                       type="checkbox"
                                       name="WDOchairperson"
                                       style={{ width: "20px", height: "20px", verticalAlign: "middle", marginLeft: "75px" }}
                                       value={WDOchairperson}
                                       checked={WDOchairperson}
                                       onChange={() => setWDOchairperson(WDOchairperson => !WDOchairperson)}
                                    />
                                 </div>
                              </div>
                           </div>

                           {/* COLUMN TWO */}
                           <div className="column">
                              <div className="field is-grouped">
                                 <div className="label" style={{ height: "20px", width: "200px" }}>
                                    Styles and Levels :
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label" style={{ width: "90px", marginLeft: "200px" }}>
                                    Associate
                                 </div>
                                 <div className="label" style={{ width: "100px" }}>
                                    Licentiate
                                 </div>
                                 <div className="label" style={{ width: "80px" }}>
                                    Fellow
                                 </div>
                                 <div className="label" style={{ width: "85px" }}>
                                    Examiner
                                 </div>
                                 <div className="label" style={{ width: "105px" }}>
                                    Adjudicator
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "150px" }}>
                                    Ballroom
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "75px" }}>
                                       <input
                                          type="radio"
                                          id="PSLBR"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLBR === "A"}
                                          checked={PSLBR === "A"}
                                          onChange={() => setPSLBR("A")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLBR"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLBR === "L"}
                                          checked={PSLBR === "L"}
                                          onChange={() => setPSLBR("L")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLBR"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLBR === "F"}
                                          checked={PSLBR === "F"}
                                          onChange={() => setPSLBR("F")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLBR"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLBR === "E"}
                                          checked={PSLBR === "E"}
                                          onChange={() => setPSLBR("E")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="PSLadjudicatorBR"
                                       type="text"
                                       maxLength={1}
                                       style={{ width: "50px", height: "23px", textAlign: "center", marginLeft: "55px" }}
                                       autoComplete="new-password"
                                       value={PSLadjudicatorBR}
                                       onChange={e => setPSLadjudicatorBR(e.target.value.toUpperCase())}
                                    />
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "150px" }}>
                                    Latin American
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "75px" }}>
                                       <input
                                          type="radio"
                                          id="PSLLA"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLLA === "A"}
                                          checked={PSLLA === "A"}
                                          onChange={() => setPSLLA("A")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLLA"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLLA === "L"}
                                          checked={PSLLA === "L"}
                                          onChange={() => setPSLLA("L")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLLA"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLLA === "F"}
                                          checked={PSLLA === "F"}
                                          onChange={() => setPSLLA("F")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLLA"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLLA === "E"}
                                          checked={PSLLA === "E"}
                                          onChange={() => setPSLLA("E")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="PSLadjudicatorLA"
                                       type="text"
                                       maxLength={1}
                                       style={{ width: "50px", height: "23px", textAlign: "center", marginLeft: "55px" }}
                                       autoComplete="new-password"
                                       value={PSLadjudicatorLA}
                                       onChange={e => setPSLadjudicatorLA(e.target.value.toUpperCase())}
                                    />
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "150px" }}>
                                    New Vogue
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "75px" }}>
                                       <input
                                          type="radio"
                                          id="PSLNV"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLNV === "A"}
                                          checked={PSLNV === "A"}
                                          onChange={() => setPSLNV("A")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLNV"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLNV === "L"}
                                          checked={PSLNV === "L"}
                                          onChange={() => setPSLNV("L")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLNV"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLNV === "F"}
                                          checked={PSLNV === "F"}
                                          onChange={() => setPSLNV("F")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLNV"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLNV === "E"}
                                          checked={PSLNV === "E"}
                                          onChange={() => setPSLNV("E")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="PSLadjudicatorNV"
                                       type="text"
                                       maxLength={1}
                                       style={{ width: "50px", height: "23px", textAlign: "center", marginLeft: "55px" }}
                                       autoComplete="new-password"
                                       value={PSLadjudicatorNV}
                                       onChange={e => setPSLadjudicatorNV(e.target.value.toUpperCase())}
                                    />
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "150px" }}>
                                    Classical Sequence
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "75px" }}>
                                       <input
                                          type="radio"
                                          id="PSLCS"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLCS === "A"}
                                          checked={PSLCS === "A"}
                                          onChange={() => setPSLCS("A")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLCS"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLCS === "L"}
                                          checked={PSLCS === "L"}
                                          onChange={() => setPSLCS("L")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLCS"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLCS === "F"}
                                          checked={PSLCS === "F"}
                                          onChange={() => setPSLCS("F")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLCS"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLCS === "E"}
                                          checked={PSLCS === "E"}
                                          onChange={() => setPSLCS("E")}
                                       />
                                    </div>
                                 </div>
                                 <div className="field">
                                    <input className="input"
                                       id="PSLadjudicatorCS"
                                       type="text"
                                       maxLength={1}
                                       style={{ width: "50px", height: "23px", textAlign: "center", marginLeft: "55px" }}
                                       autoComplete="new-password"
                                       value={PSLadjudicatorCS}
                                       onChange={e => setPSLadjudicatorCS(e.target.value.toUpperCase())}
                                    />
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "150px" }}>
                                    American Smooth
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "75px" }}>
                                       <input
                                          type="radio"
                                          id="PSLAS"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLAS === "A"}
                                          checked={PSLAS === "A"}
                                          onChange={() => setPSLAS("A")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLAS"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLAS === "L"}
                                          checked={PSLAS === "L"}
                                          onChange={() => setPSLAS("L")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLAS"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLAS === "F"}
                                          checked={PSLAS === "F"}
                                          onChange={() => setPSLAS("F")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLAS"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLAS === "E"}
                                          checked={PSLAS === "E"}
                                          onChange={() => setPSLAS("E")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="PSLadjudicatorAS"
                                       type="text"
                                       maxLength={1}
                                       style={{ width: "50px", height: "23px", textAlign: "center", marginLeft: "55px" }}
                                       autoComplete="new-password"
                                       value={PSLadjudicatorAS}
                                       onChange={e => setPSLadjudicatorAS(e.target.value.toUpperCase())}
                                    />
                                 </div>
                              </div>

                              <div className="field is-grouped">
                                 <div className="label"
                                    style={{ height: "28px", width: "150px" }}>
                                    American Rhythm
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "75px" }}>
                                       <input
                                          type="radio"
                                          id="PSLAR"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLAR === "A"}
                                          checked={PSLAR === "A"}
                                          onChange={() => setPSLAR("A")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLAR"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLAR === "L"}
                                          checked={PSLAR === "L"}
                                          onChange={() => setPSLAR("L")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLAR"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLAR === "F"}
                                          checked={PSLAR === "F"}
                                          onChange={() => setPSLAR("F")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <div style={{ marginLeft: "70px" }}>
                                       <input
                                          type="radio"
                                          id="PSLAR"
                                          style={{ width: "20px", height: "20px", verticalAlign: "middle" }}
                                          value={PSLAR === "E"}
                                          checked={PSLAR === "E"}
                                          onChange={() => setPSLAR("E")}
                                       />
                                    </div>
                                 </div>

                                 <div className="field">
                                    <input className="input"
                                       id="PSLadjudicatorAR"
                                       type="text"
                                       maxLength={1}
                                       style={{ width: "50px", height: "23px", textAlign: "center", marginLeft: "55px" }}
                                       autoComplete="new-password"
                                       value={PSLadjudicatorAR}
                                       onChange={e => setPSLadjudicatorAR(e.target.value.toUpperCase())}
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* AMATEUR TEACHER */}
                     <div className="is-hidden" id="amateur-teacher">
                        <div className="columns">
                           {/* LEFT-HAND COLUMN */}
                           <div className="column">
                              {/* Supervising Professional */}
                              <div className="field">
                                 <label htmlFor="" className="label is-size-6">
                                    Supervising Professional
                                 </label>
                                 <div className="field has-addons">
                                    <input
                                       className="input is-size-6"
                                       id="SupervisingProfessionalID"
                                       type="text"
                                       style={{ width: "180px", height: "35px" }}
                                       autoComplete="new-password"
                                       value={SupervisingProfessionalID}
                                       onChange={e => {
                                          setSupervisingProfessionalID(e.target.value);
                                       }}
                                    />

                                    <div className="control">
                                       <button className="button is-success is-size-6"
                                          id="findSupervisingProfessional"
                                          style={{ height: "35px" }}
                                          onClick={e => {
                                             setSearchSupervisingProfessional(true);
                                          }}>
                                          Find
                                       </button>
                                    </div>
                                 </div>
                                 <p className="help is-danger is-size-6">{errors.SupervisingProfessionalID}&nbsp;</p>
                              </div>

                              {/* Amateur Teacher Approval Date */}
                              <div className="field">
                                 <label htmlFor="" className="label is-size-6">
                                    Teacher approval date
                                 </label>
                                 <input className="input"
                                    type="text"
                                    id="TeacherApprovalDate"
                                    style={{ width: "180px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={editTeacherApprovalDate}
                                    onFocus={() => editFormat("TeacherApprovalDate", TeacherApprovalDate)}
                                    onChange={e => setEditTeacherApprovalDate(e.target.value)}
                                    onBlur={e => {
                                       if (validateDate("DDMMYYYY", e.target.value)) {
                                          setTeacherApprovalDate(cleanUpDate(e.target.value) + " ");
                                          setEditTeacherApprovalDate(formatDate("DD MMMM YYYY", cleanUpDate(e.target.value)));
                                          errors.TeacherApprovalDate = "";
                                       } else {
                                          setTeacherApprovalDate(e.target.value + " ");
                                          errors.TeacherApprovalDate = "Invalid date entered";
                                       }
                                       setErrors(errors);
                                    }}
                                 />
                              </div>
                              <p className="help is-danger is-size-6">{errors.TeacherApprovalDate}&nbsp;</p>

                              {/* RA_BRD can we replace this label with a margin setting? */}
                              <div className="label" style={{ height: "223px" }}>
                                 &nbsp;
                              </div>
                           </div>

                           <div className="column">
                              {/* Supervising Professional name */}
                              <div className="field">
                                 <label className="label is-size-6" htmlFor="SupervisingProfessionalName" >
                                    Name of Supervising Professional
                                 </label>
                                 <input
                                    className="input is-size-6"
                                    id="SupervisingProfessionalName"
                                    type="text"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={SupervisingProfessionalName}
                                    onChange={e => setSupervisingProfessionalName(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.SupervisingProfessionalName}&nbsp;</p>
                              </div>
                           </div>

                           <div className="column">
                              {/* Supervising Professional phone */}
                              <div className="field">
                                 <label className="label is-size-6" htmlFor="SupervisingProfessionalPhone" >
                                    Supervising Professional phone
                                 </label>
                                 <input
                                    className="input is-size-6"
                                    id="SupervisingProfessionalPhone"
                                    type="text"
                                    maxLength={15}
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={SupervisingProfessionalPhone}
                                    onChange={e => setSupervisingProfessionalPhone(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.SupervisingProfessionalPhone}&nbsp;</p>
                              </div>
                           </div>

                           <div className="column">
                              {/* Supervising Professional phone */}
                              <div className="field">
                                 <label className="label is-size-6" htmlFor="SupervisingProfessionalPhone" >
                                    Supervising Professional email
                                 </label>
                                 <input
                                    className="input is-size-6"
                                    id="SupervisingProfessionalEmailAddress"
                                    type="text"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={SupervisingProfessionalEmailAddress}
                                    onChange={e => setSupervisingProfessionalEmailAddress(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.SupervisingProfessionalEmailAddress}&nbsp;</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* GUARDIAN */}
                     <div className="is-hidden" id="guardian-info">
                        <div className="columns">
                           {/* LEFT-HAND COLUMN */}
                           <div className="column">
                              {/* Guardian ID */}
                              <div className="field">
                                 <label className="label is-size-6">
                                    Guardian ID
                                 </label>
                                 <div className="field has-addons">
                                    <input className="input is-size-6"
                                       id="GuardianID"
                                       type="number"
                                       style={{ width: "180px", height: "35px" }}
                                       autoComplete="new-password"
                                       value={GuardianID}
                                       onChange={e => {
                                          setGuardianID(e.target.value);
                                       }}
                                    />
                                    <div className="control">
                                       <button className="button is-success is-size-6"
                                          id="findGuardian"
                                          style={{ height: "35px" }}
                                          onClick={e => {
                                             setSearchGuardian(true)
                                          }}>
                                          Find
                                       </button>
                                    </div>
                                 </div>
                                 <p className="help is-danger is-size-6">{errors.GuardianID}&nbsp;</p>
                              </div>

                              <div className="label" style={{ height: "325px" }}>
                                 &nbsp;
                              </div>
                           </div>

                           <div className="column">
                              {/* Guardian name */}
                              <div className="field">
                                 <label className="label is-size-6">
                                    Guardian name
                                 </label>
                                 <input className="input is-size-6"
                                    id="GuardianName"
                                    type="text"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={GuardianName}
                                    onChange={e => setGuardianName(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.GuardianName}&nbsp;</p>
                              </div>
                           </div>

                           <div className="column">
                              {/* Guardian phone */}
                              <div className="field">
                                 <label className="label is-size-6">
                                    Guardian phone number
                                 </label>
                                 <input
                                    className="input is-size-6"
                                    id="GuardianPhone"
                                    type="text"
                                    maxLength={15}
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={GuardianPhone}
                                    onChange={e => setGuardianPhone(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.GuardianPhone}&nbsp;</p>
                              </div>
                           </div>

                           <div className="column">
                              {/* Guardian email */}
                              <div className="field">
                                 <label className="label is-size-6">
                                    Email address
                                 </label>
                                 <input
                                    className="input is-size-6"
                                    id="GuardianEmailAddress"
                                    type="text"
                                    style={{ width: "300px", height: "35px" }}
                                    autoComplete="new-password"
                                    value={GuardianEmailAddress}
                                    onChange={e => setGuardianEmailAddress(e.target.value)}
                                 />
                                 <p className="help is-danger is-size-6">{errors.GuardianEmailAddress}&nbsp;</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* HISTORY */}
                     <div className="is-hidden" id="history">
                     </div>
                  </div>
               </section>

               <div className="field is-grouped mx-6">
                  <div className="field pr-3">
                     <button
                        className="button is-success"
                        type="submit"
                        id="Update"
                        style={{ width: "100px" }}
                        onClick={e => {
                           if (editingState !== editingStates.SELECTING) {
                              setErrors(validate());
                           }
                        }}>
                        Update
                     </button>
                  </div>

                  <div className="field">
                     <button
                        id="Cancel"
                        className="button is-success"
                        style={{ width: "100px" }}
                        onClick={e => setEditingState(editingStates.CANCELLING)} >
                        Cancel
                     </button>
                  </div>
               </div>
            </section>
         </div >
      </section >
   );
}
