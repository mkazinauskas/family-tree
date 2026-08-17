import { Person, Marriage, FamilyTreeData, TreeSection } from '../types/familyTree';
import { getPersonTheme } from './themePresets';
import { computeCardTextLayout } from './cardTextLayout';

export interface ComputedMarriageLine {
  marriageId: string;
  // Horizontal line connecting spouses
  hasSpouseLine: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dotX: number;
  dotY: number;
  // Drop line to children bus
  hasChildren: boolean;
  hasDropLine: boolean;
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
  const processedChildIds = new Set<string>();

  tree.marriages.forEach(m => {
    const husband = m.husbandId ? personMap.get(m.husbandId) : undefined;
    const wife = m.wifeId ? personMap.get(m.wifeId) : undefined;

    if (!husband && !wife) return;

    let hasSpouseLine = false;
    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;
    let connY = 0;
    let dotX = 0;
    let dotY = 0;
    let color = m.color || '#245C8C';

    if (husband && wife) {
      hasSpouseLine = true;
      const hX = husband.x ?? 0;
      const hY = husband.y ?? 0;
      const hW = husband.width ?? 140;

      const wX = wife.x ?? 0;
      const wY = wife.y ?? 0;
      const wW = wife.width ?? 140;

      // Determine left and right person
      const isHusbandLeft = hX <= wX;
      const leftPerson = isHusbandLeft ? husband : wife;
      const rightPerson = isHusbandLeft ? wife : husband;

      const leftRightEdge = (leftPerson.x ?? 0) + (leftPerson.width ?? 140);
      const rightLeftEdge = rightPerson.x ?? 0;

      connY = Math.min(hY, wY) + 30;

      if (rightLeftEdge >= leftRightEdge) {
        x1 = leftRightEdge;
        x2 = rightLeftEdge;
      } else {
        // Overlapping or vertically stacked
        x1 = (leftPerson.x ?? 0) + (leftPerson.width ?? 140) / 2;
        x2 = (rightPerson.x ?? 0) + (rightPerson.width ?? 140) / 2;
      }

      y1 = connY;
      y2 = connY;
      dotX = (x1 + x2) / 2;
      dotY = connY;

      if (!m.color) {
        color = husband.themePreset ? getPersonTheme(husband.themePreset).stroke : '#245C8C';
      }
    } else {
      // Single parent marriage
      const parent = (husband || wife)!;
      const pX = parent.x ?? 0;
      const pY = parent.y ?? 0;
      const pW = parent.width ?? 140;
      const pH = parent.height ?? 80;

      dotX = pX + pW / 2;
      dotY = pY + pH;
      x1 = dotX;
      y1 = dotY;
      x2 = dotX;
      y2 = dotY;
      connY = dotY;
      hasSpouseLine = false;

      if (!m.color) {
        color = parent.themePreset ? getPersonTheme(parent.themePreset).stroke : '#245C8C';
      }
    }

    const children = (m.childrenIds || [])
      .map(cid => {
        processedChildIds.add(cid);
        return personMap.get(cid);
      })
      .filter((p): p is Person => Boolean(p));

    const hasChildren = children.length > 0;
    const hasDropLine = hasChildren && m.noDropLine !== true;

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

      if (hasDropLine) {
        // Bus bar MUST span to dotX so the vertical drop line always connects seamlessly
        busX1 = Math.min(minChildCenterX, dotX);
        busX2 = Math.max(maxChildCenterX, dotX);

        // Badge placement on the drop line
        badgeX = dotX;
        badgeY = m.badgeY ?? (dotY + (busY - dotY) * 0.7);
      } else {
        // Bus bar connects only sibling children
        busX1 = minChildCenterX;
        busX2 = maxChildCenterX;
      }

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
      hasSpouseLine,
      x1,
      y1,
      x2,
      y2,
      color,
      dotX,
      dotY,
      hasChildren,
      hasDropLine,
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

  // Handle any people with parentId who were not included in any marriage's childrenIds
  const unlinkedParentChildren = new Map<string, Person[]>();
  tree.people.forEach(p => {
    if (p.parentId && !processedChildIds.has(p.id)) {
      const list = unlinkedParentChildren.get(p.parentId) || [];
      list.push(p);
      unlinkedParentChildren.set(p.parentId, list);
    }
  });

  unlinkedParentChildren.forEach((children, parentId) => {
    const parent = personMap.get(parentId);
    if (!parent || children.length === 0) return;

    const pX = parent.x ?? 0;
    const pY = parent.y ?? 0;
    const pW = parent.width ?? 140;
    const pH = parent.height ?? 80;

    const dotX = pX + pW / 2;
    const dotY = pY + pH;
    const color = parent.themePreset ? getPersonTheme(parent.themePreset).stroke : '#245C8C';

    const childCenters = children.map(c => (c.x ?? 0) + (c.width ?? 140) / 2);
    const minChildCenterX = Math.min(...childCenters);
    const maxChildCenterX = Math.max(...childCenters);
    const minChildY = Math.min(...children.map(c => c.y ?? 0));
    const busY = minChildY - 30;

    const busX1 = Math.min(minChildCenterX, dotX);
    const busX2 = Math.max(maxChildCenterX, dotX);

    const childDrops = children.map(c => ({
      x: (c.x ?? 0) + (c.width ?? 140) / 2,
      y1: busY,
      y2: c.y ?? 0,
    }));

    marriageLines.push({
      marriageId: `lineage-${parentId}`,
      hasSpouseLine: false,
      x1: dotX,
      y1: dotY,
      x2: dotX,
      y2: dotY,
      color,
      dotX,
      dotY,
      hasChildren: true,
      hasDropLine: true,
      dropEndY: busY,
      busX1,
      busX2,
      busY,
      childDrops,
    });
  });

  return { marriageLines, personMap };
}

// Auto-calculate height of a person card based on content
export function calculateCardHeight(person: Person): number {
  const layout = computeCardTextLayout(person);
  return layout.ph;
}
