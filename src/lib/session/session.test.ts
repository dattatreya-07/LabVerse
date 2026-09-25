import { createInitialSession, loadExperimentSession, exportObservationsToCSV, CURRENT_SESSION_SCHEMA_VERSION } from './storage';
import { getExperiment } from '../experiments/registry';
import { ObservationRecord } from '@/types';

// Mock localStorage in node environment if needed
if (typeof window === 'undefined') {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
  (globalThis as unknown as { window: unknown }).window = { localStorage: mockLocalStorage };
  (globalThis as unknown as { localStorage: unknown }).localStorage = mockLocalStorage;
}

function runSessionTests() {
  console.log('🧪 Starting LabVerse Session System & Schema Tests...\n');

  // Test 1: Initial Session Creation
  console.log('Test 1: createInitialSession creates canonical schema v1.0.0...');
  const exp = getExperiment('ohms-law');
  const session = createInitialSession(exp, 'GUIDED');

  if (session.schemaVersion !== CURRENT_SESSION_SCHEMA_VERSION) {
    throw new Error(`Expected schemaVersion ${CURRENT_SESSION_SCHEMA_VERSION}, got ${session.schemaVersion}`);
  }
  if (session.experimentId !== 'ohms-law') {
    throw new Error(`Expected experimentId ohms-law, got ${session.experimentId}`);
  }
  if (!Array.isArray(session.observations) || session.observations.length !== 0) {
    throw new Error('Initial observations array must be empty');
  }
  if (!Array.isArray(session.faultLog)) {
    throw new Error('Initial faultLog must be an array');
  }
  if (!session.lastResult || session.lastResult.success !== true) {
    throw new Error('Initial session solver result must be valid SUCCESS (success: true)');
  }
  console.log('✓ Test 1 Passed!');

  // Test 2: Observation Record CSV Export
  console.log('\nTest 2: exportObservationsToCSV formats observations accurately...');
  const sampleObservations: ObservationRecord[] = [
    {
      id: 'obs-1',
      timestamp: '2026-09-25T20:00:00.000Z',
      runIndex: 1,
      parameters: { voltage: 5, resistance: 100 },
      measurements: { current_meas: 0.05 },
      theoreticalValues: { current_meas: 0.05 },
      faultsActive: [],
      notes: 'Nominal run'
    },
    {
      id: 'obs-2',
      timestamp: '2026-09-25T20:05:00.000Z',
      runIndex: 2,
      parameters: { voltage: 10, resistance: 100 },
      measurements: { current_meas: 0.0 },
      theoreticalValues: { current_meas: 0.10 },
      faultsActive: ['OPEN_CIRCUIT_RESISTOR'],
      notes: 'Faulted run'
    }
  ];

  const csv = exportObservationsToCSV(sampleObservations, 'Ohm\'s Law Verification');
  if (!csv.includes('Run #,Timestamp,Voltage (V),Resistance (Ω)')) {
    throw new Error('CSV headers missing expected column names');
  }
  if (!csv.includes('1,"2026-09-25T20:00:00.000Z",5,100,0.05,0.05,"None","Nominal run"')) {
    throw new Error('CSV row 1 format mismatch');
  }
  if (!csv.includes('OPEN_CIRCUIT_RESISTOR')) {
    throw new Error('CSV row 2 fault state missing');
  }
  console.log('✓ Test 2 Passed!');

  // Test 3: Session Persistence & Schema Migration Recovery
  console.log('\nTest 3: Schema Migration and Graceful Recovery from Malformed Data...');
  
  // Scenario A: Outdated schema missing arrays
  const legacyData = JSON.stringify({
    sessionId: 'LV-999999',
    studentName: 'Legacy User',
    experimentId: 'ohms-law',
    startTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    mode: 'GUIDED',
    components: [],
    connections: [],
    parameters: { voltage: 5, resistance: 100 },
    activeFaults: [],
    lastResult: null
    // Missing observations, faultLog, schemaVersion
  });

  window.localStorage.setItem('labverse_session_v3_ohms-law', legacyData);
  const loadedMigrated = loadExperimentSession('ohms-law');

  if (loadedMigrated.schemaVersion !== CURRENT_SESSION_SCHEMA_VERSION) {
    throw new Error('Legacy session failed to upgrade schemaVersion');
  }
  if (!Array.isArray(loadedMigrated.observations)) {
    throw new Error('Legacy session failed to initialize observations array');
  }
  if (!Array.isArray(loadedMigrated.faultLog)) {
    throw new Error('Legacy session failed to initialize faultLog array');
  }
  console.log('✓ Test 3A (Legacy Schema Migration) Passed!');

  // Scenario B: Malformed JSON recovery
  window.localStorage.setItem('labverse_session_v3_ohms-law', '{ broken json... ');
  const loadedFresh = loadExperimentSession('ohms-law');

  if (loadedFresh.experimentId !== 'ohms-law' || !loadedFresh.sessionId.startsWith('LV-')) {
    throw new Error('Failed to recover gracefully from broken JSON in localStorage');
  }
  console.log('✓ Test 3B (Malformed Recovery) Passed!');

  console.log('\n🎉 ALL SESSION & SCHEMA TESTS PASSED SUCCESSFULLY!');
}

runSessionTests();
