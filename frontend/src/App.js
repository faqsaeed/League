import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./Login";
import SignUp from "./signup";
import MainPage from "./MainPage";
import TeamPage from "./TeamPage";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Route path="/main" component={MainPage} />
        <Route path="/teams/:id" component={TeamPage} />
      </Switch>
    </Router>
  );
}

export default App;
