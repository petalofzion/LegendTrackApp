import { writable, derived } from 'svelte/store';
import type { Project, Topic } from './types';
import { type DepthDeltaState } from './utils/depth';

export type FilterState = {
  track: string;
  status: string;
  depth: string;
};

// Data
export const topics = writable<Topic[]>([]);
export const projects = writable<Project[]>([]);

// UI State
export const zenMode = writable(false);
export const raveMode = writable(false);
export const isTauri = writable(false);
export const trackerPath = writable<string | null>(null);

// Filters & Selection
export const filters = writable<FilterState>({
  track: 'All',
  status: 'All',
  depth: 'All',
});
export const selectedProjectId = writable<string>('All');
export const focusedTopic = writable<string | null>(null);
export const depthStateFilter = writable<'All' | DepthDeltaState>('All');
export const searchTerm = writable('');

// View State
export const collapsedEpochs = writable<Set<number>>(new Set());
export const updatingTopics = writable<Set<string>>(new Set());

// Derived helpers (can be moved here or kept in App.svelte if simple)
