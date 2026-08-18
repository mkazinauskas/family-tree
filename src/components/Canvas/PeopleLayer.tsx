import React from 'react';
import { Person } from '../../types/familyTree';
import { PersonCard } from '../PersonCard';

interface PeopleLayerProps {
  people: Person[];
  selectedPersonId: string | null;
  hoveredPersonId: string | null;
  onHoverPerson: (personId: string | null) => void;
  isPersonMatched: (person: Person) => boolean;
  onSelectPerson: (person: Person | null) => void;
  onEditPerson: (person: Person) => void;
  onAddChild: (person: Person) => void;
  onAddSpouse: (person: Person) => void;
}

export const PeopleLayer: React.FC<PeopleLayerProps> = ({
  people,
  selectedPersonId,
  hoveredPersonId,
  onHoverPerson,
  isPersonMatched,
  onSelectPerson,
  onEditPerson,
  onAddChild,
  onAddSpouse,
}) => (
  <g className="people-cards-layer">
    {people.map((person) => {
      const isMatched = isPersonMatched(person);
      const isSelected = selectedPersonId === person.id;
      const isHovered = hoveredPersonId === person.id;

      return (
        <g
          key={person.id}
          onMouseEnter={() => onHoverPerson(person.id)}
          onMouseLeave={() => onHoverPerson(null)}
        >
          {/* Search Highlight Halo */}
          {isMatched && (
            <rect
              x={(person.x ?? 0) - 6}
              y={(person.y ?? 0) - 6}
              width={(person.width ?? 140) + 12}
              height={(person.height ?? 80) + 12}
              rx={12}
              fill="rgba(245, 158, 11, 0.25)"
              stroke="#f59e0b"
              strokeWidth={2}
            />
          )}
          <PersonCard
            person={person}
            isSelected={isSelected}
            isHovered={isHovered}
            onSelect={(p) => onSelectPerson(p)}
            onDoubleClick={(p) => onEditPerson(p)}
            onAddChild={(p) => onAddChild(p)}
            onAddSpouse={(p) => onAddSpouse(p)}
          />
        </g>
      );
    })}
  </g>
);
