import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/signup";
import MainPage from "./pages/MainPage";
import TeamPage from "./pages/TeamPage";
import PlayerStatsPage from "./pages/PlayerStatPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/teams/:teamname" element={<TeamPage />} />
      <Route path="/players/:name" element={<PlayerStatsPage />} />
    </Routes>
  );
}

export default App;