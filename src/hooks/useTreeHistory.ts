import { useCallback, useState } from 'react';
import { FamilyTreeData } from '../types/familyTree';

export interface HistoryEntry {
  label: string;
  timestamp: string;
  tree: FamilyTreeData;
}

interface HistoryState {
  entries: HistoryEntry[];
  index: number;
}

const MAX_HISTORY_ENTRIES = 100;

export function useTreeHistory(initialLabel: string, loadInitialTree: () => FamilyTreeData) {
  const [historyState, setHistoryState] = useState<HistoryState>(() => ({
    entries: [{ label: initialLabel, timestamp: new Date().toISOString(), tree: loadInitialTree() }],
    index: 0,
  }));
  const { entries: historyEntries, index: historyIndex } = historyState;

  const tree = historyEntries[historyIndex].tree;

  // Push a new labeled snapshot onto the history timeline, discarding any redo branch
  const updateTreeState = useCallback((newTree: FamilyTreeData, label: string) => {
    setHistoryState((prev) => {
      const base = prev.entries.slice(0, prev.index + 1);
      const next = [...base, { label, timestamp: new Date().toISOString(), tree: newTree }];
      const trimmed = next.length > MAX_HISTORY_ENTRIES ? next.slice(next.length - MAX_HISTORY_ENTRIES) : next;
      return { entries: trimmed, index: trimmed.length - 1 };
    });
  }, []);

  // Silently replace the current snapshot's tree without adding a history entry (e.g. drag positioning)
  const updateTreeSilent = useCallback((newTree: FamilyTreeData) => {
    setHistoryState((prev) => {
      const entries = [...prev.entries];
      entries[prev.index] = { ...entries[prev.index], tree: newTree };
      return { ...prev, entries };
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryState((prev) => (prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev));
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((prev) => (prev.index < prev.entries.length - 1 ? { ...prev, index: prev.index + 1 } : prev));
  }, []);

  const handleJumpToHistory = useCallback((index: number) => {
    setHistoryState((prev) => (index >= 0 && index < prev.entries.length ? { ...prev, index } : prev));
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyEntries.length - 1;

  return {
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
  };
}
