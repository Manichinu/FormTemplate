import * as React from 'react';
// import styles from './HotWork.module.scss';
import type { IDashboardProps } from './IDashboardProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as $ from 'jquery';
import { Web } from '@pnp/sp/presets/all';
import Dashboard from './Dashboard';


let NewWeb: any;
let SessionID: any;

export interface ViewFormState {
    LoggedinuserName: string;
    CurrentUserProfilePic: string;
    CurrentUserID: number;
    ShowDashboard: boolean;
    ShowViewForm: boolean;
}

export default class ViewForm extends React.Component<IDashboardProps, ViewFormState, {}> {
    public constructor(props: IDashboardProps, state: ViewFormState) {
        super(props);
        this.state = {
            LoggedinuserName: "",
            CurrentUserProfilePic: "",
            CurrentUserID: 0,
            ShowDashboard: false,
            ShowViewForm: true
        };
        NewWeb = Web(this.props.siteurl);
        SessionID = this.props.itemId;
    }
    public componentDidMount() {
        this.GetCurrentLoggedUser();
        this.getPermitRequestTransaction();
        this.getTableDetails();
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


        return (
            <>
                {this.state.ShowViewForm == true &&
                    <div>
                        <header>
                            <div className="container clearfix">
                                <div className="logo">
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
                                        <h2>Form Template</h2>
                                    </div>
                                    <div className='clearfix wrapper-main'>
                                        <div className='section1 forms'>
                                            <h4>PERMIT REQUEST</h4>
                                            <div className="form_block">
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

                                                        {/* <tfoot>
                          <tr className='final-row'>
                            <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow()}> Add New </a></div></td>
                          </tr>
                        </tfoot> */}

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
                                            </div>
                                            {/* <div className="button">
                                                <button className="submit_btn"> Submit </button>
                                                <button className="cancel_btn"> Cancel </button>
                                            </div> */}
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
