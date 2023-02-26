import { Route, Switch } from "react-router-dom";
import LandingPage from "./containers/landing_page/LandingPage";
import MeetingRoom from "./containers/meeting_room/MeetingRoom";

function App() {
  return (
    <div>
      <Switch>
        <Route path="/" render={() => <LandingPage />} exact />
        <Route path="/chat/:meetId" render={() => <MeetingRoom />} exact />
      </Switch>
    </div>
  );
}

export default App;
