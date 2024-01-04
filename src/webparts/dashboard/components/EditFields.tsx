import * as React from 'react';
// import styles from './HotWork.module.scss';
import type { IDashboardProps } from './IDashboardProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as $ from 'jquery';
import { Web } from '@pnp/sp/presets/all';
import Dashboard from './Dashboard';
import 'datatables.net';
import 'datatables.net-responsive';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.colVis.min';
import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.flash.min';
import 'datatables.net-buttons/js/buttons.html5.min';
import Swal from 'sweetalert2';
// import * as moment from "moment";


let NewWeb: any;
var Count = 0;
// let SessionID: any;

export interface EditFieldsState {
    LoggedinuserName: string;
    CurrentUserProfilePic: string;
    CurrentUserID: number;
    ShowDashboard: boolean;
    ShowEditFields: boolean;
    NewFields: any[];
    ListFields: any[];
    InputFieldCount: number;
    InternalName: string;
}

export default class EditFields extends React.Component<IDashboardProps, EditFieldsState, {}> {
    public constructor(props: IDashboardProps, state: EditFieldsState) {
        super(props);
        this.state = {
            LoggedinuserName: "",
            CurrentUserProfilePic: "",
            CurrentUserID: 0,
            ShowDashboard: false,
            ShowEditFields: true,
            NewFields: [],
            ListFields: [],
            InputFieldCount: 0,
            InternalName: ""
        };
        SPComponentLoader.loadScript(`https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js`);
        SPComponentLoader.loadCss(`https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css`);
        NewWeb = Web(this.props.siteurl);
        // SessionID = this.props.itemId;
    }
    public componentDidMount() {
        this.GetCurrentLoggedUser();
        this.getAllFields();
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
            ShowEditFields: false
        })
    }
    public getAllFields() {
        var table = $('#SpfxDatatable').DataTable();
        table.destroy();
        this.setState({
            ListFields: []
        })
        NewWeb.lists.getByTitle("Form Master").fields.get().then((results: any) => {
            if (results.length > 0) {
                this.setState({
                    ListFields: results
                })
                setTimeout(() => {
                    $('#SpfxDatatable').DataTable({
                        dom: 'Bfrtip',
                        pageLength: 10,
                        buttons: [

                            {
                                exportOptions: {
                                    columns: [0, 1, 2, 3, 4, 5, 6, 7]
                                }
                            },
                        ]
                    });
                }, 1000);
                console.log("Fields", results);
            }
        });
    }
    public deleteField(name: any) {
        Swal.fire({
            title: 'Are you sure,you want to delete?', showConfirmButton: true,
            showCancelButton: true, confirmButtonText: 'Delete',
        }).then(async (result) => {
            if (result.isConfirmed) {
                NewWeb.lists.getByTitle("Form Master").fields.getByTitle(name).delete().then(() => {
                    Count = 0;
                    Swal.fire('Deleted successfully!', '', 'success').then(() => {
                        this.getAllFields();
                    })
                })
            }
        });
    }
    public editField(item: any) {
        $(".update_btn").show()
        $("#add_field").hide()
        $("#field_name").val(item.Title);
        this.setState({
            InternalName: item.InternalName
        })
    }
    public async updateField() {
        var newDisplayName = $("#field_name").val();
        NewWeb.lists.getByTitle("Form Master").fields.getByTitle(this.state.InternalName).update({ Title: newDisplayName }).then(() => {
            Count = 0;
            Swal.fire('Updated successfully!', '', 'success').then(() => {
                this.getAllFields();
                $("#add_field").show()
                $(".update_btn").hide()
                $("#field_name").val("")
            });
        })
    }
    //     public addInputField() {
    //         if (this.dynamicFieldValidation()) {
    //             var FieldName: any = $("#field_name").val();
    //             var FieldType = $("#field_type").val();
    //             var Count = this.state.InputFieldCount
    //             this.setState({
    //                 InputFieldCount: Count + 1
    //             })
    //             var TrimmedText = FieldName.replace(/\s+/g, '').trim()
    //             if (FieldType == "SingleLine") {
    //                 $("#dynamic_fields").append(`<div class="col-md-3 added_field">
    //        <div class="form-group">
    //            <label id='field_name${Count}'>${FieldName}</label>
    //            <span id='type${Count}' style="display:none;">${FieldType}</span>
    //            <input type='text' id='SingleLine${Count}' class="form-control" />           
    //        </div>
    //    </div>`)
    //                 var ColumnName = TrimmedText + RequestID.replace("-", "");
    //                 NewWeb.lists.getByTitle("Form Master").fields.addText(ColumnName, 255, {
    //                     Group: "Custom Column",
    //                 }).then(() => {
    //                     NewWeb.lists.getByTitle("Columns Master").items.add({
    //                         Title: FieldName,
    //                         ColumnType: FieldType,
    //                         RequestID: RequestID
    //                     })
    //                     $("#field_name").val("");
    //                     $("#field_type").val("null");
    //                 })
    //             }
    //             else if (FieldType == "MultiLine") {
    //                 $("#dynamic_fields").append(`<div class="col-md-3 added_field">
    //             <div class="form-group">
    //                 <label id='field_name${Count}'>${FieldName}</label>
    //                 <span id='type${Count}' style="display:none;">${FieldType}</span>
    //                 <textarea id='MultiLine${Count}' class="form-control" /></textarea>           
    //             </div>
    //         </div>`)
    //                 var ColumnName = TrimmedText + RequestID.replace("-", "");
    //                 NewWeb.lists.getByTitle("Form Master").fields.addMultilineText(ColumnName, 255, true, false, false, true, {
    //                     Group: "Custom Column",
    //                 }).then(() => {
    //                     NewWeb.lists.getByTitle("Columns Master").items.add({
    //                         Title: FieldName,
    //                         ColumnType: FieldType,
    //                         RequestID: RequestID
    //                     })
    //                     $("#field_name").val("");
    //                     $("#field_type").val("null");
    //                 })
    //             }
    //             else if (FieldType == "Boolean") {
    //                 $("#dynamic_fields").append(` <div class="col-md-3 added_field radio_block">
    // <div class="form-group">
    //     <label id='field_name${Count}'>${FieldName}</label>
    //     <span id='type${Count}' style="display:none;">${FieldType}</span>
    //     <div>
    //         <div class="form-check">
    //             <input class="form-check-input" type="radio" name="${FieldName}" id="Yes${Count}" />
    //             <label class="form-check-label" htmlFor="Yes${Count}">Yes</label>
    //         </div>
    //         <div class="form-check">
    //             <input class="form-check-input" type="radio" name="${FieldName}" id="No${Count}" />
    //             <label class="form-check-label" htmlFor="No${Count}">No</label>
    //         </div>
    //     </div>
    // </div>
    // </div>`)
    //                 var ColumnName = TrimmedText + RequestID.replace("-", "");
    //                 NewWeb.lists.getByTitle("Form Master").fields.addBoolean(ColumnName).then(() => {
    //                     NewWeb.lists.getByTitle("Columns Master").items.add({
    //                         Title: FieldName,
    //                         ColumnType: FieldType,
    //                         RequestID: RequestID
    //                     })
    //                     $("#field_name").val("");
    //                     $("#field_type").val("null");
    //                 })
    //             }
    //         }
    //     }
    public addInputField() {
        if (this.dynamicFieldValidation()) {
            var FieldName: any = $("#field_name").val();
            var FieldType = $("#field_type").val();
            if (FieldType == "SingleLine") {
                NewWeb.lists.getByTitle("Form Master").fields.addText(FieldName, 255, {
                    Group: "Custom Column",
                }).then(() => {
                    Count = 0;
                    Swal.fire('Field added successfully!', '', 'success').then(() => {
                        $("#field_name").val("");
                        $("#field_type").val("null");
                        this.getAllFields();
                    })
                    console.log(`${FieldName} column added successfully`)
                })
            }
            else if (FieldType == "MultiLine") {
                NewWeb.lists.getByTitle("Form Master").fields.addMultilineText(FieldName, 255, true, false, false, true, {
                    Group: "Custom Column",
                }).then(() => {
                    Count = 0;
                    Swal.fire('Field added successfully!', '', 'success').then(() => {
                        $("#field_name").val("");
                        $("#field_type").val("null");
                        this.getAllFields();
                    })
                    console.log(`${FieldName} column added successfully`)
                })
            }
            else if (FieldType == "Boolean") {
                NewWeb.lists.getByTitle("Form Master").fields.addBoolean(FieldName).then(() => {
                    Count = 0;
                    Swal.fire('Field added successfully!', '', 'success').then(() => {
                        $("#field_name").val("");
                        $("#field_type").val("null");
                        this.getAllFields();
                    })
                    console.log(`${FieldName} column added successfully`)
                })
            }
            else if (FieldType == "Number") {
                NewWeb.lists.getByTitle("Form Master").fields.addNumber(FieldName).then(() => {
                    Count = 0;
                    Swal.fire('Field added successfully!', '', 'success').then(() => {
                        $("#field_name").val("");
                        $("#field_type").val("null");
                        this.getAllFields();
                    })
                    console.log(`${FieldName} column added successfully`)
                })
            }
            else if (FieldType == "Date") {
                NewWeb.lists.getByTitle("Form Master").fields.addDateTime(FieldName).then(() => {
                    Count = 0;
                    Swal.fire('Field added successfully!', '', 'success').then(() => {
                        $("#field_name").val("");
                        $("#field_type").val("null");
                        this.getAllFields();
                    })
                    console.log(`${FieldName} column added successfully`)
                })
            }
        }
    }
    public dynamicFieldValidation() {
        var FormStatus = true;
        var FieldName = $("#field_name").val();
        var FieldType = $("#field_type").val();
        if (FieldName == "") {
            FormStatus = false
            $(".err_field_name").show()
        } else {
            $(".err_field_name").hide()
        }
        if (FieldType == "null") {
            FormStatus = false
            $(".err_field_type").show()
        } else {
            $(".err_field_type").hide()
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
        const Fields: any = this.state.ListFields.map((item, index) => {
            if (item.FromBaseType == false && item.InternalName != "_CommentFlags" && item.InternalName != "_CommentCount" && item.InternalName != "RequestID" && item.InternalName != "Status") {
                Count += 1;
                return (
                    <tr>
                        <td>{Count}</td>
                        <td>{item.Title}</td>
                        <td>{item.TypeDisplayName}</td>
                        <td>
                            <a href='#'><img className="view_img" src={require('../img/edit.svg')} onClick={() => this.editField(item)} alt="image" /> </a>
                            <a href='#'><img className="view_img" src={require('../img/delete_img.svg')} onClick={() => this.deleteField(item.InternalName)} alt="image" /> </a>
                        </td>
                    </tr>
                )
            }
        })

        return (
            <>
                {this.state.ShowEditFields == true &&
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
                                        <h2>Edit Fields</h2>
                                    </div>
                                    <div className='clearfix wrapper-main'>
                                        <div className='section1 forms'>
                                            <h4>Columns</h4>
                                            <div className="form_block">
                                                <div className="table-responsive">
                                                    <table className="table dashboard_table" id="SpfxDatatable">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>S.No</th>
                                                                <th>Name</th>
                                                                <th>Type</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Fields}
                                                        </tbody>

                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                        <div>
                                            <div className="form_block">
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label> Field Name</label>
                                                            <input type='text' id="field_name" className="form-control" />
                                                            <p className='err-msg err_field_name' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Type</label>
                                                            <select className="form-select form-select-lg mb-3" id='field_type' >
                                                                <option value="null">Select</option>
                                                                <option value="SingleLine">SingleLine</option>
                                                                <option value="MultiLine">MultiLine</option>
                                                                <option value="Boolean">Boolean</option>
                                                                <option value="Number">Number</option>
                                                                <option value="Date">Date</option>
                                                            </select>
                                                            <p className='err-msg err_field_type' style={{ display: "none" }}><img src={require('../img/error.svg')} className="err-icon" />This field is required</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button id='add_field' onClick={() => this.addInputField()}>Add Field</button>
                                            </div>
                                            <div className="button update_btn" style={{ display: "none" }}>
                                                <button className="submit_btn" onClick={() => this.updateField()}> Update </button>
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
