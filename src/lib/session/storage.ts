import { ExperimentSession, ExperimentDefinition, LearningMode, ObservationRecord } from '@/types';
import { getExperiment } from '@/lib/experiments/registry';

const STORAGE_KEY_PREFIX = 'labverse_session_v3_';
export const CURRENT_SESSION_SCHEMA_VERSION = '1.0.0';

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
    schemaVersion: CURRENT_SESSION_SCHEMA_VERSION,
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

    // Validate schema shape and perform graceful migration if needed
    if (!parsed || parsed.experimentId !== experimentId || !Array.isArray(parsed.components)) {
      throw new Error('Malformed session data structure');
    }

    const migratedSession: ExperimentSession = {
      ...parsed,
      schemaVersion: CURRENT_SESSION_SCHEMA_VERSION,
      observations: Array.isArray(parsed.observations) ? parsed.observations : [],
      faultLog: Array.isArray(parsed.faultLog) ? parsed.faultLog : [],
      completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [1],
    };

    return migratedSession;
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
    const updated = { 
      ...session, 
      schemaVersion: CURRENT_SESSION_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString() 
    };
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

/**
 * Formats observation records into downloadable CSV format
 */
export function exportObservationsToCSV(observations: ObservationRecord[], _experimentTitle?: string): string {
  if (observations.length === 0) {
    return 'Run #,Timestamp,Circuit Topology,Faults Active,Notes\n';
  }

  const headers = ['Run #', 'Timestamp', 'Voltage (V)', 'Resistance (Ω)', 'Measured Current (A)', 'Theoretical Current (A)', 'Active Faults', 'Notes'];
  const rows = observations.map(obs => {
    const voltage = obs.parameters['voltage'] ?? 0;
    const resistance = obs.parameters['resistance'] ?? 0;
    const measI = obs.measurements['current_meas'] ?? 0;
    const theoI = obs.theoreticalValues['current_meas'] ?? 0;
    const faults = obs.faultsActive.join(';') || 'None';
    const notes = (obs.notes || '').replace(/"/g, '""');

    return [
      obs.runIndex,
      `"${obs.timestamp}"`,
      voltage,
      resistance,
      measI,
      theoI,
      `"${faults}"`,
      `"${notes}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
