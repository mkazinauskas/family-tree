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
  Image, 
  FileJson, 
  Printer,
  Sparkles
} from 'lucide-react';

interface ExportModalProps {
  tree: FamilyTreeData;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ tree, onClose }) => {
  const [exportType, setExportType] = useState<'html' | 'svg' | 'json' | 'png'>('html');
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
      } else if (exportType === 'png') {
        // Render SVG to Canvas then export PNG
        const svgString = generateTreeSvgString(tree);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URLObj = window.URL || window.webkitURL || window;
        const blobURL = URLObj.createObjectURL(svgBlob);
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2; // 2x high resolution
          canvas.width = (tree.metadata.canvasWidth || 1942) * scale;
          canvas.height = (tree.metadata.canvasHeight || 1383) * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const pngUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `${treeNameSanitized}-2x.png`;
                a.click();
                URL.revokeObjectURL(pngUrl);
              }
            }, 'image/png');
          }
          URLObj.revokeObjectURL(blobURL);
        };
        img.src = blobURL;
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Download size={20} className="text-sky-400" />
            <span>Eksportuoti Giminės Medį</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Pasirinkite norimą failo formatą. Visi formatai išlaiko aukštos kokybės A3 spaudos proporcijas ir originalų dizainą.
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
                <span>HTML (Kaip pavyzdys)</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Savarankiškas .html failas su A3 spaudos nustatymais (kaip 3-Tamosius.html).
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
                <span>Vektorinis SVG</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Vektorinis failas, tinkamas spaudai, iliustracijoms ir leidybai.
              </div>
            </div>

            <div
              onClick={() => setExportType('png')}
              style={{
                background: exportType === 'png' ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-surface)',
                borderColor: exportType === 'png' ? '#38bdf8' : 'var(--border-subtle)',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                <Image size={16} className="text-amber-400" />
                <span>Ultra HD PNG (2x)</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Didelės raiškos paveikslėlis peržiūrai ir dalinimuisi.
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
                <span>Projekto JSON</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Pilna projekto atsarginė kopija vėlesniam redagavimui.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {exportType !== 'png' && (
            <button className="btn btn-secondary" onClick={handleCopyCode}>
              {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              <span>{copied ? 'Nukopijuota!' : 'Kopijuoti kodą'}</span>
            </button>
          )}

          <button className="btn btn-primary" onClick={handleDownload} disabled={isExporting}>
            <Download size={16} />
            <span>Atsisiųsti {exportType.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
