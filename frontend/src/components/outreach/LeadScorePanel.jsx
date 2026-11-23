import React from "react";

export default function LeadScorePanel({
  score = 92,
  tierLabel = "Highly Qualified Lead",
  conversionProbability = 78,
  factors = [
    { label: "Company Growth", impact: "+25 points", detail: "Series C expansion signals" },
    { label: "Industry Match", impact: "+22 points", detail: "Strong ICP alignment" },
    { label: "Tech Stack Fit", impact: "+20 points", detail: "Compatible cloud & data stack" },
    { label: "Decision Maker", impact: "+25 points", detail: "Direct executive access" },
  ],
}) {
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const clampedProb = Math.max(0, Math.min(100, Number(conversionProbability) || 0));

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Lead Score</h2>
        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          AI Powered
        </span>
      </div>

      {/* 0-100 Circular Lead Score Gauge */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#2563eb"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">{clampedScore}</span>
          </div>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-600">{tierLabel}</p>
      </div>

      {/* Conversion Probability Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-600">Conversion Probability</span>
          <span className="font-semibold text-slate-900">{clampedProb}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${clampedProb}%` }}
          />
        </div>
      </div>

      {/* Scoring Factors List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Scoring Factors
        </h3>
        <ul className="space-y-2">
          {factors.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                {item.detail && <p className="text-xs text-slate-500">{item.detail}</p>}
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                {item.impact}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}