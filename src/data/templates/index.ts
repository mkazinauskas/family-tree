import { Template } from './types';

const modules = import.meta.glob<{ default: Template }>('./*.ts', { eager: true });

export const TEMPLATES: Template[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith('/types.ts') && !path.endsWith('/index.ts'))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, mod]) => mod.default);
