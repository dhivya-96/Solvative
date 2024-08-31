import React from "react";
import { useLocation, useMatch as testMatch } from "react-router-dom";
import "./styles/AppBar.css";

const AppBar = () => {
  const location = useLocation();
  const path = location.pathname;

  // Determine the title based on the current route
  const getTitle = () => {
    if (path.startsWith("/user/")) {
      return "User Details";
    }

    switch (location.pathname) {
      case "/":
        return "List all users";
      case "/new":
        return "Create User";
      default:
        return "My App";
    }
  };

  return (
    <div className="appbar">
      <div className="appbar-title">{getTitle()}</div>
    </div>
  );
};

export default AppBar;
