import { FamilyTreeData } from '../../types/familyTree';

export interface Template {
  id: string;
  name: string;
  description: string;
  data: FamilyTreeData;
}
