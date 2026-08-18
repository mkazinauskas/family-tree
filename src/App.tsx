import React, { useCallback, useState } from 'react';
import tamosiusGaidysTemplate from './data/templates/tamosius-gaidys';
import { TreeWorkspace } from './components/TreeWorkspace';
import { ProjectExplorerModal } from './components/ProjectExplorerModal';
import { NewProjectModal } from './components/NewProjectModal';
import { useTranslation } from './i18n/LanguageContext';
import { useProjects } from './hooks/useProjects';
import { HistoryState } from './hooks/useTreeHistory';
import { FamilyTreeData } from './types/familyTree';

export const App: React.FC = () => {
  const { t } = useTranslation();

  const {
    projects,
    activeProjectId,
    createProject,
    switchProject,
    renameProject,
    duplicateProject,
    deleteProject,
    saveProjectHistory,
    loadProjectHistory,
  } = useProjects(t('history.actionInitial'));

  const [isProjectExplorerOpen, setIsProjectExplorerOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const hasProjects = projects.length > 0;

  const loadInitialHistory = useCallback(
    () =>
      loadProjectHistory(activeProjectId) || {
        entries: [{ label: t('history.actionInitial'), timestamp: new Date().toISOString(), tree: tamosiusGaidysTemplate.data }],
        index: 0,
      },
    // Only re-derived when the active project actually changes (TreeWorkspace remounts via key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProjectId]
  );

  const handlePersistHistory = useCallback(
    (state: HistoryState) => saveProjectHistory(activeProjectId, state),
    [activeProjectId, saveProjectHistory]
  );

  const handleCreateProject = (name: string, treeData: FamilyTreeData) => {
    createProject(name, treeData);
    setIsNewProjectOpen(false);
    setIsProjectExplorerOpen(false);
  };

  return (
    <>
      {hasProjects && (
        <TreeWorkspace
          key={activeProjectId}
          projectName={activeProject?.name || ''}
          loadInitialHistory={loadInitialHistory}
          onPersistHistory={handlePersistHistory}
          onOpenProjectExplorer={() => setIsProjectExplorerOpen(true)}
        />
      )}

      {hasProjects && isProjectExplorerOpen && (
        <ProjectExplorerModal
          projects={projects}
          activeProjectId={activeProjectId}
          onSelect={(id) => {
            switchProject(id);
            setIsProjectExplorerOpen(false);
          }}
          onRename={renameProject}
          onDuplicate={duplicateProject}
          onDelete={deleteProject}
          onCreateNew={() => {
            setIsProjectExplorerOpen(false);
            setIsNewProjectOpen(true);
          }}
          onClose={() => setIsProjectExplorerOpen(false)}
        />
      )}

      {(isNewProjectOpen || !hasProjects) && (
        <NewProjectModal
          onCreate={handleCreateProject}
          onClose={hasProjects ? () => setIsNewProjectOpen(false) : undefined}
        />
      )}
    </>
  );
};
