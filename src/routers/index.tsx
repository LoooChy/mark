import React from 'react';
import { Route, Switch, Router, Redirect } from 'dva/router';
// import Home from './home';
import Mark from './mark';

// import CornerstoneDiyTool from '@/components/cornerstoneDiyTool';
import { RouteComponentProps } from 'dva/router';
import { SubscriptionAPI } from 'dva';
interface Props extends RouteComponentProps { }
const App = (props: Props & SubscriptionAPI) => {
  return (
    <Router history={props.history}>
      <Switch>
        {/* <Route path="/home" render={() => <Home />}></Route> */}
        {/* <Route path="/login" render={() => <Login />}></Route> */}
        <Route path="/mark" render={() => <Mark />}></Route>
        {/* <Route path="/cornerstoneDiyTool" render={() => <CornerstoneDiyTool />}></Route> */}
        {/* <Route path="/" render={() => <Login />}></Route> */}
      </Switch>
    </Router>
  );
};
export default App;
