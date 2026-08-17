import React from 'react';
import { Person } from '../types/familyTree';
import { getPersonTheme } from '../engine/themePresets';

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
  const theme = getPersonTheme(person.themePreset, person.customTheme);
  const px = person.x ?? 0;
  const py = person.y ?? 0;
  const pw = person.width ?? 140;
  const ph = person.height ?? 80;

  let currentY = py + 19;

  // Build dates string
  let dateStr = '';
  if (person.birthDate && person.deathDate) {
    dateStr = `${person.birthDate} – ${person.deathDate}`;
  } else if (person.birthDate) {
    dateStr = person.birthDate;
  } else if (person.deathDate) {
    dateStr = `m. ${person.deathDate}`;
  }
  if (person.ageAtDeath) {
    dateStr += ` (${person.ageAtDeath})`;
  }

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
      {person.spouseBanner && (
        <g>
          <path
            d={`M${px + 0.6} ${py + 19} L${px + 0.6} ${py + 6} A5.4 5.4 0 0 1 ${px + 6} ${py + 0.6} L${px + pw - 6} ${py + 0.6} A5.4 5.4 0 0 1 ${px + pw - 0.6} ${py + 6} L${px + pw - 0.6} ${py + 19} Z`}
            fill={person.spouseBannerBg || theme.bannerBg || theme.stroke}
          />
          <text
            x={px + pw / 2}
            y={py + 13.4}
            textAnchor="middle"
            fontSize="8.6"
            fontWeight="bold"
            fill={theme.bannerText || '#ffffff'}
            letterSpacing="0.5"
            style={{ pointerEvents: 'none' }}
          >
            {person.spouseBanner}
          </text>
        </g>
      )}

      {/* Name Line 1 (FirstName) */}
      <text
        x={px + pw / 2}
        y={person.spouseBanner ? py + 33 : py + 19}
        textAnchor="middle"
        fontSize="12.0"
        fontWeight="bold"
        fill={theme.nameColor}
        style={{ pointerEvents: 'none' }}
      >
        {person.firstName}
      </text>

      {/* Name Line 2 (LastName) */}
      {person.lastName && (
        <text
          x={px + pw / 2}
          y={person.spouseBanner ? py + 47 : py + 33}
          textAnchor="middle"
          fontSize="12.0"
          fontWeight="bold"
          fill={theme.nameColor}
          style={{ pointerEvents: 'none' }}
        >
          {person.lastName}
        </text>
      )}

      {/* Maiden Name / Alias */}
      {person.maidenName && (
        <text
          x={px + pw / 2}
          y={person.spouseBanner ? py + 61 : (person.lastName ? py + 47 : py + 33)}
          textAnchor="middle"
          fontSize="12.0"
          fontWeight="bold"
          fill={theme.nameColor}
          style={{ pointerEvents: 'none' }}
        >
          {person.maidenName}
        </text>
      )}

      {/* Dates */}
      {dateStr && (
        <text
          x={px + pw / 2}
          y={py + (person.spouseBanner ? (person.maidenName ? 75.6 : 61.3) : (person.maidenName ? 61.3 : 47.6))}
          textAnchor="middle"
          fontSize="11.0"
          fill={theme.textColor}
          style={{ pointerEvents: 'none' }}
        >
          {dateStr}
        </text>
      )}

      {/* Location */}
      {person.location && (
        <text
          x={px + pw / 2}
          y={py + (person.spouseBanner ? (person.maidenName ? 89 : 74) : (person.maidenName ? 74 : 61.3))}
          textAnchor="middle"
          fontSize="9.2"
          fontStyle="italic"
          fill={theme.textColor}
          style={{ pointerEvents: 'none' }}
        >
          {person.location}
        </text>
      )}

      {/* Notes lines */}
      {person.notes && person.notes.length > 0 && (
        <g style={{ pointerEvents: 'none' }}>
          {person.notes.map((note, idx) => {
            const startY = py + (person.spouseBanner ? (person.maidenName ? 101 : 86) : (person.maidenName ? 86 : 73));
            return (
              <text
                key={idx}
                x={px + 7}
                y={startY + idx * 11.6}
                fontSize="9.2"
                fill={theme.textColor}
              >
                {note}
              </text>
            );
          })}
        </g>
      )}

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
