import * as React from 'react';
// import styles from './HotWork.module.scss';
import type { IDashboardProps } from './IDashboardProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { Web } from '@pnp/sp/presets/all';
import * as moment from "moment";
import Dashboard from './Dashboard';


let NewWeb: any;
let RequestID = "";


export interface FormState {
    LoggedinuserName: string;
    CurrentUserProfilePic: string;
    CurrentUserID: number;
    ShowDashboard: boolean;
    ShowNewForm: boolean;
    InputFieldCount: number;
    FormInputs: any[];
    InputCount: number;
}

export default class NewRequestForm extends React.Component<IDashboardProps, FormState, {}> {
    public constructor(props: IDashboardProps, state: FormState) {
        super(props);
        this.state = {
            LoggedinuserName: "",
            CurrentUserProfilePic: "",
            CurrentUserID: 0,
            ShowDashboard: false,
            ShowNewForm: true,
            InputFieldCount: 0,
            FormInputs: [],
            InputCount: 0
        };
        NewWeb = Web(this.props.siteurl);
    }
    public componentDidMount() {
        this.GetCurrentLoggedUser();
        this.getAllFields();
        $(".cancel_btn").on('click', function () {
            location.reload();
        })
        // RequestID = "Session-" + moment().format("DDMMYYYYHHmmss");
    }
    private async GetCurrentLoggedUser() {
        await NewWeb.currentUser.get().then((user: any) => {
            console.log("User", user);
            this.setState({
                CurrentUserID: user.Id,
                LoggedinuserName: user.Title,
                CurrentUserProfilePic: `${this.props.siteurl}/_layouts/15/userphoto.aspx?size=L&username=${user.Title}`
            });
            // this.getWorkflowHistory();
        }, (errorResponse: any) => {
        });
        console.log(this.state.LoggedinuserName, this.state.CurrentUserProfilePic);
    }
    private Dropdown() {
        $(".user-profile-details").toggleClass("open");
    }
    public addNewRow(Section: string) {
        if (Section == "Level1Table") {
            $("#work_permit_tbody").append(`
    <tr>
      <td><input type='text' id='Work_permit_name' /></td>
      <td><input type='text' id='Work_permit_company' /></td>
      <td><input type='text' id='Work_permit_position'/></td>
      <td><input type='datetime-local' id='Work_permit_date'/></td>
       </tr>
     `);
            // $("#work_permit_tbody").on("click", ".delete-icon", function (eve) {
            //   const rowCount = $("#work_permit_tbody tr").length;
            //   if (rowCount === 1) {
            //     Swal.fire({
            //       title: 'Table must have at least one row',
            //       icon: 'error',
            //       showCancelButton: false,
            //       confirmButtonText: 'Ok',
            //     });
            //     return; // Exit the function without saving
            //   } else {
            //     Swal.fire({
            //       title: 'Are you sure,you want to delete?', showConfirmButton: true,
            //       showCancelButton: true, confirmButtonText: 'Delete',
            //     }).then(async (result) => {
            //       if (result.isConfirmed) {
            //         $(this).closest("tr").remove();
            //         Swal.fire('Deleted Successfully!', '', 'success');
            //       }
            //     });
            //   }
            // });
        }

    }
    public saveDetails() {
        if (this.formValidation()) {
            this.savePermitRequestDetails();
            this.saveLocationEquipmentDetails();
            this.saveWorkPermitRequestDetails();
        }
    }
    public savePermitRequestDetails() {
        var Contractor = $("#contractor1").prop("checked");
        var WorkPlanning = $("#planned1").prop("checked");
        var handler = this;

        NewWeb.lists.getByTitle("Form Master").items.add({
            Title: "Form",
            NatureofWork: $("#work_nature").val(),
            WorkTitle: $("#work_title").val(),
            StartDate: $("#start_date").val(),
            EndDate: $("#end_date").val(),
            EquipmentDescription: $("#equipment_description").val(),
            HazardousAreaclassification: $("#hazardous_description").val(),
            DescriptionofWork: $("#work_description").val(),
            Toolstobeused: $("#tools").val(),
            SourceofIgnition: $("#source_ignition").val(),
            HazardousMaterialsInvolved: $("#hazardous_materials").val(),
            JobPerformer: $("#job_performer").val(),
            Section: $("#section").val(),
            Name: $("#name").val(),
            PlannedNoofWorkers: $("#no_of_workers").val(),
            Contractor: Contractor,
            WorkPlanning: WorkPlanning,
            RequestID: RequestID,
            Status: "Pending"
        }).then((addedItem: any) => {
            // NewWeb.lists.getByTitle("Form Master").items.filter(`RequestID eq '${RequestID}'`).get().then((items: any) => {
            console.log("Added", addedItem)
            var itemsToUpdate: any = [];
            var batch = NewWeb.createBatch();
            var Id = addedItem.data.Id;
            var FieldLength = $(".added_field").length;
            for (var i = 0; i < FieldLength; i++) {
                var Type = $("#type" + i + "").text();
                var FieldName = $("#field_name" + i + "").text();
                var TrimmedText = FieldName.replace(/\s+/g, '').trim()
                var Column = TrimmedText + RequestID.replace("-", "");
                var item;
                if (Type === "SingleLine") {
                    var SLValue = $("#SingleLine" + i + "").val();
                    item = {
                        [Column]: SLValue,
                    }
                    itemsToUpdate.push({
                        item: item,
                        id: Id
                    })
                }
                else if (Type === "MultiLine") {
                    var MLValue = $("#MultiLine" + i + "").val();
                    item = {
                        [Column]: MLValue,
                    }
                    itemsToUpdate.push({
                        item: item,
                        id: Id
                    })
                }
                else if (Type === "Boolean") {
                    var BLValue = $("#Yes" + i + "").prop("checked");
                    item = {
                        [Column]: BLValue,
                    }
                    itemsToUpdate.push({
                        item: item,
                        id: Id
                    })
                }
            }
            console.log(itemsToUpdate)
            // Execute the batch operations
            itemsToUpdate.forEach(function (items: any) {
                NewWeb.lists.getByTitle("Form Master").items.getById(items.id).inBatch(batch).update(items.item)
            });

            // Execute the batch
            batch.execute().then(function () {
                Swal.fire('Submitted successfully!', '', 'success').then(() => {
                    handler.setState({
                        ShowDashboard: true,
                        ShowNewForm: false
                    })
                })
                console.log("Batch operations completed successfully");
            }).catch(function (error: any) {
                console.log("Error in batch operations: " + error);
            });

            // })
        })
    }
    public saveLocationEquipmentDetails() {
        $("#permit_request_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Equipment Table Transaction").items.add({
                Title: $(this).find('.location').text(),
                LocationValue: $(this).find('.location_value').val(),
                Area: $(this).find('.area').text(),
                ProcessR: $(this).find(".process_r").prop('checked'),
                ProcessA: $(this).find(".process_a").prop('checked'),
                NonProcessY: $(this).find(".non_process_y").prop('checked'),
                NonProcessG: $(this).find(".non_process_g").prop('checked'),
                NonProcessNC: $(this).find(".non_process_nc").prop('checked'),
                RequestID: RequestID,
                OrderNo: i
            });
        })
    }
    public saveWorkPermitRequestDetails() {
        var itemsToCreate: any = [];
        var batch = NewWeb.createBatch();
        $("#work_permit_tbody tr").each(function (i, J) {
            // NewWeb.lists.getByTitle("Work Permit Request Transaction").items.add({
            var Name = $(this).find('#Work_permit_name').val();
            var Company = $(this).find('#Work_permit_company').val();
            var Position = $(this).find('#Work_permit_position').val();
            var Date = $(this).find('#Work_permit_date').val();
            var Sessionid = RequestID;
            var OrderNo = i
            // });
            var item = {
                Title: Name,
                Company: Company,
                Position: Position,
                Date: Date,
                RequestID: Sessionid,
                OrderNo: OrderNo
            };
            itemsToCreate.push({
                action: "create",
                item: item
            });
        })
        // Execute the batch operations
        itemsToCreate.forEach(function (itemToCreate: any) {
            if (itemToCreate.action === "create") {
                NewWeb.lists.getByTitle("Permit Table Transaction").inBatch(batch).items.add(itemToCreate.item);
            }
        });

        // Execute the batch
        batch.execute().then(function () {
            console.log("Batch operations completed successfully Work Permit Request Transaction");
        }).catch(function (error: any) {
            console.log("Error in batch operations Work Permit Request Transaction: " + error);
        });
    }
    public formValidation() {
        var FormStatus = true;
        var NatureofWork = $("#work_nature").val();
        var WorkTitle = $("#work_title").val();
        var StartDate = $("#start_date").val();
        var EndDate = $("#end_date").val();
        var Equipment = $("#equipment_description").val();
        var HazardousArea = $("#hazardous_description").val();
        var Description = $("#work_description").val();
        var Tools = $("#tools").val();
        var Source = $("#source_ignition").val();
        var Hazardous = $("#hazardous_materials").val();
        var JP = $("#job_performer").val();
        var Section = $("#section").val();
        var Name = $("#name").val();
        var NoofWorkers = $("#no_of_workers").val();
        var Contractor = $(".contractor:checked").length;
        var Planning = $(".planning:checked").length;

        if (NatureofWork == "") {
            $(".err-nature").show();
            FormStatus = false
        } else {
            $(".err-nature").hide();
        }
        if (WorkTitle == "") {
            $(".err-title").show();
            FormStatus = false
        } else {
            $(".err-title").hide();
        }
        if (StartDate == "") {
            $(".err-start").show();
            FormStatus = false
        } else {
            $(".err-start").hide();
        }
        if (EndDate == "") {
            $(".err-end").show();
            FormStatus = false
        } else {
            $(".err-end").hide();
        }
        if (Equipment == "") {
            $(".err-equipment").show();
            FormStatus = false
        } else {
            $(".err-equipment").hide();
        }
        if (HazardousArea == "") {
            $(".err-area").show();
            FormStatus = false
        } else {
            $(".err-area").hide();
        }
        if (Description == "") {
            $(".err-desc").show();
            FormStatus = false
        } else {
            $(".err-desc").hide();
        }
        if (Tools == "") {
            $(".err-tools").show();
            FormStatus = false
        } else {
            $(".err-tools").hide();
        }
        if (Source == "") {
            $(".err-source").show();
            FormStatus = false
        } else {
            $(".err-source").hide();
        }
        if (Hazardous == "") {
            $(".err-hazardous").show();
            FormStatus = false
        } else {
            $(".err-hazardous").hide();
        }
        if (JP == "") {
            $(".err-jp").show();
            FormStatus = false
        } else {
            $(".err-jp").hide();
        }
        if (Section == "") {
            $(".err-section").show();
            FormStatus = false
        } else {
            $(".err-section").hide();
        }
        if (Name == "") {
            $(".err-name").show();
            FormStatus = false
        } else {
            $(".err-name").hide();
        }
        if (NoofWorkers == "") {
            $(".err-workers").show();
            FormStatus = false
        } else {
            $(".err-workers").hide();
        }
        if (Contractor == 0) {
            $(".err-contractor").show();
            FormStatus = false
        } else {
            $(".err-contractor").hide();
        }
        if (Planning == 0) {
            $(".err-planning").show();
            FormStatus = false
        } else {
            $(".err-planning").hide();
        }
        // $("#work_permit_tbody tr").each(function (i, J) {
        //     var Name = $(this).find('#Work_permit_name').val();
        //     var Company = $(this).find('#Work_permit_company').val();
        //     var Position = $(this).find('#Work_permit_position').val();
        //     var Date = $(this).find('#Work_permit_date').val();
        //     if (Name == "" || Company == "" || Position == "" || Date == "") {
        //         FormStatus = false
        //     }
        // });
        // $("#permit_request_tbody tr").each(function (i, J) {
        //     var LocationValue = $(this).find('.location_value').val();
        //     if (LocationValue == "") {
        //         FormStatus = false
        //     }
        // })
        // if (FormStatus == false) {
        //     Swal.fire({
        //         text: "Please fill all the fields",
        //         icon: "warning",
        //         customClass: {
        //             popup: 'form-validation',
        //         },
        //     });
        // }
        return FormStatus;
    }
    public goToDashboard() {
        this.setState({
            ShowDashboard: true,
            ShowNewForm: false
        })
    }
    public getAllFields() {
        NewWeb.lists.getByTitle("Form Master").fields.get().then((results: any) => {
            if (results.length > 0) {
                this.setState({
                    FormInputs: results
                })
            }
        });
    }
    public saveInputValues() {
        if (this.inputFieldValidation()) {
            RequestID = "Session-" + moment().format("DDMMYYYYHHmmss");
            var handler = this;
            NewWeb.lists.getByTitle("Form Master").items.add({
                Title: "Form",
                RequestID: RequestID,
                Status: "Pending"
            }).then((addedItem: any) => {
                console.log("Added", addedItem)
                var Id = addedItem.data.Id;
                var itemsToUpdate: any = [];
                var batch = NewWeb.createBatch();
                var InputFieldLength = $(".form_inputs").length;
                for (var i = 0; i < InputFieldLength; i++) {
                    var Key = i + 1;
                    var FieldType = $("#type" + Key + "").text();
                    var FieldInternalName = $("#column" + Key + "").text();
                    var InputValue;
                    var item;
                    if (FieldType == "SingleLine" || FieldType == "MultiLine" || FieldType == "Number" || FieldType == "Date") {
                        InputValue = $("#input_id" + Key + "").val();
                        item = {
                            [FieldInternalName]: InputValue,
                        }
                        itemsToUpdate.push({
                            item: item,
                            id: Id
                        })
                    } else if (FieldType == "Boolean") {
                        InputValue = $("#input_id" + Key + "").prop("checked");
                        item = {
                            [FieldInternalName]: InputValue,
                        }
                        itemsToUpdate.push({
                            item: item,
                            id: Id
                        })
                    }

                }
                // Execute the batch operations
                itemsToUpdate.forEach(function (items: any) {
                    NewWeb.lists.getByTitle("Form Master").items.getById(items.id).inBatch(batch).update(items.item)
                });

                // Execute the batch
                batch.execute().then(function () {
                    Swal.fire('Submitted successfully!', '', 'success').then(() => {
                        handler.setState({
                            ShowDashboard: true,
                            ShowNewForm: false
                        })
                    })
                    console.log("Batch operations completed successfully");
                }).catch(function (error: any) {
                    console.log("Error in batch operations: " + error);
                });
            })
        }
    }
    public inputFieldValidation() {
        var FormStatus = true;
        var InputFieldLength = $(".form_inputs").length;
        for (var i = 0; i < InputFieldLength; i++) {
            var Key = i + 1;
            var FieldType = $("#type" + Key + "").text();
            var Required = $("#req_text" + Key + "").val();
            var InputValue;
            if (Required == "true") {
                if (FieldType == "SingleLine" || FieldType == "MultiLine" || FieldType == "Number" || FieldType == "Date") {
                    InputValue = $("#input_id" + Key + "").val();
                    if (InputValue == "") {
                        FormStatus = false;
                        $("#err_id" + Key + "").show();
                    } else {
                        $("#err_id" + Key + "").hide();
                    }

                }
                else if (FieldType == "Boolean") {
                    InputValue = $(".yes_" + Key + ":checked").length;
                    if (InputValue == 0) {
                        FormStatus = false;
                        $("#err_id" + Key + "").show();
                    } else {
                        $("#err_id" + Key + "").hide();
                    }
                }
            }
        }
        return FormStatus;
    }

    public render(): React.ReactElement<IDashboardProps> {
        SPComponentLoader.loadCss(`${this.props.siteurl}/SiteAssets/AlQasimiForms/css/style.css?v=1.5`);
        SPComponentLoader.loadScript(`https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js`);
        SPComponentLoader.loadCss(`https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css`);
        SPComponentLoader.loadScript(`https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js`);
        // const {
        //   description,
        //   isDarkTheme,
        //   environmentMessage,
        //   hasTeamsContext,
        //   userDisplayName
        // } = this.props;
        var InputCount = 0;
        const FormInputFields: any = this.state.FormInputs.map((item, index) => {
            if (item.FromBaseType == false && item.InternalName != "_CommentFlags" && item.InternalName != "_CommentCount" && item.InternalName != "RequestID" && item.InternalName != "Status") {
                InputCount += 1;
                if (item.TypeDisplayName == "Single line of text") {
                    return (
                        <div className="col-md-3 form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${InputCount}`} style={{ display: "none" }}>SingleLine</p>
                                <p id={`column${InputCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <input type="text" id={`input_id${InputCount}`} className="form-control" />
                                <input id={`req_text${InputCount}`} value={item.Required} style={{ display: "none" }} />
                                <p className='err-msg' id={`err_id${InputCount}`} style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                            </div>
                        </div>
                    )
                }
                else if (item.TypeDisplayName == "Multiple lines of text") {
                    return (
                        <div className="col-md-3 form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${InputCount}`} style={{ display: "none" }}>MultiLine</p>
                                <p id={`column${InputCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <textarea className="form-control" id={`input_id${InputCount}`} ></textarea>
                                <input id={`req_text${InputCount}`} value={item.Required} style={{ display: "none" }} />
                                <p className='err-msg' id={`err_id${InputCount}`} style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                            </div>
                        </div>
                    )
                }
                else if (item.TypeDisplayName == "Number") {
                    return (
                        <div className="col-md-3 form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${InputCount}`} style={{ display: "none" }}>Number</p>
                                <p id={`column${InputCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <input type='text' className="form-control" id={`input_id${InputCount}`} />
                                <input id={`req_text${InputCount}`} value={item.Required} style={{ display: "none" }} />
                                <p className='err-msg' id={`err_id${InputCount}`} style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                            </div>
                        </div>
                    )
                }
                else if (item.TypeDisplayName == "Date and Time") {
                    return (
                        <div className="col-md-3 form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${InputCount}`} style={{ display: "none" }}>Date</p>
                                <p id={`column${InputCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <input type='date' className="form-control" id={`input_id${InputCount}`} />
                                <input id={`req_text${InputCount}`} value={item.Required} style={{ display: "none" }} />
                                <p className='err-msg' id={`err_id${InputCount}`} style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                            </div>
                        </div>
                    )
                }
                else if (item.TypeDisplayName == "Yes/No") {
                    return (
                        <div className="col-md-3 radio_block form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${InputCount}`} style={{ display: "none" }}>Boolean</p>
                                <p id={`column${InputCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <div>
                                    <div className="form-check">
                                        <input className={`form-check-input yes_${InputCount}`} type="radio" name={item.InternalName} id={`input_id${InputCount}`} />
                                        <label className="form-check-label" htmlFor={`input_id${InputCount}`}>Yes</label>
                                    </div>
                                    <div className="form-check">
                                        <input className={`form-check-input yes_${InputCount}`} type="radio" name={item.InternalName} id={`no_input_id${InputCount}`} />
                                        <label className="form-check-label" htmlFor={`no_input_id${InputCount}`}>No</label>
                                    </div>
                                </div>
                                <input id={`req_text${InputCount}`} value={item.Required} style={{ display: "none" }} />
                                <p className='err-msg' id={`err_id${InputCount}`} style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                            </div>
                        </div>
                    )
                }
            }
        })

        return (
            <>
                {this.state.ShowNewForm == true &&
                    <div>
                        <header>
                            <div className="container clearfix">
                                <div className="logo" onClick={() => this.goToDashboard()}>
                                    <a href="#"> <img src={require('../img/Logo.png')} alt="image" /> </a>
                                </div>
                                <div className="notification-part">
                                    <ul>
                                        <li> <a href="#"> <img className="user_img" src={`${this.state.CurrentUserProfilePic}`} alt="image" /> </a> </li>
                                        <li> <span> {this.state.LoggedinuserName} </span> </li>
                                        <li> <a href="#"> <img className="next_img" src={require('../img/dropdown.svg')} onClick={this.Dropdown} alt="image" /> </a> </li>
                                    </ul>
                                    <div className="user-profile-details"><h3>  {this.state.LoggedinuserName} </h3>
                                        <div className="logou-bck"><a href="https://login.windows.net/common/oauth2/logout" data-interception="off">
                                            <img src={require('../img/logout_img.svg')} data-themekey="#" />Logout </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <section>
                            <div className="container">
                                <div className="form_banner clearfix">
                                    <div className="header_form">
                                        <div onClick={() => this.goToDashboard()}>
                                            <a href="#" className='tooltip-back'>
                                                <img /* data-toggle="tooltip" title="back" */ src={require('../img/next.svg')} /> <span className='tooltiptext-back'>back</span>
                                            </a>
                                        </div>
                                        <h2>New Form</h2>
                                    </div>
                                    <div className='clearfix wrapper-main'>
                                        <div className='section1 forms'>
                                            <h4>PERMIT REQUEST</h4>
                                            {/* <div className="form_block">
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label> Nature of Work </label>
                                                            <textarea id="work_nature" className="form-control" ></textarea>
                                                            <p className='err-msg err-nature' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Work Title</label>
                                                            <textarea id="work_title" className="form-control" ></textarea>
                                                            <p className='err-msg err-title' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label> Planned Start Date </label>
                                                            <input type="date" id="start_date" className="form-control" />
                                                            <p className='err-msg err-start' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label> Planned Finish Date </label>
                                                            <input type="date" id="end_date" className="form-control" />
                                                            <p className='err-msg err-end' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>



                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table" id="permit_request">

                                                        <thead>
                                                            <tr className="open">
                                                                <th colSpan={2}>Location/Equipment</th>
                                                                <th >Area</th>
                                                                <th colSpan={4} >Process/Restricted</th>
                                                                <th colSpan={6}>Non-Process/Unrestricted</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody id="permit_request_tbody">
                                                            <tr>
                                                                <td><p className='location'>Location/Area</p></td>
                                                                <td><input type='text' className='location_value' /></td>
                                                                <td><p className='area'>H2S Zone </p></td>
                                                                <td>R</td>
                                                                <td><input type='checkbox' className='process_r' /></td>
                                                                <td>A</td>
                                                                <td><input type='checkbox' className='process_a' /></td>
                                                                <td>Y</td>
                                                                <td><input type='checkbox' className='non_process_y' /></td>
                                                                <td>G</td>
                                                                <td><input type='checkbox' className='non_process_g' /></td>
                                                                <td>NC</td>
                                                                <td><input type='checkbox' className='non_process_nc' /></td>
                                                            </tr>
                                                            <tr>
                                                                <td><p className='location'>Equipment ID/Tag No</p></td>
                                                                <td><input type='text' className='location_value' /></td>
                                                                <td><p className='area'>HAC Zone</p></td>
                                                                <td>0</td>
                                                                <td><input type='checkbox' className='process_r' /></td>
                                                                <td>1</td>
                                                                <td><input type='checkbox' className='process_a' /></td>
                                                                <td>2</td>
                                                                <td><input type='checkbox' className='non_process_y' /></td>
                                                                <td>G</td>
                                                                <td><input type='checkbox' className='non_process_g' /></td>
                                                                <td>NC</td>
                                                                <td><input type='checkbox' className='non_process_nc' /></td>
                                                            </tr>

                                                        </tbody>

                        

                                                    </table>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Equipment Description </label>
                                                            <textarea id="equipment_description" className="form-control"></textarea>
                                                            <p className='err-msg err-equipment' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label> HAC Hazardous Area classification  </label>
                                                            <textarea id="hazardous_description" className="form-control"></textarea>
                                                            <p className='err-msg err-area' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label> Description of Work </label>
                                                            <textarea id="work_description" className="form-control"></textarea>
                                                            <p className='err-msg err-desc' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6> Work Equipments Details</h6>
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Tools to be used</label>
                                                                <input type='text' id='tools' className="form-control" />
                                                                <p className='err-msg err-tools' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Source of ignition</label>
                                                                <input type='text' id='source_ignition' className="form-control" />
                                                                <p className='err-msg err-source' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Hazardous Materials Involved</label>
                                                                <textarea id="hazardous_materials" className="form-control"></textarea>
                                                                <p className='err-msg err-hazardous' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Job Performer (JP) Details</label>
                                                                <textarea id="job_performer" className="form-control"></textarea>
                                                                <p className='err-msg err-jp' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Section/Department</label>
                                                                <input type='text' id='section' className="form-control" />
                                                                <p className='err-msg err-section' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Name</label>
                                                                <input type='text' id='name' className="form-control" />
                                                                <p className='err-msg err-name' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Planned No.of Workers</label>
                                                                <input type='text' id='no_of_workers' className="form-control" />
                                                                <p className='err-msg err-workers' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3 radio_block">
                                                            <div className="form-group">
                                                                <label>Contractor</label>
                                                                <div>
                                                                    <div className="form-check">
                                                                        <input className="form-check-input contractor" type="radio" name="contractor" id="contractor1" />
                                                                        <label className="form-check-label" htmlFor="contractor1">Yes</label>
                                                                    </div>
                                                                    <div className="form-check">
                                                                        <input className="form-check-input contractor" type="radio" name="contractor" id="contractor2" />
                                                                        <label className="form-check-label" htmlFor="contractor2">No</label>
                                                                    </div>
                                                                </div>
                                                                <p className='err-msg err-contractor' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-3 radio_block">
                                                            <div className="form-group">
                                                                <label>Work Planning</label>
                                                                <div>
                                                                    <div className="form-check">
                                                                        <input className="form-check-input planning" type="radio" name="planning" id="planned1" />
                                                                        <label className="form-check-label" htmlFor="planned1">Planned</label>
                                                                    </div>
                                                                    <div className="form-check">
                                                                        <input className="form-check-input planning" type="radio" name="planning" id="planned2" />
                                                                        <label className="form-check-label" htmlFor="planned2">Break-in/Emergency</label>
                                                                    </div>
                                                                </div>
                                                                <p className='err-msg err-planning' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row" id='dynamic_fields'></div>
                                                </div>
                                                <div className='permit-text'>
                                                    <h6>Work Permit Request by Performing Authority (PA)</h6>
                                                    <p>I confirm that the details in the permit and associated attachments provide a clear description of the work to be performed including tools materials and any specialist skills required . I declare that the JP identified for the work activity is competent to conduct the specified work activity.</p>
                                                    <div className="table-responsive">
                                                        <table className="table" id="work_permit">
                                                            <thead>
                                                                <tr className="open">
                                                                    <th>Name (Performing Authority)</th>
                                                                    <th>Company/Contractor</th>
                                                                    <th>Position</th>
                                                                    <th>Date & Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody id="work_permit_tbody">
                                                                <tr>
                                                                    <td><input type='text' id='Work_permit_name' /></td>
                                                                    <td><input type='text' id='Work_permit_company' /></td>
                                                                    <td><input type='text' id='Work_permit_position' /></td>
                                                                    <td><input type='datetime-local' id='Work_permit_date' /></td>
                                                                </tr>
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className='final-row'>
                                                                    <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level1Table")}> Add New </a></div></td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div> */}
                                            <div className="form_block">
                                                <div className="row">
                                                    {FormInputFields}
                                                </div>
                                            </div>
                                            <div className="button">
                                                <button className="submit_btn" onClick={() => this.saveInputValues()}> Submit </button>
                                                <button className="cancel_btn"> Cancel </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                }
                {
                    this.state.ShowDashboard == true &&
                    <Dashboard
                        itemId={0}
                        description={""}
                        siteurl={this.props.siteurl} isDarkTheme={false} environmentMessage={''} hasTeamsContext={false} userDisplayName={''} />
                }
            </>
        );
    }
}
