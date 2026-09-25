import {
  createCircuitDocument,
  createOhmsLawPresetDocument,
  duplicateComponent,
  validateCircuitDocumentGraph,
  exportCircuitDocumentJSON,
  importCircuitDocumentJSON,
} from './circuit-document-engine';
import { LabComponent, WireConnection } from '@/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('=== Running Circuit Document & Editor Engine Tests ===\n');

// Test 1: Document Creation & Preloaded Preset
const doc1 = createCircuitDocument('My Test Circuit');
assert(doc1.version === '1.0.0', 'Version should be 1.0.0');
assert(doc1.title === 'My Test Circuit', 'Title should match');
console.log('✔ Test 1 Passed: Circuit document creation and schema initialization');

// Test 2: Ohms Law Preset Document
const presetDoc = createOhmsLawPresetDocument();
assert(presetDoc.nodes.length > 0, 'Preset should contain component nodes');
assert(presetDoc.wires.length > 0, 'Preset should contain wire connections');
console.log('✔ Test 2 Passed: Preloaded Ohm’s Law preset schema creation');

// Test 3: Component Duplication
const originalCompId = presetDoc.nodes[0].id;
const dupResult = duplicateComponent(presetDoc.nodes, originalCompId);
assert(dupResult.updatedNodes.length === presetDoc.nodes.length + 1, 'Duplication should increment node count');
assert(dupResult.newNodeId !== null, 'New node ID must be generated');
console.log('✔ Test 3 Passed: Component duplication creates clean node copy with stable ID');

// Test 4: Serialization & Deserialization (Export/Import)
const jsonStr = exportCircuitDocumentJSON(presetDoc);
const importedDoc = importCircuitDocumentJSON(jsonStr);
assert(importedDoc.nodes.length === presetDoc.nodes.length, 'Imported nodes count matches');
assert(importedDoc.wires.length === presetDoc.wires.length, 'Imported wires count matches');
console.log('✔ Test 4 Passed: JSON export and import roundtrip');

// Test 5: Graph Validation - Valid Closed Loop vs Broken Loop
const validValidation = validateCircuitDocumentGraph(presetDoc.nodes, presetDoc.wires);
assert(validValidation.isValid === true, 'Preset circuit topology should validate as true');

// Test 6: Graph Validation - Dangling Wires Detection
const brokenWires: WireConnection[] = [
  ...presetDoc.wires,
  {
    id: 'dangling-wire-99',
    fromComponentId: 'non-existent-comp',
    fromTerminalId: 't1',
    toComponentId: presetDoc.nodes[0].id,
    toTerminalId: presetDoc.nodes[0].terminals[0].id,
  },
];
const brokenValidation = validateCircuitDocumentGraph(presetDoc.nodes, brokenWires);
assert(brokenValidation.isValid === false, 'Dangling wire should cause validation error');
assert(brokenValidation.errors.some(e => e.code === 'DANGLING_WIRE'), 'Errors should include DANGLING_WIRE');
console.log('✔ Test 5 & 6 Passed: Topology validation and dangling wire detection');

console.log('\n=========================================');
console.log('ALL CIRCUIT DOCUMENT ENGINE TESTS PASSED! 🎉');
console.log('=========================================\n');
