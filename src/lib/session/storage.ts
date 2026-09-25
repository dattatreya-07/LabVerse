import { SessionState, CircuitInput, ObservationRecord, FaultLogEntry, SimulationResult, FaultType } from '@/types';
import { runSimulation } from '@/lib/simulation/engine';

const STORAGE_KEY = 'labverse_ohms_law_session_v1';

export const DEFAULT_INPUT: CircuitInput = {
  voltage: 6.0,
  resistance: 20.0,
  faultType: 'NORMAL',
};

export function createInitialSession(): SessionState {
  const initialResult = runSimulation(DEFAULT_INPUT);
  const initialObs: ObservationRecord = {
    id: `obs-${Date.now()}-1`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    voltage: initialResult.voltage,
    resistance: initialResult.resistance,
    theoreticalCurrent: initialResult.theoreticalCurrent,
    measuredCurrent: initialResult.measuredCurrent,
    faultType: initialResult.faultType,
    notes: 'Initial Baseline Measurement (6.0V, 20.0Ω)',
  };

  return {
    sessionId: `LV-${Math.floor(100000 + Math.random() * 900000)}`,
    studentName: 'Student Researcher',
    startTime: new Date().toISOString(),
    currentInput: DEFAULT_INPUT,
    lastResult: initialResult,
    observations: [initialObs],
    faultLog: [],
    completedSteps: [1], // Step 1 pre-checked
    notes: '',
  };
}

export function loadSession(): SessionState {
  if (typeof window === 'undefined') {
    return createInitialSession();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialSession();
      saveSession(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as SessionState;
    if (!parsed || !parsed.sessionId || !Array.isArray(parsed.observations)) {
      throw new Error('Malformed session data in localStorage');
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse saved session, creating fresh state:', err);
    const fresh = createInitialSession();
    saveSession(fresh);
    return fresh;
  }
}

export function saveSession(session: SessionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Error saving session to localStorage:', err);
  }
}

export function clearSession(): SessionState {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  const fresh = createInitialSession();
  saveSession(fresh);
  return fresh;
}
