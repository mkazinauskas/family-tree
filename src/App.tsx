import React, { useState, useEffect, useCallback } from 'react';
import { FamilyTreeData, Person, TreeSection, LegendItem, FootnoteItem, Marriage } from './types/familyTree';
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

const LOCAL_STORAGE_KEY = 'family_tree_current_data_v1';

export const App: React.FC = () => {
  // Initialize tree from localStorage or default Tamošius Gaidys
  const [tree, setTree] = useState<FamilyTreeData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved tree', e);
    }
    return TAMOSIUS_GAIDYS_DATA;
  });

  // Undo / Redo History
  const [history, setHistory] = useState<FamilyTreeData[]>([]);
  const [future, setFuture] = useState<FamilyTreeData[]>([]);

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

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tree));
    } catch (e) {
      console.error('Failed to save tree to localStorage', e);
    }
  }, [tree]);

  // Push new state with history tracking
  const updateTreeState = useCallback((newTree: FamilyTreeData, saveHistory = true) => {
    if (saveHistory) {
      setHistory((prev) => [...prev.slice(-30), tree]);
      setFuture([]);
    }
    setTree(newTree);
  }, [tree]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setFuture((prev) => [tree, ...prev]);
    setHistory(newHistory);
    setTree(previous);
  }, [history, tree]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setHistory((prev) => [...prev, tree]);
    setFuture(newFuture);
    setTree(next);
  }, [future, tree]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        setSelectedPersonId(null);
        setIsAddRelativeOpen(false);
        setIsMetadataModalOpen(false);
        setIsAnalyticsModalOpen(false);
        setIsExportModalOpen(false);
        setIsTemplatePickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Person CRUD Handlers
  const selectedPerson = tree.people.find((p) => p.id === selectedPersonId) || null;

  const handleUpdatePerson = (updated: Person) => {
    const newPeople = tree.people.map((p) => (p.id === updated.id ? updated : p));
    updateTreeState({
      ...tree,
      updatedAt: new Date().toISOString(),
      people: newPeople,
    });
  };

  const handleUpdatePersonPosition = (personId: string, x: number, y: number) => {
    const newPeople = tree.people.map((p) =>
      p.id === personId ? { ...p, x, y } : p
    );
    // Silent update without pushing 50 history steps on dragging
    setTree((prev) => ({ ...prev, people: newPeople }));
  };

  const handleDeletePerson = (personId: string) => {
    const newPeople = tree.people.filter((p) => p.id !== personId);
    // Remove or clean marriages
    const newMarriages = tree.marriages
      .filter((m) => m.husbandId !== personId && m.wifeId !== personId)
      .map((m) => ({
        ...m,
        childrenIds: m.childrenIds.filter((cid) => cid !== personId),
      }));

    if (selectedPersonId === personId) {
      setSelectedPersonId(null);
    }

    updateTreeState({
      ...tree,
      updatedAt: new Date().toISOString(),
      people: newPeople,
      marriages: newMarriages,
    });
  };

  // Add Relative Handler with smart positioning
  const handleAddRelative = ({
    relationType,
    personData,
    marriageData,
  }: {
    relationType: 'child' | 'spouse' | 'sibling' | 'parent' | 'root';
    personData: Partial<Person>;
    marriageData?: {
      marriageNumber?: string;
      marriageDate?: string;
      spouseBanner?: string;
    };
  }) => {
    const newPersonId = `person-${Date.now()}`;
    let newX = 900;
    let newY = 400;
    const cardWidth = personData.width || 140;
    const cardHeight = personData.height || 80;

    const target = relativeTargetPerson;

    if (target) {
      const tx = target.x ?? 900;
      const ty = target.y ?? 400;

      if (relationType === 'spouse') {
        newX = tx + (target.width || 140) + 15;
        newY = ty;
      } else if (relationType === 'child') {
        newX = tx;
        newY = ty + (target.height || 80) + 60;
      } else if (relationType === 'sibling') {
        newX = tx + (target.width || 140) + 20;
        newY = ty;
      } else if (relationType === 'parent') {
        newX = tx;
        newY = Math.max(109, ty - 140);
      }
    }

    const newPerson: Person = {
      id: newPersonId,
      firstName: personData.firstName || 'VARDAS',
      lastName: personData.lastName || '',
      maidenName: personData.maidenName,
      gender: personData.gender || 'male',
      birthDate: personData.birthDate,
      deathDate: personData.deathDate,
      location: personData.location,
      notes: personData.notes,
      themePreset: personData.themePreset || 'branch1-descendant',
      spouseBanner: personData.spouseBanner,
      sectionId: personData.sectionId || tree.sections[0]?.id,
      generation: personData.generation || (target ? target.generation : 1),
      x: newX,
      y: newY,
      width: cardWidth,
      height: cardHeight,
    };

    let newMarriages = [...tree.marriages];

    if (target && relationType === 'spouse') {
      const isTargetHusband = target.gender !== 'female';
      const newMarriage: Marriage = {
        id: `m-${Date.now()}`,
        husbandId: isTargetHusband ? target.id : newPersonId,
        wifeId: isTargetHusband ? newPersonId : target.id,
        marriageNumber: marriageData?.marriageNumber || 'I',
        marriageDate: marriageData?.marriageDate,
        color: target.themePreset?.includes('branch2') ? '#B5761F' : '#2E6B5E',
        childrenIds: [],
        sectionId: target.sectionId,
      };
      newMarriages.push(newMarriage);
    } else if (target && relationType === 'child') {
      // Find marriage involving target
      const marriage = newMarriages.find(
        (m) => m.husbandId === target.id || m.wifeId === target.id
      );
      if (marriage) {
        marriage.childrenIds = [...marriage.childrenIds, newPersonId];
      }
    }

    updateTreeState({
      ...tree,
      updatedAt: new Date().toISOString(),
      people: [...tree.people, newPerson],
      marriages: newMarriages,
    });

    setIsAddRelativeOpen(false);
    setSelectedPersonId(newPersonId);
  };

  // Save metadata changes
  const handleSaveMetadata = ({
    metadata,
    sections,
    legend,
    footnotes,
  }: {
    metadata: typeof tree.metadata;
    sections: TreeSection[];
    legend: LegendItem[];
    footnotes: FootnoteItem[];
  }) => {
    updateTreeState({
      ...tree,
      updatedAt: new Date().toISOString(),
      metadata,
      sections,
      legend,
      footnotes,
    });
    setIsMetadataModalOpen(false);
  };

  // Template switch
  const handleSelectTemplate = (tplData: FamilyTreeData) => {
    updateTreeState(tplData);
    setSelectedPersonId(null);
    setIsTemplatePickerOpen(false);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        treeTitle={tree.metadata.title || tree.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
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
