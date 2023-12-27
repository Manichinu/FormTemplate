import * as React from 'react';
// import styles from './Dashboard.module.scss';
import type { IDashboardProps } from './IDashboardProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { Web } from '@pnp/sp/presets/all';

let NewWeb: any;
export default class Dashboard extends React.Component<IDashboardProps, {}> {
  public constructor(props: IDashboardProps) {
    super(props);
    NewWeb = Web(this.props.siteurl)
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
  public createAllDynamicLists() {
    // this.configureListCreation();
    this.FormListCreation();
  }
  public render(): React.ReactElement<IDashboardProps> {
    // const {
    //   description,
    //   isDarkTheme,
    //   environmentMessage,
    //   hasTeamsContext,
    //   userDisplayName
    // } = this.props;

    return (
      <>
        <h2>Dashboard</h2>
        <button onClick={() => this.createAllDynamicLists()}>Click here to Configure</button>
      </>
    );
  }
}
