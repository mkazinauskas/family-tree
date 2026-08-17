import React from 'react';
import { Person } from '../types/familyTree';
import { computeCardTextLayout } from '../engine/cardTextLayout';

interface PersonCardProps {
  person: Person;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (person: Person, e: React.MouseEvent) => void;
  onDoubleClick: (person: Person, e: React.MouseEvent) => void;
  onAddChild?: (person: Person, e: React.MouseEvent) => void;
  onAddSpouse?: (person: Person, e: React.MouseEvent) => void;
  onDelete?: (person: Person, e: React.MouseEvent) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  isSelected,
  isHovered,
  onSelect,
  onDoubleClick,
  onAddChild,
  onAddSpouse,
  onDelete,
}) => {
  const layout = computeCardTextLayout(person);
  const { px, py, pw, ph, banner, lines, theme } = layout;

  return (
    <g
      className={`svg-person-card ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(person, e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(person, e);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Selection Glow */}
      {isSelected && (
        <rect
          x={px - 3}
          y={py - 3}
          width={pw + 6}
          height={ph + 6}
          rx={9}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2.5}
          strokeDasharray="4 2"
        />
      )}

      {/* Card Background */}
      <rect
        x={px}
        y={py}
        width={pw}
        height={ph}
        rx={6}
        fill={theme.fill}
        stroke={isSelected ? '#0284c7' : theme.stroke}
        strokeWidth={isSelected ? 2 : 1.3}
      />

      {/* Spouse Banner if any */}
      {banner && (
        <g>
          <path d={banner.pathD} fill={banner.bg} />
          <text
            x={banner.textX}
            y={banner.textY}
            textAnchor="middle"
            fontSize="8.6"
            fontWeight="bold"
            fill={banner.textColor}
            letterSpacing="0.5"
            style={{ pointerEvents: 'none' }}
          >
            {banner.text}
          </text>
        </g>
      )}

      {/* Rendered Text Lines (Dynamically Stacked & Fitted) */}
      <g style={{ pointerEvents: 'none' }}>
        {lines.map((line) => (
          <text
            key={line.id}
            x={line.x}
            y={line.y}
            textAnchor={line.textAnchor}
            fontSize={line.fontSize}
            fontWeight={line.fontWeight}
            fontStyle={line.fontStyle}
            fill={line.fill}
            textLength={line.textLength}
            lengthAdjust={line.lengthAdjust}
          >
            {line.text}
          </text>
        ))}
      </g>

      {/* Hover Action Triggers */}
      {isHovered && (
        <g className="card-hover-actions">
          {/* Add Child button pill at bottom */}
          <g
            onClick={(e) => {
              e.stopPropagation();
              onAddChild?.(person, e);
            }}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={px + pw / 2 - 12}
              y={py + ph - 8}
              width={24}
              height={16}
              rx={8}
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth={1}
            />
            <text
              x={px + pw / 2}
              y={py + ph + 4}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#ffffff"
            >
              +
            </text>
          </g>

          {/* Add Spouse button pill at right */}
          <g
            onClick={(e) => {
              e.stopPropagation();
              onAddSpouse?.(person, e);
            }}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={px + pw - 6}
              y={py + 20}
              width={18}
              height={18}
              rx={9}
              fill="#0d9488"
              stroke="#ffffff"
              strokeWidth={1}
            />
            <text
              x={px + pw + 3}
              y={py + 33}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#ffffff"
            >
              💍
            </text>
          </g>
        </g>
      )}
    </g>
  );
};

