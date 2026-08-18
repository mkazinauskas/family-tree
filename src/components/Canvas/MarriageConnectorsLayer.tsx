import React from 'react';
import { ComputedMarriageLine } from '../../engine/layoutEngine';

interface MarriageConnectorsLayerProps {
  marriageLines: ComputedMarriageLine[];
}

export const MarriageConnectorsLayer: React.FC<MarriageConnectorsLayerProps> = ({ marriageLines }) => (
  <g className="marriage-connectors-layer">
    {marriageLines.map((ml) => (
      <g key={ml.marriageId}>
        {/* Horizontal Spouse Line & Marriage Dot */}
        {ml.hasSpouseLine && (
          <>
            <line
              x1={ml.x1}
              y1={ml.y1}
              x2={ml.x2}
              y2={ml.y2}
              stroke={ml.color}
              strokeWidth={2}
            />
            <circle cx={ml.dotX} cy={ml.dotY} r={3.2} fill={ml.color} />
          </>
        )}

        {/* Children Bus & Drops */}
        {ml.hasChildren && ml.busY !== undefined && ml.busX1 !== undefined && ml.busX2 !== undefined && (
          <g>
            {/* Vertical Drop Line from Marriage Dot */}
            {ml.hasDropLine && ml.dropEndY !== undefined && (
              <path
                d={`M${ml.dotX} ${ml.dotY} L${ml.dotX} ${ml.dropEndY}`}
                stroke={ml.color}
                strokeWidth={2}
                fill="none"
              />
            )}

            {/* Sibling bus bar */}
            <line
              x1={ml.busX1}
              y1={ml.busY}
              x2={ml.busX2}
              y2={ml.busY}
              stroke={ml.color}
              strokeWidth={2}
            />

            {/* Roman Numeral Badge */}
            {ml.hasDropLine && ml.badgeText && ml.badgeX !== undefined && ml.badgeY !== undefined && (
              <g>
                <rect
                  x={ml.badgeX - 7.5}
                  y={ml.badgeY - 6.5}
                  width={15}
                  height={13}
                  rx={6.5}
                  fill={ml.color}
                />
                <text
                  x={ml.badgeX}
                  y={ml.badgeY + 3.8}
                  textAnchor="middle"
                  fontSize={8.6}
                  fontWeight="bold"
                  fill="#ffffff"
                  letterSpacing={0.4}
                >
                  {ml.badgeText}
                </text>
              </g>
            )}

            {/* Child Drop Lines */}
            {ml.childDrops.map((cd, cdIdx) => (
              <line
                key={cdIdx}
                x1={cd.x}
                y1={cd.y1}
                x2={cd.x}
                y2={cd.y2}
                stroke={ml.color}
                strokeWidth={2}
              />
            ))}
          </g>
        )}
      </g>
    ))}
  </g>
);
