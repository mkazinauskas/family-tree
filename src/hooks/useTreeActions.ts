import { FamilyTreeData, LegendItem, FootnoteItem, Marriage, Person, TreeSection } from '../types/familyTree';
import { useTranslation } from '../i18n/LanguageContext';

const personDisplayName = (p: Pick<Person, 'firstName' | 'lastName'>) =>
  `${p.firstName} ${p.lastName || ''}`.trim();

export interface AddRelativeInput {
  relationType: 'child' | 'spouse' | 'sibling' | 'parent' | 'root';
  personData: Partial<Person>;
  marriageData?: {
    marriageNumber?: string;
    marriageDate?: string;
    spouseBanner?: string;
  };
}

interface UseTreeActionsParams {
  tree: FamilyTreeData;
  updateTreeState: (newTree: FamilyTreeData, label: string) => void;
  updateTreeSilent: (newTree: FamilyTreeData) => void;
  selectedPersonId: string | null;
  setSelectedPersonId: (id: string | null) => void;
  relativeTargetPerson: Person | null;
  closeAddRelative: () => void;
  closeMetadataModal: () => void;
  closeTemplatePicker: () => void;
}

export function useTreeActions({
  tree,
  updateTreeState,
  updateTreeSilent,
  selectedPersonId,
  setSelectedPersonId,
  relativeTargetPerson,
  closeAddRelative,
  closeMetadataModal,
  closeTemplatePicker,
}: UseTreeActionsParams) {
  const { t } = useTranslation();

  const handleUpdatePerson = (updated: Person) => {
    const newPeople = tree.people.map((p) => (p.id === updated.id ? updated : p));
    updateTreeState(
      {
        ...tree,
        updatedAt: new Date().toISOString(),
        people: newPeople,
      },
      t('history.actionUpdatePerson', { name: personDisplayName(updated) })
    );
  };

  const handleUpdatePersonPosition = (personId: string, x: number, y: number) => {
    const newPeople = tree.people.map((p) =>
      p.id === personId ? { ...p, x, y } : p
    );
    // Silent update without pushing a history step on dragging
    updateTreeSilent({ ...tree, people: newPeople });
  };

  const handleDeletePerson = (personId: string) => {
    const person = tree.people.find((p) => p.id === personId);
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

    updateTreeState(
      {
        ...tree,
        updatedAt: new Date().toISOString(),
        people: newPeople,
        marriages: newMarriages,
      },
      t('history.actionDeletePerson', { name: person ? personDisplayName(person) : '' })
    );
  };

  // Add Relative Handler with smart positioning
  const handleAddRelative = ({ relationType, personData, marriageData }: AddRelativeInput) => {
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
      firstName: personData.firstName || t('app.defaultFirstName'),
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
      } else {
        // Create single-parent lineage connection
        const isMale = target.gender !== 'female';
        const newMarriage: Marriage = {
          id: `m-${Date.now()}`,
          husbandId: isMale ? target.id : '',
          wifeId: isMale ? '' : target.id,
          color: target.themePreset?.includes('branch2') ? '#B5761F' : '#2E6B5E',
          childrenIds: [newPersonId],
          sectionId: target.sectionId,
        };
        newMarriages.push(newMarriage);
      }
    }

    updateTreeState(
      {
        ...tree,
        updatedAt: new Date().toISOString(),
        people: [...tree.people, newPerson],
        marriages: newMarriages,
      },
      t('history.actionAddPerson', { name: personDisplayName(newPerson) })
    );

    closeAddRelative();
    setSelectedPersonId(newPersonId);
  };

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
    updateTreeState(
      {
        ...tree,
        updatedAt: new Date().toISOString(),
        metadata,
        sections,
        legend,
        footnotes,
      },
      t('history.actionUpdateMetadata')
    );
    closeMetadataModal();
  };

  const handleSelectTemplate = (tplData: FamilyTreeData) => {
    updateTreeState(tplData, t('history.actionSelectTemplate', { name: tplData.metadata?.title || tplData.name }));
    setSelectedPersonId(null);
    closeTemplatePicker();
  };

  const handleImportJson = (data: any) => {
    // Basic validation
    if (!data || !Array.isArray(data.people) || !Array.isArray(data.marriages)) {
      alert(t('app.invalidJsonPeopleMarriages'));
      return;
    }
    if (!data.metadata || !data.sections) {
      alert(t('app.invalidJsonMetaSections'));
      return;
    }
    updateTreeState(data as FamilyTreeData, t('history.actionImportJson'));
    setSelectedPersonId(null);
  };

  return {
    handleUpdatePerson,
    handleUpdatePersonPosition,
    handleDeletePerson,
    handleAddRelative,
    handleSaveMetadata,
    handleSelectTemplate,
    handleImportJson,
  };
}
