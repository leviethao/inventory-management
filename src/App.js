import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "assets/css/nucleo-icons.css";
import "assets/scss/blk-design-system-react.scss?v=1.2.0";
import "assets/demo/demo.css";

import Index from "./views/manage-import/Index";
import LandingPage from "./views/manage-import/examples/LandingPage";
import RegisterPage from "./views/manage-import/examples/RegisterPage";
import ProfilePage from "./views/manage-import/examples/ProfilePage";
import ManageImport from "views/manage-import/ManageImport";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { Provider } from 'react-redux'
import { store } from "redux/store";
import Login from "views/manage-import/components/Login";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "redux/store";

const App = () => {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <BrowserRouter>
                        <Switch>
                            <Route path="/" render={(props) => <ManageImport {...props} />} />
                            <Route path="/components" render={(props) => <Index {...props} />} />
                            <Route
                                path="/landing-page"
                                render={(props) => <LandingPage {...props} />}
                            />
                            <Route
                                path="/register-page"
                                render={(props) => <RegisterPage {...props} />}
                            />
                            <Route
                                path="/profile-page"
                                render={(props) => <ProfilePage {...props} />}
                            />
                            {/* <Redirect from="/" to="/inventory-management/import-follow-up" /> */}
                        </Switch>
                    </BrowserRouter>
                </LocalizationProvider>
            </PersistGate>
        </Provider>
    )
}
export default App
