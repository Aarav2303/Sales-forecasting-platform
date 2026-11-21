
import React, { useRef, useState, useEffect } from "react";

function EmailGenerator() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const editorRef = useRef(null);

  const defaultMessage = `
    Dear Sir/Madam,<br/><br/>
    I hope you are doing well.<br/><br/>
    I am writing to connect with you regarding a potential business opportunity.<br/><br/>
    Looking forward to hearing from you.<br/><br/>
    Best Regards
  `;

  useEffect(() => {
    if (editorRef.current) {
      setCharCount(editorRef.current.innerText.length);
    }
  }, []);

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

    setCharCount(editor.innerText.length);
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

  // Regenerate email
  const regenerateEmail = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const newMessage = `
      Dear Sir/Madam,<br/><br/>
      I hope you are doing well.<br/><br/>
      I am reaching out regarding ${
        subject || "a potential business opportunity"
      }. I would appreciate the opportunity to connect with you and explore possible collaboration.<br/><br/>
      Looking forward to your response.<br/><br/>
      Best Regards
    `;

    editor.innerHTML = newMessage;
    setCharCount(editor.innerText.length);
  };

  // Clear email
  const clearEmail = () => {
    const editor = editorRef.current;
    if (!editor) return;

    if (window.confirm("Are you sure you want to clear the email?")) {
      editor.innerHTML = "";
      setCharCount(0);
    }
  };

  return (
    <div className={`email-page ${darkMode ? "dark-mode" : ""}`}>
      <div className="email-generator">

        {/* Header */}
        <div className="email-header">
          <div>
            <h2>Email Composer</h2>
            <p>Create and edit your outreach emails</p>
          </div>

          <div className="header-actions">
            <span className="draft-badge">Email Draft</span>

            <button
              type="button"
              className="theme-toggle"
              onClick={() => setDarkMode((prev) => !prev)}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

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
              onChange={(e) => setSubject(e.target.value)}
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
                onInput={(e) =>
                  setCharCount(e.currentTarget.innerText.length)
                }
                dangerouslySetInnerHTML={{
                  __html: defaultMessage,
                }}
              />

            </div>
          </div>

          {/* Footer */}
          <div className="editor-footer">
            <span>✏️ Edit your email before copying</span>
            <span>{charCount} characters</span>
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
            >
              ↻ Regenerate
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
