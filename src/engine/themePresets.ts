import { PersonTheme, ThemePreset } from '../types/familyTree';

export const THEME_PRESETS: Record<ThemePreset, PersonTheme> = {
  'ancestor-blue': {
    fill: '#D9E7F5',
    stroke: '#245C8C',
    textColor: '#243B4A',
    nameColor: '#12405F',
    bannerBg: '#5B8CB5',
    bannerText: '#ffffff',
  },
  'branch1-primary': {
    fill: '#DDEDE7',
    stroke: '#2E6B5E',
    textColor: '#2C4139',
    nameColor: '#1E4C42',
    bannerBg: '#2E6B5E',
    bannerText: '#ffffff',
  },
  'branch1-descendant': {
    fill: '#EFF7F4',
    stroke: '#7FB3A5',
    textColor: '#3B514A',
    nameColor: '#1E4C42',
    bannerBg: '#2E6B5E',
    bannerText: '#ffffff',
  },
  'branch2-primary': {
    fill: '#FBEEDA',
    stroke: '#B5761F',
    textColor: '#4C3E28',
    nameColor: '#8A5711',
    bannerBg: '#B5761F',
    bannerText: '#ffffff',
  },
  'branch2-descendant': {
    fill: '#FDF7EC',
    stroke: '#D8B378',
    textColor: '#544633',
    nameColor: '#8A5711',
    bannerBg: '#B5761F',
    bannerText: '#ffffff',
  },
  'other-slate': {
    fill: '#F4F5F7',
    stroke: '#A9B0BA',
    textColor: '#4B5563',
    nameColor: '#1F2937',
    bannerBg: '#9CA3AF',
    bannerText: '#ffffff',
  },
  'emerald': {
    fill: '#DCFCE7',
    stroke: '#16A34A',
    textColor: '#14532D',
    nameColor: '#15803D',
    bannerBg: '#16A34A',
    bannerText: '#ffffff',
  },
  'purple': {
    fill: '#F3E8FF',
    stroke: '#9333EA',
    textColor: '#581C87',
    nameColor: '#7E22CE',
    bannerBg: '#9333EA',
    bannerText: '#ffffff',
  },
  'rose': {
    fill: '#FFE4E6',
    stroke: '#E11D48',
    textColor: '#881337',
    nameColor: '#BE123C',
    bannerBg: '#E11D48',
    bannerText: '#ffffff',
  },
  'custom': {
    fill: '#F4F5F7',
    stroke: '#64748B',
    textColor: '#334155',
    nameColor: '#0F172A',
    bannerBg: '#64748B',
    bannerText: '#ffffff',
  },
};

export function getPersonTheme(preset?: ThemePreset, custom?: PersonTheme): PersonTheme {
  if (preset && preset !== 'custom' && THEME_PRESETS[preset]) {
    return THEME_PRESETS[preset];
  }
  if (custom) {
    return custom;
  }
  return THEME_PRESETS['other-slate'];
}
