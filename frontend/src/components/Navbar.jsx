
import React from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>Sales Forecasting</h2>

      <div className="nav-links">
        <NavLink to="/Leads/">Leads</NavLink>
        <NavLink to="/Outreach/">Outreach</NavLink>
        <NavLink to="/Conversations/">Conversations</NavLink>
        <NavLink to="/Dashboard/">Dashboard</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
