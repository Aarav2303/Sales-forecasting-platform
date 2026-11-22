
import React from "react";
import { useNavigate } from "react-router-dom";

function LeadsPage() {
  const navigate = useNavigate();

  const leads = [
    { id: 101, name: "Rahul", email: "rahul@gmail.com", status: "New" },
    { id: 102, name: "Priya", email: "priya@gmail.com", status: "Contacted" },
    { id: 103, name: "Arjun", email: "arjun@gmail.com", status: "Interested" },
    { id: 104, name: "Sneha", email: "sneha@gmail.com", status: "New" }
  ];

  return (
    <div className="leads-page">
      <h1>Leads</h1>
      <p>Manage and track your potential customers.</p>

      <table>
        <thead>
          <tr>
            <th>Lead ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.id}</td>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.status}</td>
              <td>
                <button onClick={() => navigate(`/analysis/${lead.id}`)}>
                  View Analysis
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadsPage;
