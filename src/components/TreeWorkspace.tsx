import React, { useEffect, useState } from 'react';
import { Person } from '../types/familyTree';
import { Header } from './Header';
import { Canvas } from './Canvas';
import { PersonInspector } from './PersonInspector';
import { AddRelativeModal } from './AddRelativeModal';
import { TreeMetadataModal } from './TreeMetadataModal';
import { AnalyticsModal } from './AnalyticsModal';
import { ExportModal } from './ExportModal';
import { TemplatePickerModal } from './TemplatePickerModal';
import { OutlinerSidebar } from './OutlinerSidebar';
import { HistorySidebar } from './HistorySidebar';
import { useTreeHistory, HistoryState } from '../hooks/useTreeHistory';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTreeActions } from '../hooks/useTreeActions';

interface TreeWorkspaceProps {
  projectName: string;
  loadInitialHistory: () => HistoryState;
  onPersistHistory: (state: HistoryState) => void;
  onOpenProjectExplorer: () => void;
}

export const TreeWorkspace: React.FC<TreeWorkspaceProps> = ({
  projectName,
  loadInitialHistory,
  onPersistHistory,
  onOpenProjectExplorer,
}) => {
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
  } = useTreeHistory(loadInitialHistory);

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

  // Persist this project's history whenever it changes
  useEffect(() => {
    onPersistHistory({ entries: historyEntries, index: historyIndex });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyEntries, historyIndex]);

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
        projectName={projectName}
        onOpenProjectExplorer={onOpenProjectExplorer}
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
