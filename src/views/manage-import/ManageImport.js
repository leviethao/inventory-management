import React from "react";

// core components
import IndexNavbar from "./components/Navbars/IndexNavbar.js";
import PageHeader from "./components/PageHeader/PageHeader.js";
import Footer from "./components/Footer/Footer.js";

// sections for this page/view
import Basics from "./IndexSections/Basics.js";
import Navbars from "./IndexSections/Navbars.js";
import Tabs from "./IndexSections/Tabs.js";
import Pagination from "./IndexSections/Pagination.js";
import Notifications from "./IndexSections/Notifications.js";
import Typography from "./IndexSections/Typography.js";
import JavaScript from "./IndexSections/JavaScript.js";
import NucleoIcons from "./IndexSections/NucleoIcons.js";
import Signup from "./IndexSections/Signup.js";
import Examples from "./IndexSections/Examples.js";
import Download from "./IndexSections/Download.js";
import Table from "./components/Table/index.js";
import { dataList, headerList } from "./components/Table/data.js";
import { api } from "services/api/index.js";

export default function ManageImport() {
  React.useEffect(() => {
    document.body.classList.toggle("index-page");
    api.get('/').then(res => console.log('res hihii: ', res.data))
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("index-page");
    };
  },[]);

  return (
    <>
      <IndexNavbar />
      <div className="wrapper">
        {/* <PageHeader /> */}
        <div className="main">
          <Table headerList={headerList} dataList={dataList} />
          <Basics />
          <Navbars />
          <Tabs />
          <Pagination />
          <Notifications />
          <Typography />
          <JavaScript />
          <NucleoIcons />
          <Signup />
          <Examples />
          <Download />
        </div>
        <Footer />
      </div>
    </>
  );
}
