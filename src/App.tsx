import React, { useEffect, useState } from 'react';
import { Person } from './types/familyTree';
import { TAMOSIUS_GAIDYS_DATA } from './data/tamosiusTreeData';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { PersonInspector } from './components/PersonInspector';
import { AddRelativeModal } from './components/AddRelativeModal';
import { TreeMetadataModal } from './components/TreeMetadataModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { ExportModal } from './components/ExportModal';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { OutlinerSidebar } from './components/OutlinerSidebar';
import { HistorySidebar } from './components/HistorySidebar';
import { useTranslation } from './i18n/LanguageContext';
import { useTreeHistory } from './hooks/useTreeHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTreeActions } from './hooks/useTreeActions';
import { FamilyTreeData } from './types/familyTree';

const LOCAL_STORAGE_KEY = 'family_tree_current_data_v1';

function loadInitialTree(): FamilyTreeData {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved tree', e);
  }
  return TAMOSIUS_GAIDYS_DATA;
}

export const App: React.FC = () => {
  const { t } = useTranslation();

  const {
    tree,
    historyEntries,
    historyIndex,
    updateTreeState,
    updateTreeSilent,
    handleUndo,
    handleRedo,
    handleJumpToHistory,
    canUndo,
    canRedo,
  } = useTreeHistory(t('history.actionInitial'), loadInitialTree);

  // Selected person
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [isOutlinerOpen, setIsOutlinerOpen] = useState(false);

  // Modals
  const [isAddRelativeOpen, setIsAddRelativeOpen] = useState(false);
  const [relativeTargetPerson, setRelativeTargetPerson] = useState<Person | null>(null);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tree));
    } catch (e) {
      console.error('Failed to save tree to localStorage', e);
    }
  }, [tree]);

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onEscape: () => {
      setSelectedPersonId(null);
      setIsAddRelativeOpen(false);
      setIsMetadataModalOpen(false);
      setIsAnalyticsModalOpen(false);
      setIsExportModalOpen(false);
      setIsTemplatePickerOpen(false);
    },
  });

  const {
    handleUpdatePerson,
    handleUpdatePersonPosition,
    handleDeletePerson,
    handleAddRelative,
    handleSaveMetadata,
    handleSelectTemplate,
    handleImportJson,
  } = useTreeActions({
    tree,
    updateTreeState,
    updateTreeSilent,
    selectedPersonId,
    setSelectedPersonId,
    relativeTargetPerson,
    closeAddRelative: () => setIsAddRelativeOpen(false),
    closeMetadataModal: () => setIsMetadataModalOpen(false),
    closeTemplatePicker: () => setIsTemplatePickerOpen(false),
  });

  const selectedPerson = tree.people.find((p) => p.id === selectedPersonId) || null;

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        treeTitle={tree.metadata.title || tree.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenTemplates={() => setIsTemplatePickerOpen(true)}
        onOpenAddPerson={() => {
          setRelativeTargetPerson(selectedPerson);
          setIsAddRelativeOpen(true);
        }}
        onOpenMetadata={() => setIsMetadataModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onToggleHistory={() => setIsHistorySidebarOpen((prev) => !prev)}
        isHistoryOpen={isHistorySidebarOpen}
        onImportJson={handleImportJson}
        onToggleOutliner={() => setIsOutlinerOpen((prev) => !prev)}
        isOutlinerOpen={isOutlinerOpen}
      />

      {/* Main Workspace Area */}
      <main className="main-workspace">
        {/* Outliner Sidebar */}
        {isOutlinerOpen && (
          <OutlinerSidebar
            tree={tree}
            selectedPersonId={selectedPersonId}
            onSelectPerson={(p) => setSelectedPersonId(p.id)}
            onAddPerson={() => {
              setRelativeTargetPerson(null);
              setIsAddRelativeOpen(true);
            }}
            onClose={() => setIsOutlinerOpen(false)}
          />
        )}

        {/* History Sidebar */}
        {isHistorySidebarOpen && (
          <HistorySidebar
            entries={historyEntries}
            currentIndex={historyIndex}
            onJumpToIndex={handleJumpToHistory}
            onClose={() => setIsHistorySidebarOpen(false)}
          />
        )}

        {/* Pan and Zoom Canvas */}
        <Canvas
          tree={tree}
          selectedPersonId={selectedPersonId}
          searchQuery={searchQuery}
          onSelectPerson={(p) => setSelectedPersonId(p ? p.id : null)}
          onEditPerson={(p) => {
            setSelectedPersonId(p.id);
          }}
          onAddChild={(parent) => {
            setRelativeTargetPerson(parent);
            setIsAddRelativeOpen(true);
          }}
          onAddSpouse={(p) => {
            setRelativeTargetPerson(p);
            setIsAddRelativeOpen(true);
          }}
          onUpdatePersonPosition={handleUpdatePersonPosition}
          onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
        />

        {/* Inspector Sidebar when a person is selected */}
        {selectedPerson && (
          <PersonInspector
            person={selectedPerson}
            allPeople={tree.people}
            sections={tree.sections}
            marriages={tree.marriages}
            onUpdatePerson={handleUpdatePerson}
            onDeletePerson={handleDeletePerson}
            onAddChild={(p) => {
              setRelativeTargetPerson(p);
              setIsAddRelativeOpen(true);
            }}
            onAddSpouse={(p) => {
              setRelativeTargetPerson(p);
              setIsAddRelativeOpen(true);
            }}
            onClose={() => setSelectedPersonId(null)}
          />
        )}
      </main>

      {/* Modals */}
      {isAddRelativeOpen && (
        <AddRelativeModal
          relativeTo={relativeTargetPerson}
          allPeople={tree.people}
          sections={tree.sections}
          onAdd={handleAddRelative}
          onClose={() => setIsAddRelativeOpen(false)}
        />
      )}

      {isMetadataModalOpen && (
        <TreeMetadataModal
          metadata={tree.metadata}
          sections={tree.sections}
          legend={tree.legend}
          footnotes={tree.footnotes}
          onSave={handleSaveMetadata}
          onClose={() => setIsMetadataModalOpen(false)}
        />
      )}

      {isAnalyticsModalOpen && (
        <AnalyticsModal
          tree={tree}
          onClose={() => setIsAnalyticsModalOpen(false)}
        />
      )}

      {isExportModalOpen && (
        <ExportModal
          tree={tree}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {isTemplatePickerOpen && (
        <TemplatePickerModal
          currentTreeId={tree.id}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setIsTemplatePickerOpen(false)}
        />
      )}
    </div>
  );
};
