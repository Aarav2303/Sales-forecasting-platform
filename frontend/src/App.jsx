import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LeadsPage from "./pages/LeadsPage";
import EmailGenerator from "./components/outreach/EmailGenerator";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route path="/" element={<Navigate to="/Leads/" />} />
          <Route path="/Leads/" element={<LeadsPage />} />
          <Route path="/Outreach/" element={<EmailGenerator />} />
          <Route path="/Conversations/" element={<h1>Conversations</h1>} />
          <Route path="/Dashboard/" element={<h1>Dashboard</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
