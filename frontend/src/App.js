import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/signup";
import MainPage from "./pages/MainPage";
import TeamPage from "./pages/TeamPage";
import PlayerStatsPage from "./pages/PlayerStatPage";
import PointTablePage from "./pages/PointTable";
import SchedulePage from "./pages/Match";
import Header from "./components/Header";

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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/teams/:teamname" element={<TeamPage />} />
        <Route path="/players/:name" element={<PlayerStatsPage />} />
        <Route path="/points" element={<PointTablePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </>
  );
}

export default App;
