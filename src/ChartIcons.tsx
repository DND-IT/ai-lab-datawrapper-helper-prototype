import React from 'react';

export const ChartIcon = ({ type, className = "" }: { type: string, className?: string }) => {
  const cDark = "#1D81A2";
  const cLight = "#7BB8D1";
  const cLighter = "#C2E0EB";
  const cLine = "#E0E6E8";

  const renderIcon = () => {
    switch (type) {
      case "d3-bars":
        return (
          <g transform="translate(18, 24)">
            <rect width="45" height="12" y="0" rx="1.5" fill={cDark} />
            <rect width="66" height="12" y="18" rx="1.5" fill={cDark} />
            <rect width="52" height="12" y="36" rx="1.5" fill={cDark} />
          </g>
        );
      case "d3-bars-stacked":
        return (
          <g transform="translate(18, 24)">
            <rect width="28" height="12" y="0" rx="1.5" fill={cDark} />
            <rect width="26" height="12" x="31" y="0" rx="1.5" fill={cLight} />
            <rect width="44" height="12" y="18" rx="1.5" fill={cDark} />
            <rect width="23" height="12" x="47" y="18" rx="1.5" fill={cLight} />
            <rect width="20" height="12" y="36" rx="1.5" fill={cDark} />
            <rect width="36" height="12" x="23" y="36" rx="1.5" fill={cLight} />
          </g>
        );
      case "d3-bars-grouped":
        return (
          <g transform="translate(18, 16)">
            <rect width="28" height="10" y="0" rx="1.5" fill={cDark} />
            <rect width="42" height="10" y="12" rx="1.5" fill={cLight} />
            <rect width="46" height="10" y="26" rx="1.5" fill={cDark} />
            <rect width="30" height="10" y="38" rx="1.5" fill={cLight} />
            <rect width="36" height="10" y="52" rx="1.5" fill={cDark} />
            <rect width="54" height="10" y="64" rx="1.5" fill={cLight} />
          </g>
        );
      case "d3-bars-split":
        return (
          <g transform="translate(20, 24)">
            <rect width="14" height="12" x="0" y="0" rx="1.5" fill={cDark} />
            <rect width="16" height="12" x="40" y="0" rx="1.5" fill={cLight} />
            <rect width="26" height="12" x="0" y="18" rx="1.5" fill={cDark} />
            <rect width="28" height="12" x="40" y="18" rx="1.5" fill={cLight} />
            <rect width="32" height="12" x="0" y="36" rx="1.5" fill={cDark} />
            <rect width="14" height="12" x="40" y="36" rx="1.5" fill={cLight} />
          </g>
        );
      case "d3-bars-bullet":
        return (
          <g transform="translate(18, 25)">
            <rect width="70" height="16" y="0" rx="2" fill={cLighter} opacity="0.8"/>
            <rect width="38" height="8" y="4" rx="1.5" fill={cDark} />
            <rect width="4" height="20" x="52" y="-2" rx="1" fill={cDark} />
            <rect width="50" height="16" y="30" rx="2" fill={cLighter} opacity="0.8"/>
            <rect width="32" height="8" y="34" rx="1.5" fill={cDark} />
            <rect width="4" height="20" x="42" y="28" rx="1" fill={cDark} />
          </g>
        );
      case "column-chart":
        return (
          <g transform="translate(24, 20)">
            <rect x="0" y="30" width="12" height="30" rx="1.5" fill={cDark} />
            <rect x="18" y="0" width="12" height="60" rx="1.5" fill={cDark} />
            <rect x="36" y="18" width="12" height="42" rx="1.5" fill={cDark} />
          </g>
        );
      case "stacked-column-chart":
        return (
          <g transform="translate(22, 18)">
            <rect x="0" y="40" width="12" height="22" rx="1.5" fill={cDark} />
            <rect x="0" y="20" width="12" height="18" rx="1.5" fill={cLight} />
            <rect x="18" y="32" width="12" height="30" rx="1.5" fill={cDark} />
            <rect x="18" y="0" width="12" height="30" rx="1.5" fill={cLight} />
            <rect x="36" y="35" width="12" height="27" rx="1.5" fill={cDark} />
            <rect x="36" y="20" width="12" height="13" rx="1.5" fill={cLight} />
          </g>
        );
      case "grouped-columns-chart":
      case "grouped-column-chart":
      case "grouped-columns":
        return (
          <g transform="translate(20, 20)">
            <rect x="0" y="32" width="10" height="28" rx="1.5" fill={cDark} />
            <rect x="12" y="40" width="10" height="20" rx="1.5" fill={cLight} />
            <rect x="25" y="10" width="10" height="50" rx="1.5" fill={cDark} />
            <rect x="37" y="25" width="10" height="35" rx="1.5" fill={cLight} />
            <rect x="50" y="20" width="10" height="40" rx="1.5" fill={cDark} />
            <rect x="62" y="15" width="10" height="45" rx="1.5" fill={cLight} />
          </g>
        );
      case "multiple-columns":
        return (
          <g transform="translate(25, 20)">
            {/* Top Left */}
            <rect x="0" y="12" width="5" height="16" rx="1" fill={cDark} />
            <rect x="7" y="0" width="5" height="28" rx="1" fill={cDark} />
            <rect x="14" y="8" width="5" height="20" rx="1" fill={cDark} />
            {/* Top Right */}
            <rect x="32" y="14" width="5" height="14" rx="1" fill={cDark} />
            <rect x="39" y="4" width="5" height="24" rx="1" fill={cDark} />
            <rect x="46" y="10" width="5" height="18" rx="1" fill={cDark} />
            {/* Bottom Left */}
            <rect x="0" y="46" width="5" height="14" rx="1" fill={cDark} />
            <rect x="7" y="36" width="5" height="24" rx="1" fill={cDark} />
            <rect x="14" y="40" width="5" height="20" rx="1" fill={cDark} />
            {/* Bottom Right */}
            <rect x="32" y="42" width="5" height="18" rx="1" fill={cDark} />
            <rect x="39" y="50" width="5" height="10" rx="1" fill={cDark} />
            <rect x="46" y="46" width="5" height="14" rx="1" fill={cDark} />
          </g>
        );
      case "d3-lines":
      case "lines":
        return (
          <g transform="translate(15, 20)">
            <line x1="0" y1="52" x2="70" y2="52" stroke={cLine} strokeWidth="3" />
            <line x1="0" y1="26" x2="70" y2="26" stroke={cLine} strokeWidth="3" />
            <path d="M 0 32 L 20 18 L 40 38 L 70 8" stroke={cDark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 0 52 L 20 40 L 40 48 L 70 30" stroke={cLight} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );
      case "multiple-lines":
        return (
          <g transform="translate(18, 20)">
            <path d="M 0 10 L 10 3 L 20 12 L 30 0" stroke={cDark} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 36 18 L 46 8 L 56 16 L 66 5" stroke={cDark} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 0 46 L 10 32 L 20 40 L 30 26" stroke={cLight} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 36 38 L 46 52 L 56 42 L 66 32" stroke={cLight} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="-2" y1="22" x2="32" y2="22" stroke={cLine} strokeWidth="2" strokeLinecap="round"/>
            <line x1="-2" y1="56" x2="32" y2="56" stroke={cLine} strokeWidth="2" strokeLinecap="round"/>
            <line x1="34" y1="22" x2="68" y2="22" stroke={cLine} strokeWidth="2" strokeLinecap="round"/>
            <line x1="34" y1="56" x2="68" y2="56" stroke={cLine} strokeWidth="2" strokeLinecap="round"/>
          </g>
        );
      case "d3-area":
        return (
          <g transform="translate(18, 20)">
            <path d="M 0 35 L 20 15 L 40 25 L 68 8 L 68 55 L 0 55 Z" fill={cDark} />
            <path d="M 0 20 L 20 30 L 40 10 L 68 22 L 68 55 L 0 55 Z" fill={cLight} opacity="0.6"/>
          </g>
        );
      case "d3-scatter-plot":
        return (
          <g transform="translate(20, 20)">
            <circle cx="20" cy="38" r="10" fill={cLight} />
            <circle cx="45" cy="18" r="6" fill={cLight} />
            <circle cx="8" cy="16" r="4" fill={cDark} />
            <circle cx="56" cy="40" r="4" fill={cDark} />
            <circle cx="36" cy="50" r="5" fill={cDark} />
            <circle cx="28" cy="12" r="4" fill={cDark} />
            <circle cx="32" cy="28" r="2.5" fill={cDark} />
          </g>
        );
      case "d3-dot-plot":
        return (
          <g transform="translate(16, 20)">
            <line x1="0" y1="10" x2="68" y2="10" stroke={cLine} strokeWidth="4" strokeLinecap="round" />
            <line x1="0" y1="30" x2="68" y2="30" stroke={cLine} strokeWidth="4" strokeLinecap="round"/>
            <line x1="0" y1="50" x2="68" y2="50" stroke={cLine} strokeWidth="4" strokeLinecap="round"/>
            <circle cx="48" cy="10" r="6" fill={cDark} />
            <circle cx="20" cy="30" r="6" fill={cDark} />
            <circle cx="36" cy="50" r="6" fill={cDark} />
          </g>
        );
      case "d3-range-plot":
        return (
          <g transform="translate(16, 20)">
            <line x1="0" y1="10" x2="68" y2="10" stroke={cLine} strokeWidth="4" strokeLinecap="round" />
            <line x1="0" y1="30" x2="68" y2="30" stroke={cLine} strokeWidth="4" strokeLinecap="round"/>
            <line x1="0" y1="50" x2="68" y2="50" stroke={cLine} strokeWidth="4" strokeLinecap="round"/>

            <line x1="28" y1="10" x2="56" y2="10" stroke={cDark} strokeWidth="5" />
            <circle cx="28" cy="10" r="5" fill={cLight} />
            <circle cx="56" cy="10" r="5" fill={cDark} />

            <line x1="16" y1="30" x2="40" y2="30" stroke={cDark} strokeWidth="5" />
            <circle cx="16" cy="30" r="5" fill={cLight} />
            <circle cx="40" cy="30" r="5" fill={cDark} />

            <line x1="24" y1="50" x2="50" y2="50" stroke={cDark} strokeWidth="5" />
            <circle cx="24" cy="50" r="5" fill={cLight} />
            <circle cx="50" cy="50" r="5" fill={cDark} />
          </g>
        );
      case "d3-arrow-plot":
        return (
          <g transform="translate(16, 20)">
            <line x1="0" y1="10" x2="68" y2="10" stroke={cLine} strokeWidth="4" strokeLinecap="round" />
            <line x1="0" y1="30" x2="68" y2="30" stroke={cLine} strokeWidth="4" strokeLinecap="round" />
            <line x1="0" y1="50" x2="68" y2="50" stroke={cLine} strokeWidth="4" strokeLinecap="round" />

            <path d="M18 10 L50 10" stroke={cDark} strokeWidth="5" />
            <path d="M42 3 L52 10 L42 17" stroke={cDark} strokeWidth="5" fill="none" strokeLinecap="square" />

            <path d="M52 30 L22 30" stroke={cLight} strokeWidth="5" />
            <path d="M30 23 L20 30 L30 37" stroke={cLight} strokeWidth="5" fill="none" strokeLinecap="square" />

            <path d="M12 50 L64 50" stroke={cDark} strokeWidth="5" />
            <path d="M56 43 L66 50 L56 57" stroke={cDark} strokeWidth="5" fill="none" strokeLinecap="square" />
          </g>
        );
      case "election-donut-chart":
        return (
          <g transform="translate(50, 72)">
            <path d="M -30 0 A 30 30 0 0 1 -4 -29.7" stroke={cLight} strokeWidth="16" fill="none" strokeLinecap="butt" />
            <path d="M 0 -30 A 30 30 0 0 1 21 -21.4" stroke={cDark} strokeWidth="16" fill="none" strokeLinecap="butt" />
            <path d="M 23.5 -18 A 30 30 0 0 1 30 -2" stroke={cDark} strokeWidth="16" fill="none" opacity="0.4" strokeLinecap="butt" />
          </g>
        );
      case "d3-pies":
        return (
          <g transform="translate(50, 50)">
            <path d="M 0 0 L 0 -34 A 34 34 0 1 0 34 0 Z" fill={cDark} />
            <path d="M 0 0 L 34 0 A 34 34 0 0 0 0 -34 Z" fill={cLight} />
          </g>
        );
      case "d3-multiple-pies":
        return (
          <g transform="translate(50, 50)">
            <g transform="translate(-18, -18)">
              <circle cx="0" cy="0" r="14" fill={cDark} />
              <path d="M 0 0 L 0 -14 A 14 14 0 0 1 14 0 Z" fill={cLight} />
            </g>
            <g transform="translate(18, -18)">
              <circle cx="0" cy="0" r="14" fill={cLight} />
              <path d="M 0 0 L 0 -14 A 14 14 0 0 1 14 0 A 14 14 0 0 1 0 14 Z" fill={cDark} />
            </g>
            <g transform="translate(-18, 18)">
              <circle cx="0" cy="0" r="14" fill={cLight} />
              <path d="M 0 0 L 0 -14 A 14 14 0 1 0 14 0 Z" fill={cDark} />
            </g>
            <g transform="translate(18, 18)">
              <circle cx="0" cy="0" r="14" fill={cDark} />
              <path d="M 0 0 L 0 -14 A 14 14 0 0 1 10 -10 Z" fill={cLight} />
            </g>
          </g>
        );
      case "d3-donuts":
        return (
          <g transform="translate(50, 50)">
            <path d="M 0 -28 A 28 28 0 1 0 28 0" fill="none" stroke={cDark} strokeWidth="12" />
            <path d="M 28 0 A 28 28 0 0 0 0 -28" fill="none" stroke={cLight} strokeWidth="12" />
          </g>
        );
      case "d3-multiple-donuts":
        return (
          <g transform="translate(50, 50)">
            <g transform="translate(-18, -18)">
              <path d="M 0 -11 A 11 11 0 1 0 11 0" fill="none" stroke={cDark} strokeWidth="6" />
              <path d="M 11 0 A 11 11 0 0 0 0 -11" fill="none" stroke={cLight} strokeWidth="6" />
            </g>
            <g transform="translate(18, -18)">
              <path d="M -11 0 A 11 11 0 0 1 11 0 A 11 11 0 0 1 0 11" fill="none" stroke={cDark} strokeWidth="6" />
              <path d="M 0 11 A 11 11 0 0 1 -11 0" fill="none" stroke={cLight} strokeWidth="6" />
            </g>
            <g transform="translate(-18, 18)">
              <path d="M 0 -11 A 11 11 0 1 1 -11 0" fill="none" stroke={cDark} strokeWidth="6" />
              <path d="M -11 0 A 11 11 0 0 1 0 -11" fill="none" stroke={cLight} strokeWidth="6" />
            </g>
            <g transform="translate(18, 18)">
              <path d="M 0 -11 A 11 11 0 1 0 8 -8" fill="none" stroke={cDark} strokeWidth="6" />
              <path d="M 8 -8 A 11 11 0 0 0 0 -11" fill="none" stroke={cLight} strokeWidth="6" />
            </g>
          </g>
        );
      case "tables":
        return (
          <g transform="translate(20, 20)">
            <rect x="0" y="0" width="60" height="15" fill={cLight} opacity="0.8"/>
            <rect x="0" y="0" width="60" height="60" fill="none" stroke={cDark} strokeWidth="4" rx="2" />
            <line x1="0" y1="15" x2="60" y2="15" stroke={cDark} strokeWidth="4" />
            <line x1="0" y1="30" x2="60" y2="30" stroke={cDark} strokeWidth="4" opacity="0.5" />
            <line x1="0" y1="45" x2="60" y2="45" stroke={cDark} strokeWidth="4" opacity="0.5" />
            <line x1="30" y1="0" x2="30" y2="60" stroke={cDark} strokeWidth="4" />
            <line x1="5" y1="8" x2="16" y2="8" stroke={cDark} strokeWidth="3" strokeLinecap="round" />
            <line x1="35" y1="8" x2="52" y2="8" stroke={cDark} strokeWidth="3" strokeLinecap="round" />
            <line x1="5" y1="23" x2="22" y2="23" stroke={cDark} strokeWidth="3" strokeLinecap="round" />
            <line x1="35" y1="23" x2="48" y2="23" stroke={cDark} strokeWidth="3" strokeLinecap="round" />
            <line x1="5" y1="38" x2="20" y2="38" stroke={cDark} strokeWidth="3" strokeLinecap="round" />
            <line x1="35" y1="38" x2="55" y2="38" stroke={cDark} strokeWidth="3" strokeLinecap="round" />
            <line x1="5" y1="53" x2="25" y2="53" stroke={cDark} strokeWidth="3" strokeLinecap="round" />
            <line x1="35" y1="53" x2="42" y2="53" stroke={cDark} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case "d3-maps-choropleth":
        return (
          <g transform="translate(18, 22)">
            <path d="M 20 0 L 46 8 L 64 36 L 46 56 L 0 46 L 20 0 Z" fill={cLight} stroke={cDark} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 20 0 L 32 30" stroke={cDark} strokeWidth="4" />
            <path d="M 32 30 L 46 8" stroke={cDark} strokeWidth="4" />
            <path d="M 32 30 L 46 56" stroke={cDark} strokeWidth="4" />
            <path d="M 32 30 L 0 46" stroke={cDark} strokeWidth="4" />
          </g>
        );
      case "d3-maps-symbols":
        return (
          <g transform="translate(18, 22)">
            <path d="M 20 0 L 46 8 L 64 36 L 46 56 L 0 46 L 20 0 Z" fill="none" stroke={cDark} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="28" cy="24" r="8" fill={cLight} />
            <circle cx="48" cy="18" r="5" fill={cDark} />
            <circle cx="36" cy="40" r="10" fill={cDark} />
            <circle cx="12" cy="35" r="4" fill={cDark} />
          </g>
        );
      case "locator-map":
        return (
          <g transform="translate(30, 20)">
            <path d="M 20 0 C 8.954 0 0 8.954 0 20 C 0 33.33 20 53.33 20 53.33 C 20 53.33 40 33.33 40 20 C 40 8.954 31.046 0 20 0 Z" fill={cLight} opacity="0.8" stroke={cDark} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="6" fill={cDark} />
          </g>
        );
      default:
        return (
          <rect x="25" y="25" width="50" height="50" fill={cLine} rx="4" />
        );
    }
  };

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {renderIcon()}
    </svg>
  );
};
