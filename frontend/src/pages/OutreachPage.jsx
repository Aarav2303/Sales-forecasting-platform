import React, { useState } from "react";
import EmailGenerator from "../components/outreach/EmailGenerator";
import LeadScorePanel from "../components/outreach/LeadScorePanel";
import OutreachStrategyPanel from "../components/outreach/OutreachStrategyPanel";

export default function OutreachPage() {
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Outreach Generation &amp; Lead Scoring
            </h1>
            <p className="text-sm text-slate-500">
              Personalized email creation and AI-powered lead qualification
            </p>
          </div>
          {selectedStrategy && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Selected Strategy: {selectedStrategy.title}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div>
            <EmailGenerator />
          </div>

          <div>
            <LeadScorePanel />
          </div>

          <div>
            <OutreachStrategyPanel
              onSelectStrategy={(strategy) => setSelectedStrategy(strategy)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}