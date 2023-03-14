import React from "react";
import { Route, Switch } from "react-router-dom";

import "./App.module.scss";
import Layout from "./hoc/Layout/Layout";
import Guard from "./hoc/Guard/Guard";
import RoomsDashboard from "./containers/RoomsDashboard/RoomsDashboard";
import asyncComponent from "./hoc/asyncComponent/asyncComponent";
import Login from "./containers/Auth/Login/Login";
import Register from "./containers/Auth/Register/Register";

function App() {
  const AsyncRoomsDevices = asyncComponent(() =>
    import("./containers/RoomsDashboard/RoomDevices/RoomDevices")
  );
  
  return (
    <Layout>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/register" exact component={Register} />
        <Guard>
          <Route path="/" exact component={RoomsDashboard} />
          <Route path="/room/:id" exact component={AsyncRoomsDevices} />
        </Guard>
      </Switch>
    </Layout>
  );
}

export default App;
