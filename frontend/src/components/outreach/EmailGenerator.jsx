import React, { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function getWordCount(text) {
  const trimmed = (text || "").trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function EmailGenerator() {
  const { leadId } = useParams();
  const location = useLocation();
  const selectedLead = location.state?.lead;

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // "idle" | "saving" | "saved" | "error"
  const [statusMessage, setStatusMessage] = useState("");

  const editorRef = useRef(null);
  const isHydratingRef = useRef(false);
  const hasUserEditedRef = useRef(false);
  const autoSaveTimerRef = useRef(null);

  const defaultMessage = `
    Dear Sir/Madam,<br/><br/>
    I hope you are doing well.<br/><br/>
    I am writing to connect with you regarding a potential business opportunity.<br/><br/>
    Looking forward to hearing from you.<br/><br/>
    Best Regards
  `;

  const syncCounts = useCallback(() => {
    const text = editorRef.current?.innerText || "";
    setCharCount(text.length);
    setWordCount(getWordCount(text));
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const persistOutreach = useCallback(
    async (nextSubject, nextBodyText, { manual = false } = {}) => {
      if (!leadId) {
        if (manual) {
          window.alert("Select a lead first to save edits to the database.");
        }
        return;
      }

      setSaveState("saving");
      if (manual) {
        setStatusMessage("");
      }

      try {
        const res = await fetch(`${API_BASE}/outreach/${leadId}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            subject: nextSubject,
            email_body: nextBodyText,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to save outreach");
        }

        setSaveState("saved");
        setStatusMessage(
          manual ? "Edits saved successfully!" : "Auto-saved to workspace."
        );
      } catch {
        setSaveState("error");
        setStatusMessage("Could not save changes. Check backend connection.");
      }
    },
    [leadId]
  );

  const scheduleAutoSave = useCallback(
    (nextSubject = subject) => {
      if (!leadId || isHydratingRef.current || !hasUserEditedRef.current) {
        return;
      }

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        const bodyText = editorRef.current?.innerText || "";
        persistOutreach(nextSubject, bodyText, { manual: false });
      }, 1200);
    },
    [leadId, subject, persistOutreach]
  );

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Pre-fill recipient email & fetch existing outreach plan via GET /outreach/{leadId}
  useEffect(() => {
    hasUserEditedRef.current = false;
    setSaveState("idle");

    if (selectedLead?.email) {
      setTo(selectedLead.email);
    }

    if (!leadId) {
      syncCounts();
      return;
    }

    const fetchExistingOutreach = async () => {
      setLoading(true);
      setStatusMessage("");
      isHydratingRef.current = true;

      try {
        const res = await fetch(`${API_BASE}/outreach/${leadId}`, {
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.plan) {
            setSubject(data.plan.subject || "");
            if (editorRef.current && data.plan.email_body) {
              editorRef.current.innerHTML = data.plan.email_body.replace(
                /\n/g,
                "<br/>"
              );
            }
            setStatusMessage("Loaded saved outreach plan.");
          }
        }
      } catch {
        // Keep default draft if no saved plan exists yet
      } finally {
        syncCounts();
        isHydratingRef.current = false;
        setLoading(false);
      }
    };

    fetchExistingOutreach();
  }, [leadId, selectedLead, syncCounts]);

  const handleSubjectChange = (e) => {
    const nextSubject = e.target.value;
    setSubject(nextSubject);
    hasUserEditedRef.current = true;
    scheduleAutoSave(nextSubject);
  };

  const handleEditorInput = () => {
    syncCounts();
    if (!isHydratingRef.current) {
      hasUserEditedRef.current = true;
      scheduleAutoSave(subject);
    }
  };

  // Text formatting
  const formatText = (command) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    if (command === "createLink") {
      const url = window.prompt("Enter URL:");

      if (url) {
        try {
          const parsedUrl = new URL(url);

          if (
            parsedUrl.protocol === "https:" ||
            parsedUrl.protocol === "http:"
          ) {
            document.execCommand("createLink", false, url);
          } else {
            window.alert("Enter a valid HTTP or HTTPS URL.");
          }
        } catch {
          window.alert("Enter a valid URL.");
        }
      }
    } else {
      document.execCommand(command, false, null);
    }

    handleEditorInput();
  };

  // Copy email
  const copyEmail = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const email = `To: ${to}
Subject: ${subject}

${editor.innerText}`;

    try {
      await navigator.clipboard.writeText(email);
      window.alert("Email copied successfully!");
    } catch {
      window.alert("Unable to copy email. Please check clipboard permissions.");
    }
  };

  // Generate / Regenerate email via POST /outreach/{leadId}
  const regenerateEmail = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const cleanSubject = subject.trim();
    const serviceOffered = cleanSubject || "AI Sales Intelligence Platform";

    if (!leadId) {
      isHydratingRef.current = true;
      editor.innerHTML = `
        Dear Sir/Madam,<br/><br/>
        I hope you are doing well.<br/><br/>
        I am reaching out regarding ${serviceOffered}. I would appreciate the opportunity to connect with you and explore possible collaboration.<br/><br/>
        Looking forward to your response.<br/><br/>
        Best Regards
      `;
      syncCounts();
      isHydratingRef.current = false;
      return;
    }

    setLoading(true);
    setStatusMessage("");
    isHydratingRef.current = true;

    try {
      const res = await fetch(`${API_BASE}/outreach/${leadId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          service_offered: serviceOffered,
          tone: "professional",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate outreach");
      }

      const data = await res.json();
      if (data?.plan) {
        const nextSubject =
          data.plan.subject && data.plan.subject !== "Exploring string"
            ? data.plan.subject
            : cleanSubject || `Outreach for ${selectedLead?.name || `Lead #${leadId}`}`;

        setSubject(nextSubject);
        if (data.plan.email_body) {
          editor.innerHTML = data.plan.email_body.replace(/\n/g, "<br/>");
        }
        setStatusMessage("Generated new AI outreach plan.");
      }
    } catch {
      setStatusMessage("Could not reach backend; updated local draft.");
    } finally {
      syncCounts();
      isHydratingRef.current = false;
      setLoading(false);
    }
  };

  // Manual save fallback
  const saveEdits = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    const bodyText = editorRef.current?.innerText || "";
    await persistOutreach(subject, bodyText, { manual: true });
  };

  // Clear email
  const clearEmail = () => {
    const editor = editorRef.current;
    if (!editor) return;

    if (window.confirm("Are you sure you want to clear the email?")) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      isHydratingRef.current = true;
      editor.innerHTML = "";
      syncCounts();
      isHydratingRef.current = false;
      hasUserEditedRef.current = true;
      setSaveState("idle");
      setStatusMessage("");
      if (leadId) {
        persistOutreach(subject, "", { manual: false });
      }
    }
  };

  return (
    <div className={`email-page ${darkMode ? "dark-mode" : ""}`}>
      <div className="email-generator">
        {/* Header */}
        <div className="email-header">
          <div>
            <h2>
              Email Composer{" "}
              {selectedLead
                ? `— ${selectedLead.name}`
                : leadId
                ? `— Lead #${leadId}`
                : ""}
            </h2>
            <p>Create and edit your outreach emails</p>
          </div>

          <div className="header-actions">
            <span className="draft-badge">
              {loading
                ? "Loading..."
                : saveState === "saving"
                ? "Saving..."
                : saveState === "saved"
                ? "Saved"
                : leadId
                ? `Lead #${leadId}`
                : "Email Draft"}
            </span>

            <button
              type="button"
              className="theme-toggle"
              onClick={() => setDarkMode((prev) => !prev)}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {statusMessage && (
          <p
            className="status-banner"
            style={{
              marginBottom: "12px",
              color: saveState === "error" ? "#DC2626" : "#2563EB",
              fontSize: "0.9rem",
            }}
          >
            {statusMessage}
          </p>
        )}

        <div className="email-form">
          {/* Recipient */}
          <div className="form-group">
            <label htmlFor="recipient">To</label>
            <input
              id="recipient"
              type="email"
              placeholder="Enter recipient email address"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {/* Subject */}
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              placeholder="Enter email subject"
              value={subject}
              onChange={handleSubjectChange}
            />
          </div>

          {/* Email Editor */}
          <div className="form-group">
            <label>Email Body</label>

            <div className="editor-container">
              {/* Toolbar */}
              <div className="toolbar">
                <button
                  type="button"
                  title="Bold"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatText("bold")}
                >
                  <b>B</b>
                </button>

                <button
                  type="button"
                  title="Italic"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatText("italic")}
                >
                  <i>I</i>
                </button>

                <button
                  type="button"
                  title="Underline"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatText("underline")}
                >
                  <u>U</u>
                </button>

                <span className="toolbar-divider"></span>

                <button
                  type="button"
                  className="link-button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatText("createLink")}
                >
                  🔗 Link
                </button>
              </div>

              {/* Editable Email Body */}
              <div
                ref={editorRef}
                className="email-body"
                contentEditable
                suppressContentEditableWarning={true}
                onInput={handleEditorInput}
                dangerouslySetInnerHTML={{
                  __html: defaultMessage,
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="editor-footer">
            <span>
              {leadId
                ? "✨ Changes auto-save after you pause typing"
                : "✏️ Edit your email before copying"}
            </span>
            <span>
              {wordCount} words · {charCount} characters
            </span>
          </div>

          {/* Actions */}
          <div className="email-actions">
            <button
              type="button"
              className="copy-button"
              onClick={copyEmail}
            >
              📋 Copy Email
            </button>

            <button
              type="button"
              className="regenerate-button"
              onClick={regenerateEmail}
              disabled={loading}
            >
              {loading ? "Generating..." : "↻ Generate / Regenerate"}
            </button>

            <button
              type="button"
              className="clear-button"
              onClick={clearEmail}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailGenerator;