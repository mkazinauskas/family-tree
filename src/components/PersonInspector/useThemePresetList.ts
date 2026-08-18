import { ThemePreset } from '../../types/familyTree';
import { useTranslation } from '../../i18n/LanguageContext';

export interface ThemePresetOption {
  key: ThemePreset;
  label: string;
  preview: string;
  border: string;
}

export function useThemePresetList(): ThemePresetOption[] {
  const { t } = useTranslation();

  return [
    { key: 'ancestor-blue', label: t('personInspector.themePresets.ancestor-blue'), preview: '#D9E7F5', border: '#245C8C' },
    { key: 'branch1-primary', label: t('personInspector.themePresets.branch1-primary'), preview: '#DDEDE7', border: '#2E6B5E' },
    { key: 'branch1-descendant', label: t('personInspector.themePresets.branch1-descendant'), preview: '#EFF7F4', border: '#7FB3A5' },
    { key: 'branch2-primary', label: t('personInspector.themePresets.branch2-primary'), preview: '#FBEEDA', border: '#B5761F' },
    { key: 'branch2-descendant', label: t('personInspector.themePresets.branch2-descendant'), preview: '#FDF7EC', border: '#D8B378' },
    { key: 'other-slate', label: t('personInspector.themePresets.other-slate'), preview: '#F4F5F7', border: '#A9B0BA' },
    { key: 'emerald', label: t('personInspector.themePresets.emerald'), preview: '#DCFCE7', border: '#16A34A' },
    { key: 'purple', label: t('personInspector.themePresets.purple'), preview: '#F3E8FF', border: '#9333EA' },
    { key: 'rose', label: t('personInspector.themePresets.rose'), preview: '#FFE4E6', border: '#E11D48' },
  ];
}
