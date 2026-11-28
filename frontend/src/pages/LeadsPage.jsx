import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const FALLBACK_LEADS = [
  {
    id: 101,
    company_name: "TechCorp Solutions",
    contact_person: "Rahul Sharma",
    industry: "Enterprise Software",
    email: "rahul@gmail.com",
    status: "new",
  },
];

function formatApiError(errData) {
  if (!errData) return "Failed to add lead.";
  if (typeof errData.detail === "string") return errData.detail;
  if (Array.isArray(errData.detail)) {
    return errData.detail
      .map((item) => {
        const field = Array.isArray(item.loc)
          ? item.loc[item.loc.length - 1]
          : "field";
        return `${field}: ${item.msg}`;
      })
      .join(" | ");
  }
  return "Validation error while adding lead.";
}

function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState(FALLBACK_LEADS);
  const [usingFallback, setUsingFallback] = useState(true);

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [industry, setIndustry] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("new");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    fetch(`${API_BASE}/leads/`, {
      headers: getAuthHeaders(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLeads(data);
          setUsingFallback(false);
        }
      })
      .catch(() => {
        // Keeps FALLBACK_LEADS if backend is offline
      });
  }, []);

  const handleAddLead = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!companyName.trim() || !email.trim()) {
      setFormError("Please enter both company name and email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/leads/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          company_name: companyName.trim(),
          contact_person: contactPerson.trim() || null,
          industry: industry.trim() || null,
          email: email.trim(),
          status,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(formatApiError(errData));
      }

      const createdLead = await res.json();
      setLeads((prev) =>
        usingFallback ? [createdLead] : [...prev, createdLead]
      );
      setUsingFallback(false);
      setCompanyName("");
      setContactPerson("");
      setIndustry("");
      setEmail("");
      setStatus("new");
    } catch (err) {
      setFormError(err.message || "Could not add lead.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenOutreach = (lead) => {
    navigate(`/Outreach/${lead.id}`, {
      state: {
        lead: {
          ...lead,
          name: lead.company_name || lead.contact_person || `Lead #${lead.id}`,
        },
      },
    });
  };

  return (
    <div className="leads-page">
      <h1>Leads</h1>
      <p>Manage and track your potential customers.</p>

      {/* Quick Add Lead Form */}
      <form
        onSubmit={handleAddLead}
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          margin: "16px 0 24px",
        }}
      >
        <input
          type="text"
          placeholder="Company Name *"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Contact Person"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
        <input
          type="text"
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="interested">Interested</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "+ Add Lead"}
        </button>
      </form>

      {formError && (
        <p style={{ color: "#DC2626", marginBottom: "12px" }}>{formError}</p>
      )}

      <table>
        <thead>
          <tr>
            <th>Lead ID</th>
            <th>Company</th>
            <th>Contact</th>
            <th>Industry</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.id}</td>
              <td>{lead.company_name || "—"}</td>
              <td>{lead.contact_person || "—"}</td>
              <td>{lead.industry || "—"}</td>
              <td>{lead.email}</td>
              <td>{lead.status}</td>
              <td>
                <button type="button" onClick={() => handleOpenOutreach(lead)}>
                  Open Outreach
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