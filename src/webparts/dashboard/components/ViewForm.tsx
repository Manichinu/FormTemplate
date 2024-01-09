import * as React from 'react';
// import styles from './HotWork.module.scss';
import type { IDashboardProps } from './IDashboardProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as $ from 'jquery';
import { Web } from '@pnp/sp/presets/all';
import Dashboard from './Dashboard';
import * as moment from "moment";
import Swal from 'sweetalert2';


let NewWeb: any;
let SessionID: any;
// var FieldCount = 0;
var InternalNames: any = [];

export interface ViewFormState {
    LoggedinuserName: string;
    CurrentUserProfilePic: string;
    CurrentUserID: number;
    ShowDashboard: boolean;
    ShowViewForm: boolean;
    NewFields: any[];
    FormInputs: any[];
    ItemId: number;
    FieldCount: number;
    WFItemId: number;
}

export default class ViewForm extends React.Component<IDashboardProps, ViewFormState, {}> {
    public constructor(props: IDashboardProps, state: ViewFormState) {
        super(props);
        this.state = {
            LoggedinuserName: "",
            CurrentUserProfilePic: "",
            CurrentUserID: 0,
            ShowDashboard: false,
            ShowViewForm: true,
            NewFields: [],
            FormInputs: [],
            ItemId: 0,
            FieldCount: 0,
            WFItemId: 0
        };
        NewWeb = Web(this.props.siteurl);
        SessionID = this.props.itemId;
    }
    public componentDidMount() {
        const searchParams = new URLSearchParams(window.location.search);
        const hasSessionID = searchParams.has("SessionID");
        if (hasSessionID) {
            SessionID = searchParams.get("SessionID");
            console.log(SessionID);
        } else {
            console.log(SessionID);
        }
        this.GetCurrentLoggedUser();
        this.getAllFields();
        console.log(moment("2024-01-04T20:00:00Z").format("DD/MM/YYYY"))
        // this.getDynamicColumns();
        // this.getTableDetails();
        $(".cancel_btn").on('click', function () {
            location.reload();
        })
    }
    private async GetCurrentLoggedUser() {
        await NewWeb.currentUser.get().then((user: any) => {
            console.log("User", user);
            this.setState({
                CurrentUserID: user.Id,
                LoggedinuserName: user.Title,
                CurrentUserProfilePic: `${this.props.siteurl}/_layouts/15/userphoto.aspx?size=L&username=${user.Title}`
            });
        }, (errorResponse: any) => {
        });
        console.log(this.state.LoggedinuserName, this.state.CurrentUserProfilePic);
    }
    private Dropdown() {
        $(".user-profile-details").toggleClass("open");
    }
    public goToDashboard() {
        this.setState({
            ShowDashboard: true,
            ShowViewForm: false
        })
    }
    public getPermitRequestTransaction() {
        NewWeb.lists.getByTitle("Form Master").items.filter(`RequestID eq '${SessionID}'`).get().then((items: any) => {
            console.log(items);
            $("#work_nature").val(items[0].NatureofWork);
            $("#work_title").val(items[0].WorkTitle);
            $("#start_date").val(items[0].StartDate);
            $("#end_date").val(items[0].EndDate);
            $("#equipment_description").val(items[0].EquipmentDescription);
            $("#hazardous_description").val(items[0].HazardousAreaclassification);
            $("#work_description").val(items[0].DescriptionofWork);
            $("#tools").val(items[0].Toolstobeused);
            $("#source_ignition").val(items[0].SourceofIgnition);
            $("#hazardous_materials").val(items[0].HazardousMaterialsInvolved);
            $("#job_performer").val(items[0].JobPerformer);
            $("#section").val(items[0].Section);
            $("#name").val(items[0].Name);
            $("#no_of_workers").val(items[0].PlannedNoofWorkers);
            items[0].Contractor == true ? $("#contractor1").prop("checked", true) : $("#contractor2").prop("checked", true);
            items[0].WorkPlanning == true ? $("#planned1").prop("checked", true) : $("#planned2").prop("checked", true);
            var DynamicFields = this.state.NewFields;
            var item = items[0]
            for (var i = 0; i < DynamicFields.length; i++) {
                var Title = DynamicFields[i].Title;
                var TrimmedText = Title.replace(/\s+/g, '').trim()
                if (DynamicFields[i].ColumnType == "SingleLine") {
                    var FieldValue = item[`${TrimmedText + SessionID.replace("-", "")}`]
                    var InputId = TrimmedText + SessionID.replace("-", "");
                    $("#" + InputId + "").val(FieldValue)
                } else if (DynamicFields[i].ColumnType == "MultiLine") {
                    var FieldValue = item[`${TrimmedText + SessionID.replace("-", "")}`]
                    var InputId = TrimmedText + SessionID.replace("-", "");
                    $("#" + InputId + "").text(FieldValue)
                }
                else if (DynamicFields[i].ColumnType == "Boolean") {
                    var FieldValue = item[`${TrimmedText + SessionID.replace("-", "")}`]
                    var InputId = TrimmedText + SessionID.replace("-", "");
                    FieldValue == true ? $("#" + InputId + "").prop("checked", true) : $("#No-" + InputId + "").prop("checked", true);
                }
            }
        })
    }
    public getDynamicColumns() {
        NewWeb.lists.getByTitle("Columns Master").items.filter(`RequestID eq '${SessionID}'`).get().then((items: any) => {
            if (items.length != 0) {
                this.setState({
                    NewFields: items
                })
                console.log(this.state.NewFields)
                for (var i = 0; i < items.length; i++) {
                    var FieldName = items[i].Title;
                    var FieldType = items[i].ColumnType;
                    var TrimmedText = FieldName.replace(/\s+/g, '').trim()
                    var FieldID = TrimmedText + SessionID.replace("-", "");
                    if (FieldType == "SingleLine") {
                        $("#new_fields").append(`<div class="col-md-3">
           <div class="form-group">
               <label>${FieldName}</label>
               <input type='text' id='${FieldID}' class="form-control" />           
           </div>
       </div>`)
                    }
                    else if (FieldType == "MultiLine") {
                        $("#new_fields").append(`<div class="col-md-3">
                <div class="form-group">
                    <label>${FieldName}</label>
                    <textarea id='${FieldID}' class="form-control" /></textarea>           
                </div>
            </div>`)
                    }
                    else if (FieldType == "Boolean") {
                        $("#new_fields").append(` <div class="col-md-3 radio_block">
    <div class="form-group">
        <label>${FieldName}</label>
        <div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="${FieldName}" id='${FieldID}' />
                <label class="form-check-label" htmlFor="${FieldID}">Yes</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="${FieldName}" id="No-${FieldID}" />
                <label class="form-check-label" htmlFor="No-${FieldID}">No</label>
            </div>
        </div>
    </div>
    </div>`)
                    }
                }
            }
        }).then(() => {
            this.getPermitRequestTransaction();
        })
    }
    public getTableDetails() {
        NewWeb.lists.getByTitle("Permit Table Transaction").items.filter(`RequestID eq '${SessionID}'`).orderBy("OrderNo", true).get().then((items: any) => {
            console.log(items);
            if (items.length != 0) {
                $("#work_permit_tbody").empty();
                $("#work_permit tfoot").hide();
                for (var i = 0; i < items.length; i++) {
                    $("#work_permit_tbody").append(`<tr>
                    <td style="display:none;"><input type='text' id="itemid" value='${items[i].ID}' /></td>
                    <td><input type='text' id='work_permit_name' value='${items[i].Title}' readonly  /></td>
                    <td><input type='text' id='work_permit_company' value='${items[i].Company}' readonly  /></td>
                    <td><input type='text' id='work_permit_position' value='${items[i].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='work_permit_date' value='${items[i].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("Equipment Table Transaction").items.filter(`RequestID eq '${SessionID}'`).orderBy("OrderNo", true).get().then((items: any) => {
            console.log(items);
            if (items.length != 0) {
                $("#permit_request_tbody").empty();
                $("#permit_request tfoot").hide();
                for (var m = 0; m < items.length; m++) {
                    if (m == 0) {
                        $("#permit_request_tbody").append(`<tr>
                        <td style="display:none;"><input type='text' id="equip_id" value='${items[m].ID}' /></td>
                    <td><p className='location'>${items[m].Title}</p></td>
                    <td><input readonly type='text' className='location_value' value='${items[m].LocationValue}' /></td>
                    <td><p className='area'>${items[m].Area}</p></td>
                    <td>R</td>
                    <td><input disabled type='checkbox' className='process_r' ${items[m].ProcessR == true ? 'checked' : ''} /></td>
                    <td>A</td>
                    <td><input disabled type='checkbox' className='process_a' ${items[m].ProcessA == true ? 'checked' : ''} /></td>
                    <td>Y</td>
                    <td><input disabled type='checkbox' className='non_process_y' ${items[m].NonProcessY == true ? 'checked' : ''} /></td>
                    <td>G</td>
                    <td><input disabled type='checkbox' className='non_process_g' ${items[m].NonProcessG == true ? 'checked' : ''} /></td>
                    <td>NC</td>
                    <td><input disabled type='checkbox' className='non_process_nc' ${items[m].NonProcessNC == true ? 'checked' : ''} /></td>
                </tr>`)
                    } else {
                        $("#permit_request_tbody").append(`<tr>
                        <td style="display:none;"><input type='text' id="equip_id" value='${items[m].ID}' /></td>
                        <td><p className='location'>${items[m].Title}</p></td>
                        <td><input readonly type='text' className='location_value' value='${items[m].LocationValue}' /></td>
                        <td><p className='area'>${items[m].Area}</p></td>
                        <td>0</td>
                        <td><input disabled type='checkbox' className='process_r' ${items[m].ProcessR == true ? 'checked' : ''} /></td>
                        <td>1</td>
                        <td><input disabled type='checkbox' className='process_a' ${items[m].ProcessA == true ? 'checked' : ''} /></td>
                        <td>2</td>
                        <td><input disabled type='checkbox' className='non_process_y' ${items[m].NonProcessY == true ? 'checked' : ''} /></td>
                        <td>G</td>
                        <td><input disabled type='checkbox' className='non_process_g' ${items[m].NonProcessG == true ? 'checked' : ''} /></td>
                        <td>NC</td>
                        <td><input disabled type='checkbox' className='non_process_nc' ${items[m].NonProcessNC == true ? 'checked' : ''} /></td>
                </tr>`)
                    }
                }
            }
        });
    }
    public saveWorkPermitRequestDetails() {
        var itemsToUpdate: any = [];
        var batch = NewWeb.createBatch();
        $("#work_permit_tbody tr").each(function (i, J) {
            var Id: any = $(this).find('#itemid').val();
            var Name = $(this).find('#Work_permit_name').val();
            var Company = $(this).find('#Work_permit_company').val();
            var Position = $(this).find('#Work_permit_position').val();
            var Date = $(this).find('#Work_permit_date').val();
            var item = {
                Title: Name,
                Company: Company,
                Position: Position,
                Date: Date,
                id: parseInt(Id)
            };
            itemsToUpdate.push({
                action: "update",
                item: item
            });
        })
        // Execute the batch operations
        itemsToUpdate.forEach(function (update: any) {
            if (update.action === "update") {
                NewWeb.lists.getByTitle("Permit Table Transaction").inBatch(batch).items.getById(update.id).add(update.item);
            }
        });

        // Execute the batch
        batch.execute().then(function () {
            console.log("Batch operations Updated successfully Work Permit Request Transaction");
        }).catch(function (error: any) {
            console.log("Error in batch operations Work Permit Request Transaction: " + error);
        });
    }
    public getAllFields() {
        NewWeb.lists.getByTitle("Form Master").fields.get().then((results: any) => {
            if (results.length > 0) {
                this.setState({
                    FormInputs: results
                })
                for (var i = 0; i < results.length; i++) {
                    if (results[i].FromBaseType == false && results[i].InternalName != "_CommentFlags" && results[i].InternalName != "_CommentCount" && results[i].InternalName != "RequestID" && results[i].InternalName != "Status") {
                        InternalNames.push({ Name: results[i].InternalName, Type: results[i].TypeDisplayName })
                    }
                }
                console.log("Array", InternalNames)
            }
        }).then(() => {
            this.getFormMasterTransaction();
            this.getWFHistory();
        })
    }
    public getFormMasterTransaction() {
        NewWeb.lists.getByTitle("Form Master").items.filter(`RequestID eq '${SessionID}'`).get().then((items: any) => {
            console.log(items)
            this.setState({
                ItemId: items[0].ID
            })
            InternalNames.forEach(function (val: any) {
                if (val.Type == "Single line of text" || val.Type == "Number") {
                    $(`.${val.Name}`).val(items[0][`${val.Name}`])
                }
                else if (val.Type == "Date and Time") {
                    var formattedDate = moment(items[0][`${val.Name}`]).format("YYYY-MM-DD");
                    $(`.${val.Name}`).val(formattedDate);
                }
                else if (val.Type == "Multiple lines of text") {
                    $(`.${val.Name}`).text(items[0][`${val.Name}`])
                }
                else if (val.Type == "Yes/No") {
                    items[0][`${val.Name}`] == true ? $(`.${val.Name}`).prop('checked', true) : $(`.no_${val.Name}`).prop('checked', true);
                }
            })
        })
    }
    public getWFHistory() {
        NewWeb.lists.getByTitle("WorkFlow History").items.filter(`RequestID eq '${SessionID}'`).get().then((items: any) => {
            this.setState({
                WFItemId: items[0].ID
            })
            if (items[0].Status == "Approved" || items[0].Status == "Rejected") {
                $(".wf_status").hide()
            }
        })
    }
    public updateFormTransaction() {
        var handler = this;
        var Id = this.state.ItemId;
        var itemsToUpdate: any = [];
        var batch = NewWeb.createBatch();
        var InputFieldLength = $(".form_inputs").length;
        Swal.fire({
            title: 'Pending',
            showConfirmButton: false
        });
        for (var i = 0; i < InputFieldLength; i++) {
            var Key = i + 1;
            var FieldType = $("#type" + Key + "").text();
            var FieldInternalName = $("#column" + Key + "").text();
            var InputValue;
            var item;
            if (FieldType == "SingleLine" || FieldType == "MultiLine" || FieldType == "Number") {
                InputValue = $("#input_id" + Key + "").val();
                item = {
                    [FieldInternalName]: InputValue,
                }
                itemsToUpdate.push({
                    item: item,
                    id: Id
                })
            }
            else if (FieldType == "Date") {
                InputValue = $("#input_id" + Key + "").val();
                if (InputValue == "") {
                    InputValue = null
                }
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
            Swal.fire('Updated successfully!', '', 'success').then(() => {
                handler.setState({
                    ShowDashboard: true,
                    ShowViewForm: false
                })
            })
            console.log("Batch operations completed successfully");
        }).catch(function (error: any) {
            console.log("Error in batch operations: " + error);
        });
    }
    public Approve() {
        NewWeb.lists.getByTitle("Form Master").items.getById(this.state.ItemId).update({
            Status: "Approved"
        })
        NewWeb.lists.getByTitle("WorkFlow History").items.getById(this.state.WFItemId).update({
            Status: "Approved",
            ApprovedById: this.state.CurrentUserID
        }).then(() => {
            Swal.fire('Approved successfully!', '', 'success').then(() => {
                window.open("https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SitePages/FormTemplate.aspx?env=WebView", "_self");
            })
        })
    }
    public Reject() {
        NewWeb.lists.getByTitle("Form Master").items.getById(this.state.ItemId).update({
            Status: "Rejected"
        })
        NewWeb.lists.getByTitle("WorkFlow History").items.getById(this.state.WFItemId).update({
            Status: "Rejected"
        }).then(() => {
            Swal.fire('Rejected successfully!', '', 'success').then(() => {
                window.open("https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SitePages/FormTemplate.aspx?env=WebView", "_self");
            })
        })
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
        var FieldCount = 0;
        const FormInputFields: any = this.state.FormInputs.map((item, index) => {
            if (item.FromBaseType == false && item.InternalName != "_CommentFlags" && item.InternalName != "_CommentCount" && item.InternalName != "RequestID" && item.InternalName != "Status") {
                FieldCount += 1;
                if (item.TypeDisplayName == "Single line of text") {
                    return (
                        <div className="col-md-3 form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${FieldCount}`} style={{ display: "none" }}>SingleLine</p>
                                <p id={`column${FieldCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <input type="text" id={`input_id${FieldCount}`} className={`form-control ${item.InternalName}`} />
                            </div>
                        </div>
                    )
                }
                else if (item.TypeDisplayName == "Multiple lines of text") {
                    return (
                        <div className="col-md-3 form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${FieldCount}`} style={{ display: "none" }}>MultiLine</p>
                                <p id={`column${FieldCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <textarea className={`form-control ${item.InternalName}`} id={`input_id${FieldCount}`} ></textarea>
                            </div>
                        </div>
                    )
                }
                else if (item.TypeDisplayName == "Number") {
                    return (
                        <div className="col-md-3 form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${FieldCount}`} style={{ display: "none" }}>Number</p>
                                <p id={`column${FieldCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <input type='text' className={`form-control ${item.InternalName}`} id={`input_id${FieldCount}`} />
                            </div>
                        </div>
                    )
                }
                else if (item.TypeDisplayName == "Date and Time") {
                    return (
                        <div className="col-md-3 form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${FieldCount}`} style={{ display: "none" }}>Date</p>
                                <p id={`column${FieldCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <input type='date' className={`form-control ${item.InternalName}`} id={`input_id${FieldCount}`} />
                            </div>
                        </div>
                    )
                }
                else if (item.TypeDisplayName == "Yes/No") {
                    return (
                        <div className="col-md-3 radio_block form_inputs">
                            <div className="form-group">
                                <label>{item.Title}</label>
                                <p id={`type${FieldCount}`} style={{ display: "none" }}>Boolean</p>
                                <p id={`column${FieldCount}`} style={{ display: "none" }}>{item.InternalName}</p>
                                <div>
                                    <div className="form-check">
                                        <input className={`form-check-input ${item.InternalName}`} type="radio" name={`${item.InternalName}`} id={`input_id${FieldCount}`} />
                                        <label className="form-check-label" htmlFor={`input_id${FieldCount}`}>Yes</label>
                                    </div>
                                    <div className="form-check">
                                        <input className={`form-check-input no_${item.InternalName}`} type="radio" name={`${item.InternalName}`} id={`no_input_id${FieldCount}`} />
                                        <label className="form-check-label" htmlFor={`no_input_id${FieldCount}`}>No</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            }
        })

        return (
            <>
                {this.state.ShowViewForm == true &&
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
                                        <h2>View Form</h2>
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
                                                    <div className="row" id='new_fields'>

                                                    </div>
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
                                                <button className="submit_btn wf_status" onClick={() => this.Approve()}> Approve </button>
                                                <button className="submit_btn wf_status" onClick={() => this.Reject()}> Reject </button>
                                                <button className="submit_btn" onClick={() => this.updateFormTransaction()}> Update </button>
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
