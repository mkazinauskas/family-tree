export interface PersonTheme {
  fill: string;
  stroke: string;
  textColor: string;
  nameColor: string;
  bannerBg?: string;
  bannerText?: string;
}

export type ThemePreset = 
  | 'ancestor-blue'
  | 'branch1-primary'
  | 'branch1-descendant'
  | 'branch2-primary'
  | 'branch2-descendant'
  | 'other-slate'
  | 'emerald'
  | 'purple'
  | 'rose'
  | 'custom';

export interface Person {
  id: string;
  firstName: string;
  lastName?: string;
  nameLines?: string[]; // Optional explicit line-split for names
  maidenName?: string; // e.g. (VASILYTĖ)
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  isLiving?: boolean;
  ageAtDeath?: string;
  location?: string; // Village / Parish
  notes?: string[]; // Bio, godparents, cause of death, etc.
  themePreset?: ThemePreset;
  customTheme?: PersonTheme;
  generation?: number;
  sectionId?: string;
  spouseBanner?: string; // e.g. "I SANTUOKA", "II SANTUOKA", "SANTUOKA · 1916.02.29"
  spouseBannerBg?: string;
  
  // Explicit or computed coordinates
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  parentId?: string; // Biological parent lineage if simple
}

export interface Marriage {
  id: string;
  husbandId?: string;
  wifeId?: string;
  marriageNumber?: string; // "I", "II", "III" or full label
  marriageBadgeText?: string; // "I", "II" for circle badge on drop line
  marriageDate?: string;
  notes?: string;
  witnesses?: string;
  childrenIds: string[];
  color?: string; // Line & badge color
  sectionId?: string;
  badgeY?: number; // Custom Y position of drop badge
  busY?: number; // Custom horizontal bus bar Y position
  noDropLine?: boolean; // If true, omit vertical drop line from spouse dot (useful for cross-section child buses)
}

export interface ExtraLink {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: 'remarriage' | 'adoption' | 'kinship';
  label?: string;
  strokeDasharray?: string;
  color?: string;
}

export interface GenerationBand {
  generation: number;
  label: string; // "I karta", "II karta", etc.
  labelX?: number;
  labelY?: number;
  bgX?: number;
  bgY?: number;
  bgWidth?: number;
  bgHeight?: number;
  hasBgRect?: boolean;
}

export interface TreeSection {
  id: string;
  title: string;
  subhead?: string;
  y: number;
  height?: number;
  dividerX1?: number;
  dividerY?: number;
  dividerX2?: number;
  generationBands: GenerationBand[];
}

export interface LegendItem {
  id: string;
  label: string;
  fill: string;
  stroke: string;
  x?: number;
  y?: number;
}

export interface FootnoteItem {
  id: string;
  text: string;
  column: 1 | 2;
  order?: number;
}

export interface TreeMetadata {
  title: string;
  subtitle: string;
  sheetNumber: string;
  canvasWidth: number;
  canvasHeight: number;
  headerDividerY: number;
  footerY: number;
  fontFamily: string;
}

export interface FamilyTreeData {
  id: string;
  name: string;
  version: number;
  updatedAt: string;
  metadata: TreeMetadata;
  sections: TreeSection[];
  people: Person[];
  marriages: Marriage[];
  extraLinks?: ExtraLink[];
  legend: LegendItem[];
  footnotes: FootnoteItem[];
}
