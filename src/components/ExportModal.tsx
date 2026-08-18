import React, { useState } from 'react';
import { FamilyTreeData } from '../types/familyTree';
import { generateStandaloneHtml, generateTreeSvgString } from '../engine/svgExporter';
import confetti from 'canvas-confetti';
import { 
  X, 
  Download, 
  Copy, 
  Check,
  FileCode,
  FileJson,
  Printer
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface ExportModalProps {
  tree: FamilyTreeData;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ tree, onClose }) => {
  const { t } = useTranslation();
  const [exportType, setExportType] = useState<'html' | 'svg' | 'json'>('html');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const treeNameSanitized = (tree.name || 'family-tree')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      if (exportType === 'html') {
        const htmlContent = generateStandaloneHtml(tree);
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${treeNameSanitized}.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportType === 'svg') {
        const svgContent = generateTreeSvgString(tree);
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${treeNameSanitized}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportType === 'json') {
        const jsonContent = JSON.stringify(tree, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${treeNameSanitized}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = () => {
    let content = '';
    if (exportType === 'html') {
      content = generateStandaloneHtml(tree);
    } else if (exportType === 'svg') {
      content = generateTreeSvgString(tree);
    } else if (exportType === 'json') {
      content = JSON.stringify(tree, null, 2);
    }
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Download size={20} className="text-sky-400" />
            <span>{t('exportModal.title')}</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {t('exportModal.description')}
          </div>

          {/* Export format choices */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div
              onClick={() => setExportType('html')}
              style={{
                background: exportType === 'html' ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-surface)',
                borderColor: exportType === 'html' ? '#38bdf8' : 'var(--border-subtle)',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                <Printer size={16} className="text-sky-400" />
                <span>{t('exportModal.htmlTitle')}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('exportModal.htmlDesc')}
              </div>
            </div>

            <div
              onClick={() => setExportType('svg')}
              style={{
                background: exportType === 'svg' ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-surface)',
                borderColor: exportType === 'svg' ? '#38bdf8' : 'var(--border-subtle)',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                <FileCode size={16} className="text-teal-400" />
                <span>{t('exportModal.svgTitle')}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('exportModal.svgDesc')}
              </div>
            </div>

            <div
              onClick={() => setExportType('json')}
              style={{
                background: exportType === 'json' ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-surface)',
                borderColor: exportType === 'json' ? '#38bdf8' : 'var(--border-subtle)',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                <FileJson size={16} className="text-purple-400" />
                <span>{t('exportModal.jsonTitle')}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {t('exportModal.jsonDesc')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCopyCode}>
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            <span>{copied ? t('exportModal.copied') : t('exportModal.copyCode')}</span>
          </button>

          <button className="btn btn-primary" onClick={handleDownload} disabled={isExporting}>
            <Download size={16} />
            <span>{t('exportModal.download', { type: exportType.toUpperCase() })}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
