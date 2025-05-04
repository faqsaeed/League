import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import TeamPage from "./pages/TeamPage";
import PlayerStatsPage from "./pages/PlayerStatPage";
import PointTablePage from "./pages/PointTable";
import SchedulePage from "./pages/Match";
import Header from "./components/Header";
import TeamDashboard from "./pages/TeamDashboard";
import CreateTeam from "./pages/createTeam";
import EditTeam from "./pages/editTeam";
import MatchDashboard from './pages/MatchDashboard';
import CreateMatch from './pages/CreateMatch';
import EditMatch from "./pages/EditMatch";
import PlayerDashboard from "./pages/PlayerDashboard";
import CreatePlayer from "./pages/CreatePlayer";
import EditPlayer from "./pages/EditPlayer";

function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const hideHeaderPaths = ["/login", "/signup"];

  return (
    <>
      {!hideHeaderPaths.includes(location.pathname) && (
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/teams/:teamname" element={<TeamPage />} />
        <Route path="/players/:name" element={<PlayerStatsPage />} />
        <Route path="/points" element={<PointTablePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/admin/teamdashboard" element={<TeamDashboard />} />
        <Route path="/admin/createteam" element={<CreateTeam />} />
        <Route path="/admin/editteam/:teamId" element={<EditTeam />} />
        <Route path="/admin/matchdashboard" element={<MatchDashboard />} />
        <Route path="/admin/creatematch" element={<CreateMatch />} />
        <Route path="/admin/editmatch/:matchId" element={<EditMatch />} />
        <Route path="/admin/playerdashboard/:teamId" element={<PlayerDashboard />} />
        <Route path="/admin/createplayer/:ID" element={<CreatePlayer/>} />
        <Route path="/admin/editplayer/:id" element={<EditPlayer />} />
</Routes>
    </>
  );
}

export default App;
