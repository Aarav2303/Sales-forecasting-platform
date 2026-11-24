import React from "react";

export default function OutreachStrategyPanel({
  strategies = [
    {
      title: "Executive Value & Expansion Pitch",
      channel: "Email + LinkedIn",
      timing: "Day 1 • 9:30 AM",
      priority: "High Priority",
      summary:
        "Reference recent growth and align outreach around scaling analytics and operational efficiency.",
    },
    {
      title: "Case Study & Architecture Follow-Up",
      channel: "Email",
      timing: "Day 3 • 2:00 PM",
      priority: "Medium Priority",
      summary:
        "Share a concise proof point from a similar company and propose a short discovery call.",
    },
    {
      title: "Direct Call & Stakeholder Check-In",
      channel: "Phone / LinkedIn DM",
      timing: "Day 6 • 11:00 AM",
      priority: "Follow-Up",
      summary:
        "Check in on Q3 priorities and offer a tailored 15-minute walkthrough for their team.",
    },
  ],
  onSelectStrategy,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Outreach Strategy</h2>
          <p className="text-xs text-slate-500">Recommended engagement sequence & channels</p>
        </div>
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          AI Recommended
        </span>
      </div>

      <div className="space-y-3">
        {strategies.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectStrategy && onSelectStrategy(item)}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-blue-300 transition-colors space-y-2 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                {item.priority}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200/70">
              <span>Channel: {item.channel}</span>
              <span>{item.timing}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}