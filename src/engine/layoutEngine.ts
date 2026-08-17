import { Person, Marriage, FamilyTreeData, TreeSection } from '../types/familyTree';
import { getPersonTheme } from './themePresets';

export interface ComputedMarriageLine {
  marriageId: string;
  // Horizontal line connecting spouses
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dotX: number;
  dotY: number;
  // Drop line to children bus
  hasChildren: boolean;
  dropEndY?: number;
  busX1?: number;
  busX2?: number;
  busY?: number;
  // Badge
  badgeText?: string;
  badgeX?: number;
  badgeY?: number;
  // Child drop lines
  childDrops: { x: number; y1: number; y2: number }[];
}

export function computeTreeLayout(tree: FamilyTreeData): {
  marriageLines: ComputedMarriageLine[];
  personMap: Map<string, Person>;
} {
  const personMap = new Map<string, Person>();
  tree.people.forEach(p => personMap.set(p.id, p));

  const marriageLines: ComputedMarriageLine[] = [];

  tree.marriages.forEach(m => {
    const husband = personMap.get(m.husbandId);
    const wife = personMap.get(m.wifeId);

    if (!husband || !wife) return;

    // Get positions
    const hX = husband.x ?? 0;
    const hY = husband.y ?? 0;
    const hW = husband.width ?? 140;
    const hH = husband.height ?? 80;

    const wX = wife.x ?? 0;
    const wY = wife.y ?? 0;
    const wW = wife.width ?? 140;
    const wH = wife.height ?? 80;

    // Determine left and right person
    let leftPerson = hX <= wX ? husband : wife;
    let rightPerson = hX <= wX ? wife : husband;

    const leftX = (leftPerson.x ?? 0) + (leftPerson.width ?? 140);
    const rightX = rightPerson.x ?? 0;

    // Center Y of connection (usually ~30px from top of spouse cards, or vertical middle)
    const connY = Math.min((husband.y ?? 0), (wife.y ?? 0)) + 30;

    // Midpoint between them
    const midX = (leftX + rightX) / 2;
    const midY = connY;

    const color = m.color || (husband.themePreset ? getPersonTheme(husband.themePreset).stroke : '#245C8C');

    const children = m.childrenIds.map(cid => personMap.get(cid)).filter((p): p is Person => Boolean(p));
    const hasChildren = children.length > 0;

    const childDrops: { x: number; y1: number; y2: number }[] = [];
    let busX1: number | undefined;
    let busX2: number | undefined;
    let busY: number | undefined;
    let badgeX: number | undefined;
    let badgeY: number | undefined;
    let dropEndY: number | undefined;

    if (hasChildren) {
      // Find min & max X among children centers
      const childCenters = children.map(c => (c.x ?? 0) + (c.width ?? 140) / 2);
      const minChildCenterX = Math.min(...childCenters);
      const maxChildCenterX = Math.max(...childCenters);

      // Child target Y
      const minChildY = Math.min(...children.map(c => c.y ?? 0));
      busY = m.busY ?? (minChildY - 30);
      dropEndY = busY;

      busX1 = minChildCenterX;
      busX2 = maxChildCenterX;

      // Badge placement on the drop line
      badgeX = midX;
      badgeY = m.badgeY ?? (midY + (busY - midY) * 0.7);

      // Compute drop lines to each child
      children.forEach(c => {
        const cCenterX = (c.x ?? 0) + (c.width ?? 140) / 2;
        const cTopY = c.y ?? 0;
        childDrops.push({
          x: cCenterX,
          y1: busY!,
          y2: cTopY,
        });
      });
    }

    marriageLines.push({
      marriageId: m.id,
      x1: leftX,
      y1: connY,
      x2: rightX,
      y2: connY,
      color,
      dotX: midX,
      dotY: midY,
      hasChildren,
      dropEndY,
      busX1,
      busX2,
      busY,
      badgeText: m.marriageBadgeText || m.marriageNumber,
      badgeX,
      badgeY,
      childDrops,
    });
  });

  return { marriageLines, personMap };
}

// Auto-calculate height of a person card based on content
export function calculateCardHeight(person: Person): number {
  if (person.customTheme?.fill && person.height) {
    // If explicitly set
    return person.height;
  }
  let baseHeight = 28; // Name height
  if (person.spouseBanner) baseHeight += 22;
  if (person.maidenName) baseHeight += 14;
  if (person.birthDate || person.deathDate) baseHeight += 16;
  if (person.location) baseHeight += 15;
  if (person.notes && person.notes.length > 0) {
    baseHeight += person.notes.length * 13 + 6;
  }
  return Math.max(48, Math.round(baseHeight));
}
