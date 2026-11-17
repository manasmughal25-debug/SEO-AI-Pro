import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label = 'Score',
  size = 'md',
  showLabel = true
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine color theme
  let strokeColor = '#10b981'; // green-500
  let textColor = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/10';
  let badgeLabel = 'Excellent';

  if (clampedScore < 50) {
    strokeColor = '#ef4444'; // red-500
    textColor = 'text-red-400';
    bgColor = 'bg-red-500/10';
    badgeLabel = 'Needs Fixes';
  } else if (clampedScore < 80) {
    strokeColor = '#f59e0b'; // amber-500
    textColor = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
    badgeLabel = 'Fair';
  }

  const dimensions = {
    sm: { width: 64, stroke: 5, fontSize: 'text-base', labelSize: 'text-[10px]' },
    md: { width: 96, stroke: 7, fontSize: 'text-2xl', labelSize: 'text-xs' },
    lg: { width: 130, stroke: 9, fontSize: 'text-3xl', labelSize: 'text-sm' },
    xl: { width: 170, stroke: 11, fontSize: 'text-5xl', labelSize: 'text-base' }
  }[size];

  const radius = (dimensions.width - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: dimensions.width, height: dimensions.width }}>
        <svg
          className="transform -rotate-90"
          width={dimensions.width}
          height={dimensions.width}
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold tracking-tight font-mono ${dimensions.fontSize} ${textColor}`}>
            {clampedScore}
          </span>
          {size === 'xl' && (
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              / 100
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <span className="text-xs font-medium text-slate-300 block">{label}</span>
          <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold ${bgColor} ${textColor}`}>
            {badgeLabel}
          </span>
        </div>
      )}
    </div>
  );
};
