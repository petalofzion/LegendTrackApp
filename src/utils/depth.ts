import type { Topic } from '../types';

const depthRegex = /L\s*([1-4])/i;

export type DepthDeltaState = 'under' | 'on-track' | 'ahead' | 'unset';

export type DepthDelta = {
  targetLevel: number;
  currentLevel: number;
  delta: number;
  stepsNeeded: number;
  state: DepthDeltaState;
  targetLabel: string;
  currentLabel: string;
};

function parseLevel(depthLabel: string) {
  if (!depthLabel) return 0;
  const match = depthLabel.match(depthRegex);
  if (!match) return 0;
  return Number(match[1]) || 0;
}

export function deriveDepthDelta(topic: Pick<Topic, 'depthTarget' | 'currentDepth'>): DepthDelta {
  const targetLabel = topic.depthTarget?.trim() ?? '';
  const currentLabel = topic.currentDepth?.trim() ?? '';
  const targetLevel = parseLevel(targetLabel);
  const currentLevel = parseLevel(currentLabel);
  const delta = targetLevel - currentLevel;
  const stepsNeeded = Math.abs(delta);

  let state: DepthDeltaState;
  if (!targetLevel && !currentLevel) {
    state = 'unset';
  } else if (!targetLevel && currentLevel) {
    state = 'unset';
  } else if (!currentLevel && targetLevel) {
    state = 'under';
  } else if (currentLevel < targetLevel) {
    state = 'under';
  } else if (currentLevel === targetLevel) {
    state = 'on-track';
  } else {
    state = 'ahead';
  }

  return {
    targetLevel,
    currentLevel,
    delta,
    stepsNeeded,
    state,
    targetLabel,
    currentLabel,
  };
}

export function depthDeltaMessage(delta: DepthDelta) {
  if (delta.state === 'unset') {
    return 'Set a depth target';
  }

  if (delta.state === 'on-track') {
    return 'On target';
  }

  if (delta.state === 'under') {
    if (!delta.targetLevel) {
      return 'Clarify target depth';
    }
    const suffix = delta.stepsNeeded === 1 ? 'level' : 'levels';
    return `Needs +${delta.stepsNeeded} ${suffix}`;
  }

  const suffix = delta.stepsNeeded === 1 ? 'level' : 'levels';
  return `Ahead by ${delta.stepsNeeded} ${suffix}`;
}
