import { ExperimentSession, ExperimentDefinition, LearningMode } from '@/types';
import { getExperiment, ohmsLawExperiment } from '@/lib/experiments/registry';

const STORAGE_KEY_PREFIX = 'labverse_session_v2_';

export function createInitialSession(experiment: ExperimentDefinition, mode: LearningMode = 'GUIDED'): ExperimentSession {
  const defaultPreset = experiment.workspace.defaultPreset;
  const initialParams: Record<string, number> = {};
  experiment.parameters.forEach(p => {
    initialParams[p.id] = p.defaultValue;
  });

  const components = defaultPreset?.components ? defaultPreset.components.map(c => ({ ...c })) : [];
  const connections = defaultPreset?.connections ? defaultPreset.connections.map(w => ({ ...w })) : [];

  const initialSimInput = {
    experimentId: experiment.id,
    components,
    connections,
    parameters: initialParams,
    activeFaults: [],
  };

  const initialResult = experiment.simulate(initialSimInput);

  return {
    sessionId: `LV-${Math.floor(100000 + Math.random() * 900000)}`,
    studentName: 'Student Researcher',
    experimentId: experiment.id,
    startTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    mode,
    components,
    connections,
    parameters: initialParams,
    activeFaults: [],
    lastResult: initialResult,
    observations: [],
    faultLog: [],
    completedSteps: [1],
    activeChallengeId: experiment.challenges?.[0]?.id,
    isChallengeCompleted: false,
  };
}

export function loadExperimentSession(experimentId: string, mode: LearningMode = 'GUIDED'): ExperimentSession {
  const exp = getExperiment(experimentId);
  if (typeof window === 'undefined') {
    return createInitialSession(exp, mode);
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${experimentId}`);
    if (!raw) {
      const initial = createInitialSession(exp, mode);
      saveExperimentSession(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as ExperimentSession;
    if (!parsed || parsed.experimentId !== experimentId || !Array.isArray(parsed.components)) {
      throw new Error('Malformed session data in localStorage');
    }
    return parsed;
  } catch (err) {
    console.warn(`Failed to parse saved session for ${experimentId}, creating fresh state:`, err);
    const fresh = createInitialSession(exp, mode);
    saveExperimentSession(fresh);
    return fresh;
  }
}

export function saveExperimentSession(session: ExperimentSession): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = { ...session, lastUpdated: new Date().toISOString() };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${session.experimentId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving session to localStorage:', err);
  }
}

export function clearExperimentSession(experimentId: string): ExperimentSession {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${experimentId}`);
  }
  const exp = getExperiment(experimentId);
  const fresh = createInitialSession(exp);
  saveExperimentSession(fresh);
  return fresh;
}
