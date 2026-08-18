import React from 'react';
import { FamilyTreeData } from '../types/familyTree';
import { X, BarChart3, Users, Heart, Calendar, MapPin, Award } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface AnalyticsModalProps {
  tree: FamilyTreeData;
  onClose: () => void;
}

export function computeTreeStats(tree: FamilyTreeData) {
  const { people, marriages } = tree;
  const totalPeople = people.length;
  const males = people.filter((p) => p.gender === 'male').length;
  const females = people.filter((p) => p.gender === 'female').length;
  const others = totalPeople - males - females;

  // Generations
  const generations = people.map((p) => p.generation || 1);
  const maxGen = generations.length > 0 ? Math.max(...generations) : 1;

  // Years
  const birthYears: number[] = [];
  const deathYears: number[] = [];
  const lifespans: number[] = [];

  people.forEach((p) => {
    if (p.birthDate) {
      const match = /(\d{4})/.exec(p.birthDate);
      if (match) birthYears.push(parseInt(match[1]));
    }
    if (p.deathDate) {
      const match = /(\d{4})/.exec(p.deathDate);
      if (match) deathYears.push(parseInt(match[1]));
    }
    if (p.birthDate && p.deathDate) {
      const bMatch = /(\d{4})/.exec(p.birthDate);
      const dMatch = /(\d{4})/.exec(p.deathDate);
      if (bMatch && dMatch) {
        const diff = parseInt(dMatch[1]) - parseInt(bMatch[1]);
        if (diff >= 0 && diff <= 120) lifespans.push(diff);
      }
    }
  });

  const earliestYear = birthYears.length > 0 ? Math.min(...birthYears) : '—';
  const latestYear = birthYears.length > 0 ? Math.max(...birthYears) : '—';
  const avgLifespan =
    lifespans.length > 0
      ? Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length)
      : '—';

  // Surnames count
  const surnameCounts: Record<string, number> = {};
  people.forEach((p) => {
    const sn = (p.lastName || '').trim().toUpperCase();
    if (sn) {
      surnameCounts[sn] = (surnameCounts[sn] || 0) + 1;
    }
  });
  const sortedSurnames = Object.entries(surnameCounts).sort((a, b) => b[1] - a[1]);

  return {
    totalPeople,
    males,
    females,
    others,
    maxGen,
    totalMarriages: marriages.length,
    earliestYear,
    latestYear,
    avgLifespan,
    sortedSurnames,
  };
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ tree, onClose }) => {
  const { t } = useTranslation();
  const stats = computeTreeStats(tree);

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-lg">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <BarChart3 size={20} className="text-sky-400" />
            <span>{t('analyticsModal.title')}</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Users size={14} className="text-sky-400" />
                <span>{t('analyticsModal.totalPeople')}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {stats.totalPeople}
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Award size={14} className="text-amber-400" />
                <span>{t('analyticsModal.generationDepth')}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {t('analyticsModal.generationsSuffix', { count: stats.maxGen })}
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Heart size={14} className="text-rose-400" />
                <span>{t('analyticsModal.marriagesCount')}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {stats.totalMarriages}
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Calendar size={14} className="text-emerald-400" />
                <span>{t('analyticsModal.avgAge')}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {stats.avgLifespan} {stats.avgLifespan !== '—' ? t('analyticsModal.yearsAbbr') : ''}
              </div>
            </div>
          </div>

          {/* Gender Balance */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span>{t('analyticsModal.genderBalance')}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {t('analyticsModal.men')}: {stats.males} ({Math.round((stats.males / (stats.totalPeople || 1)) * 100)}%) · {t('analyticsModal.women')}: {stats.females} ({Math.round((stats.females / (stats.totalPeople || 1)) * 100)}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(stats.males / (stats.totalPeople || 1)) * 100}%`, background: '#38bdf8' }} title={t('analyticsModal.men')} />
              <div style={{ width: `${(stats.females / (stats.totalPeople || 1)) * 100}%`, background: '#f43f5e' }} title={t('analyticsModal.women')} />
            </div>
          </div>

          {/* Timeline Range */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('analyticsModal.oldestRecord')}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.earliestYear} {t('analyticsModal.yearSuffix')}</div>
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              {t('analyticsModal.chronologicalRange')}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('analyticsModal.newestRecord')}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.latestYear} {t('analyticsModal.yearSuffix')}</div>
            </div>
          </div>

          {/* Surnames Breakdown */}
          <div className="form-group">
            <label className="form-label">{t('analyticsModal.topSurnames')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {stats.sortedSurnames.slice(0, 15).map(([surname, count]) => (
                <div
                  key={surname}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{surname}</span>
                  <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            {t('analyticsModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
