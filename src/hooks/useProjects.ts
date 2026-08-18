import { useCallback, useState } from 'react';
import { FamilyTreeData } from '../types/familyTree';
import { HistoryState } from './useTreeHistory';

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  peopleCount: number;
}

interface ProjectsIndex {
  projects: ProjectMeta[];
  activeProjectId: string;
}

const INDEX_KEY = 'family_tree_projects_index_v1';
const LEGACY_KEY = 'family_tree_current_data_v1';
const projectDataKey = (id: string) => `family_tree_project_data_v1_${id}`;

function genId(): string {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isHistoryState(value: unknown): value is HistoryState {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as HistoryState).entries) &&
    (value as HistoryState).entries.length > 0 &&
    typeof (value as HistoryState).index === 'number'
  );
}

function readIndex(): ProjectsIndex | null {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.projects) && typeof parsed.activeProjectId === 'string') {
      return parsed as ProjectsIndex;
    }
  } catch (e) {
    console.error('Failed to parse projects index', e);
  }
  return null;
}

function writeIndex(index: ProjectsIndex) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.error('Failed to save projects index', e);
  }
}

function readProjectHistory(id: string): HistoryState | null {
  try {
    const raw = localStorage.getItem(projectDataKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isHistoryState(parsed) ? parsed : null;
  } catch (e) {
    console.error('Failed to parse project history', e);
    return null;
  }
}

function writeProjectHistory(id: string, state: HistoryState) {
  try {
    localStorage.setItem(projectDataKey(id), JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save project history', e);
  }
}

function makeSingleProjectIndex(name: string, history: HistoryState): ProjectsIndex {
  const tree = history.entries[Math.min(Math.max(history.index, 0), history.entries.length - 1)].tree;
  const id = genId();
  writeProjectHistory(id, history);
  const now = new Date().toISOString();
  return {
    projects: [{ id, name, createdAt: now, updatedAt: tree.updatedAt || now, peopleCount: tree.people.length }],
    activeProjectId: id,
  };
}

const EMPTY_INDEX: ProjectsIndex = { projects: [], activeProjectId: '' };

// First run: migrate the old single-tree localStorage format into a project, if one exists.
// If nothing was ever saved, leave the index empty so the user is asked how to create their project.
function bootstrapIndex(initialLabel: string): ProjectsIndex {
  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (!legacyRaw) return EMPTY_INDEX;

  let history: HistoryState;
  try {
    const parsed = JSON.parse(legacyRaw);
    history = isHistoryState(parsed)
      ? parsed
      : { entries: [{ label: initialLabel, timestamp: new Date().toISOString(), tree: parsed as FamilyTreeData }], index: 0 };
  } catch (e) {
    console.error('Failed to parse legacy tree data', e);
    return EMPTY_INDEX;
  }

  const tree = history.entries[Math.min(Math.max(history.index, 0), history.entries.length - 1)].tree;
  const name = tree.metadata?.title || tree.name || 'Family Tree';
  const index = makeSingleProjectIndex(name, history);
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
  return index;
}

export function useProjects(initialLabel: string) {
  const [index, setIndex] = useState<ProjectsIndex>(() => readIndex() || bootstrapIndex(initialLabel));

  const createProject = useCallback((name: string, initialTree: FamilyTreeData) => {
    const id = genId();
    const now = new Date().toISOString();
    const tree: FamilyTreeData = { ...initialTree, updatedAt: now };
    writeProjectHistory(id, { entries: [{ label: initialLabel, timestamp: now, tree }], index: 0 });
    setIndex((prev) => {
      const next: ProjectsIndex = {
        projects: [...prev.projects, { id, name, createdAt: now, updatedAt: now, peopleCount: tree.people.length }],
        activeProjectId: id,
      };
      writeIndex(next);
      return next;
    });
    return id;
  }, [initialLabel]);

  const switchProject = useCallback((id: string) => {
    setIndex((prev) => {
      if (prev.activeProjectId === id || !prev.projects.some((p) => p.id === id)) return prev;
      const next = { ...prev, activeProjectId: id };
      writeIndex(next);
      return next;
    });
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    setIndex((prev) => {
      const next = { ...prev, projects: prev.projects.map((p) => (p.id === id ? { ...p, name } : p)) };
      writeIndex(next);
      return next;
    });
  }, []);

  const duplicateProject = useCallback((id: string, newName: string) => {
    const source = readProjectHistory(id);
    if (!source) return null;
    const newId = genId();
    const now = new Date().toISOString();
    writeProjectHistory(newId, source);
    setIndex((prev) => {
      const orig = prev.projects.find((p) => p.id === id);
      const next: ProjectsIndex = {
        projects: [
          ...prev.projects,
          { id: newId, name: newName, createdAt: now, updatedAt: now, peopleCount: orig?.peopleCount ?? 0 },
        ],
        activeProjectId: newId,
      };
      writeIndex(next);
      return next;
    });
    return newId;
  }, []);

  const deleteProject = useCallback((id: string) => {
    setIndex((prev) => {
      const remaining = prev.projects.filter((p) => p.id !== id);
      let finalProjects = remaining;
      let activeProjectId = prev.activeProjectId;

      if (remaining.length === 0) {
        // Zero projects left: the user will be asked how to create a new one.
        finalProjects = [];
        activeProjectId = '';
      } else if (activeProjectId === id) {
        activeProjectId = remaining[0].id;
      }

      try {
        localStorage.removeItem(projectDataKey(id));
      } catch {
        // ignore
      }

      const next: ProjectsIndex = { projects: finalProjects, activeProjectId };
      writeIndex(next);
      return next;
    });
  }, []);

  const saveProjectHistory = useCallback((id: string, state: HistoryState) => {
    writeProjectHistory(id, state);
    const tree = state.entries[state.index]?.tree;
    if (!tree) return;
    setIndex((prev) => {
      const current = prev.projects.find((p) => p.id === id);
      if (!current) return prev;
      const updatedAt = tree.updatedAt || new Date().toISOString();
      if (current.updatedAt === updatedAt && current.peopleCount === tree.people.length) return prev;
      const next = {
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === id ? { ...p, updatedAt, peopleCount: tree.people.length } : p
        ),
      };
      writeIndex(next);
      return next;
    });
  }, []);

  return {
    projects: index.projects,
    activeProjectId: index.activeProjectId,
    createProject,
    switchProject,
    renameProject,
    duplicateProject,
    deleteProject,
    saveProjectHistory,
    loadProjectHistory: readProjectHistory,
  };
}
