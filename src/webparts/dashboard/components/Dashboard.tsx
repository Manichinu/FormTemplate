import * as React from 'react';
// import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { Web } from '@pnp/sp/presets/all';
import { SPComponentLoader } from '@microsoft/sp-loader';
import "../css/style";
import NewRequestForm from './NewRequestForm';
import * as moment from "moment";
import 'datatables.net';
import 'datatables.net-responsive';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.colVis.min';
import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.flash.min';
import 'datatables.net-buttons/js/buttons.html5.min';

let NewWeb: any;

export interface DashboardState {
  LoggedinuserName: string;
  CurrentUserProfilePic: string;
  CurrentUserID: number;
  DashboardItems: any[];
  ShowDashboard: boolean;
  ShowNewForm: boolean;
  ShowViewForm: boolean;
  ViewFormID: any;
  ApprovedStatusCount: number;
  PendingStatusCount: number;
}
export default class Dashboard extends React.Component<IDashboardProps, DashboardState, {}> {
  public constructor(props: IDashboardProps, state: DashboardState) {
    super(props);
    this.state = {
      LoggedinuserName: "",
      CurrentUserProfilePic: "",
      CurrentUserID: 0,
      DashboardItems: [],
      ShowDashboard: true,
      ShowNewForm: false,
      ShowViewForm: false,
      ViewFormID: "",
      ApprovedStatusCount: 0,
      PendingStatusCount: 0
    };
    SPComponentLoader.loadScript(`https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js`);
    SPComponentLoader.loadCss(`https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css`);
    NewWeb = Web(this.props.siteurl)
  }
  public componentDidMount() {
    this.GetCurrentLoggedUser();
    this.getPermitRequestDetails();
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
  public getPermitRequestDetails() {
    var PendingStatus = 0;
    var ApprovedStatus = 0;
    NewWeb.lists.getByTitle("Permit Request Transaction").items.orderBy("Created", false).get().then((items: any) => {
      console.log(items);
      for (let i = 0; i < items.length; i++) {
        if (items[i].Status == "Pending") {
          PendingStatus = PendingStatus + 1;
        }
        else if (items[i].Status == "Approved") {
          ApprovedStatus = ApprovedStatus + 1;
        }
      }
      this.setState({
        DashboardItems: items,
        ApprovedStatusCount: ApprovedStatus,
        PendingStatusCount: PendingStatus
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
    });
  }
  public configureListCreation() {
    try {
      const listTitle = "Configure Master";
      const listDescription = "Form Template";
      NewWeb.lists.add(listTitle, listDescription, 100, false).then(() => {
        console.log(`${listTitle} List created successfully`);
        NewWeb.lists.getByTitle(listTitle).items.add({
          Title: "Configured"
        })
      });
    } catch (error) {
      console.error("Error creating list:", error);
    }
  }
  public FormListCreation() {
    var batch = NewWeb.createBatch();
    var ListColumns = [{ Name: "NatureofWork", Type: "MultiLine" },
    { Name: "WorkTitle", Type: "MultiLine" },
    { Name: "StartDate", Type: "SingleLine" },
    { Name: "EndDate", Type: "SingleLine" },
    { Name: "EquipmentDescription", Type: "MultiLine" },
    { Name: "HazardousAreaclassification", Type: "MultiLine" },
    { Name: "DescriptionofWork", Type: "MultiLine" },
    { Name: "Toolstobeused", Type: "SingleLine" },
    { Name: "SourceofIgnition", Type: "SingleLine" },
    { Name: "HazardousMaterialsInvolved", Type: "MultiLine" },
    { Name: "JobPerformer", Type: "MultiLine" },
    { Name: "Section", Type: "SingleLine" },
    { Name: "Name", Type: "SingleLine" },
    { Name: "PlannedNoofWorkers", Type: "SingleLine" },
    { Name: "Contractor", Type: "YesorNo" },
    { Name: "WorkPlanning", Type: "YesorNo" },
    { Name: "RequestID", Type: "MultiLine" },
    { Name: "Status", Type: "MultiLine" },]

    try {
      const listTitle = "Form Master";
      const listDescription = "Form Template";
      NewWeb.lists.add(listTitle, listDescription, 100, false).then(() => {
        console.log(`${listTitle} List created successfully`);
        ListColumns.forEach(function (item) {
          if (item.Type == "SingleLine") {
            NewWeb.lists.getByTitle(listTitle).fields.inBatch(batch).addText(item.Name, 255, {
              Group: "Custom Column",
            }).then(() => {
              NewWeb.lists.getByTitle(listTitle).defaultView.fields.add(item.Name)
              console.log(`${item.Name} column created successfully`)
            })
          }
          else if (item.Type == "MultiLine") {
            NewWeb.lists.getByTitle(listTitle).fields.inBatch(batch).addMultilineText(item.Name, 255, true, false, false, true, {
              Group: "Custom Column",
            }).then(() => {
              NewWeb.lists.getByTitle(listTitle).defaultView.fields.add(item.Name)
              console.log(`${item.Name} column created successfully`)
            })
          }
          else if (item.Type == "YesorNo") {
            NewWeb.lists.getByTitle(listTitle).fields.inBatch(batch).addBoolean(item.Name, {
              Group: "Custom Column",
              DefaultValue: false,
            }).then(() => {
              NewWeb.lists.getByTitle(listTitle).defaultView.fields.add(item.Name)
              console.log(`${item.Name} column created successfully`)
            })
          }
        })
        // Execute the batch
        batch.execute().then(function () {
          console.log("Batch operations completed successfully");
        }).catch(function (error: any) {
          console.log("Error in batch operations: " + error);
        });

      });
    } catch (error) {
      console.error("Error creating list:", error);
    }
  }
  public tableListCreation() {
    var batch = NewWeb.createBatch();
    var ListColumns = [{ Name: "Company", Type: "SingleLine" },
    { Name: "Position", Type: "SingleLine" },
    { Name: "Date", Type: "SingleLine" },
    { Name: "RequestID", Type: "SingleLine" },
    { Name: "OrderNo", Type: "Number" },
    ]

    try {
      const listTitle = "Permit Table Transaction";
      const listDescription = "Form Template";
      NewWeb.lists.add(listTitle, listDescription, 100, false).then(() => {
        console.log(`${listTitle} List created successfully`);
        ListColumns.forEach(function (item) {
          if (item.Type == "SingleLine") {
            NewWeb.lists.getByTitle(listTitle).fields.inBatch(batch).addText(item.Name, 255, {
              Group: "Custom Column",
            }).then(() => {
              NewWeb.lists.getByTitle(listTitle).defaultView.fields.add(item.Name)
              console.log(`${item.Name} column created successfully`)
            })
          }
          else if (item.Type == "Number") {
            NewWeb.lists.getByTitle(listTitle).fields.inBatch(batch).addNumber(item.Name, {
              Group: "Custom Column",
            }).then(() => {
              NewWeb.lists.getByTitle(listTitle).defaultView.fields.add(item.Name)
              console.log(`${item.Name} column created successfully`)
            })
          }
        })
        // Execute the batch
        batch.execute().then(function () {
          console.log("Table List Batch operations completed successfully");
        }).catch(function (error: any) {
          console.log("Error in batch operations: " + error);
        });

      });
    } catch (error) {
      console.error("Error creating list:", error);
    }
  }
  public createAllDynamicLists() {
    // this.configureListCreation();
    // this.FormListCreation();
    this.tableListCreation();
  }
  public goToNewRequestForm() {
    this.setState({
      ShowNewForm: true,
      ShowDashboard: false
    });

  }
  private Dropdown() {
    $(".user-profile-details").toggleClass("open");
  }
  public render(): React.ReactElement<IDashboardProps> {
    // const {
    //   description,
    //   isDarkTheme,
    //   environmentMessage,
    //   hasTeamsContext,
    //   userDisplayName
    // } = this.props;
    SPComponentLoader.loadScript(`https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js`);
    SPComponentLoader.loadCss(`https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css`);
    SPComponentLoader.loadScript(`https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js`);
    return (
      <>
        {/* <button onClick={() => this.createAllDynamicLists()}>Click here to Configure</button> */}
        {this.state.ShowDashboard == true &&
          <>
            <div>
              <header>
                <div className="container clearfix">
                  <div className="logo">
                    <a href="#"> <img src="../img/add.svg" alt="image" /> </a>
                  </div>
                  <div className="notification-part">
                    <ul>
                      <li> <a href="#"> <img className="user_img" src={`${this.state.CurrentUserProfilePic}`} alt="image" /> </a> </li>
                      <li> <span> {this.state.LoggedinuserName} </span> </li>
                      <li> <a href="#"> <img className="next_img" src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/dropdown.svg`} onClick={this.Dropdown} alt="image" /> </a> </li>
                    </ul>
                    <div className="user-profile-details"><h3>  {this.state.LoggedinuserName} </h3>
                      <div className="logou-bck"><a href="https://login.windows.net/common/oauth2/logout" data-interception="off">
                        <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/logout_img.svg`} data-themekey="#" />Logout </a>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
            </div>
            <section>
              <div className="container">
                <div className="dashboard-wrap">
                  <div className="heading-block clearfix">
                    <h2> Dashboard </h2>
                    <p className="purchase_btn" onClick={() => this.goToNewRequestForm()}>Create New Request</p>
                  </div>


                  <div className="three-blocks-wrap">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="three-blocks">
                          <div className="three-blocks-img">
                            <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/Approved.svg`} alt="image" />
                          </div>
                          <div className="three-blocks-desc">
                            <h3>{this.state.ApprovedStatusCount}</h3>
                            <p> Total Completed </p>
                          </div>

                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="three-blocks">
                          <div className="three-blocks-img">
                            <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/pending.svg`} alt="image" />
                          </div>
                          <div className="three-blocks-desc">
                            <h3>{this.state.PendingStatusCount}</h3>
                            <p> Total Pending </p>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="table-wrap">
                    <div className="table-responsive">
                      <table className="table dashboard_table" id='SpfxDatatable'>
                        <thead>
                          <tr>
                            <th className="s_no"> S.No </th>
                            <th className="name"> Name </th>
                            <th className="dept-name"> Department </th>
                            <th className="Purpose"> Work Title</th>
                            <th className="Purpose"> Request ID</th>
                            <th className="Purpose">Requested On</th>
                            <th className="text-center status"> Status  </th>
                            <th className="text-center action_th"> Action  </th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.DashboardItems && this.state.DashboardItems.map((item, i) => {
                            return [
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{item.Name}</td>
                                <td>{item.Section}</td>
                                <td>{item.WorkTitle}</td>
                                <td>{item.RequestID}</td>
                                <td>{moment(item.Created).format('DD/MM/YYYY h:mm A')}</td>
                                <td className={`text-center status ${item.Status}`} >
                                  <span>{item.Status}</span>
                                </td>
                                <td className='text-center'><a href='#' title='View Request'>
                                  <img className="view_img" src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/view.svg`} alt="image" /> </a>
                                </td>
                              </tr>
                            ];
                          })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>


                </div>
              </div>
            </section>
          </>
        }
        {this.state.ShowNewForm == true &&
          <NewRequestForm
            itemId={0}
            description={''}
            siteurl={this.props.siteurl} isDarkTheme={false} environmentMessage={''} hasTeamsContext={false} userDisplayName={''}
          />
        }
      </>
    );
  }
}
