import { ExperimentDefinition, LabComponent, WireConnection, SimulationResult } from '@/types';

export function syncDynamicSimulation(
  experiment: ExperimentDefinition,
  components: LabComponent[],
  connections: WireConnection[],
  parameters: Record<string, number>,
  activeFaults: string[]
): { simulationResult: SimulationResult; updatedComponents: LabComponent[] } {
  const simInput = {
    experimentId: experiment.id,
    components,
    connections,
    parameters,
    activeFaults,
  };

  let simulationResult: SimulationResult;
  try {
    simulationResult = experiment.simulate(simInput);
  } catch (err) {
    const errMsg = (err as Error)?.message || 'Simulation error occurred';
    simulationResult = {
      success: false,
      experimentId: experiment.id,
      measurements: [],
      derivedValues: {},
      visualState: { isOperating: false },
      topology: { isValid: false, canSimulate: false, message: errMsg, errors: [{ code: 'SIMULATION_ERROR', message: errMsg }], warnings: [] },
      warnings: [],
      errors: [{ code: 'SIMULATION_ERROR', message: errMsg }],
      timestamp: new Date().toISOString(),
    };
  }

  // Find standard measurements
  const measMap = new Map<string, number>();
  simulationResult.measurements.forEach((m) => {
    measMap.set(m.id, m.observedValue);
  });

  const updatedComponents = components.map((c) => {
    const nextComp: LabComponent = {
      ...c,
      properties: { ...c.properties },
      state: { ...c.state },
    };

    switch (c.type) {
      case 'BATTERY':
      case 'DC_SUPPLY': {
        const v = parameters['voltage'] ?? nextComp.properties?.voltage ?? 6.0;
        nextComp.properties.voltage = v;
        break;
      }

      case 'RESISTOR':
      case 'VARIABLE_RESISTOR': {
        const r = parameters['resistance'] ?? nextComp.properties?.resistance ?? 20.0;
        nextComp.properties.resistance = r;
        break;
      }

      case 'AMMETER': {
        const currentVal =
          measMap.get('current') ??
          measMap.get('photo_current') ??
          measMap.get('i_circuit') ??
          simulationResult.derivedValues?.current ??
          0;
        
        const unit = experiment.id === 'photoelectric-effect' ? 'µA' : 'A';
        const formatted = unit === 'µA' 
          ? `${Number(currentVal).toFixed(2)} µA` 
          : `${Number(currentVal).toFixed(3)} A`;

        nextComp.state = {
          ...nextComp.state,
          displayValue: formatted,
          valueNumber: Number(currentVal),
        };
        break;
      }

      case 'VOLTMETER': {
        const voltVal =
          measMap.get('voltage') ??
          measMap.get('v_resistor') ??
          measMap.get('stopping_voltage') ??
          simulationResult.derivedValues?.voltage ??
          0;

        nextComp.state = {
          ...nextComp.state,
          displayValue: `${Number(voltVal).toFixed(2)} V`,
          valueNumber: Number(voltVal),
        };
        break;
      }

      case 'PENDULUM': {
        const len = parameters['length'] ?? nextComp.properties?.length ?? 1.0;
        const g = parameters['gravity'] ?? nextComp.properties?.gravity ?? 9.8;
        nextComp.properties.length = len;
        nextComp.properties.gravity = g;
        break;
      }

      case 'STOPWATCH': {
        const periodVal =
          measMap.get('period') ??
          measMap.get('reaction_time') ??
          measMap.get('time') ??
          simulationResult.derivedValues?.period ??
          2.01;

        nextComp.state = {
          ...nextComp.state,
          displayValue: `${Number(periodVal).toFixed(2)} s`,
          valueNumber: Number(periodVal),
        };
        break;
      }

      case 'LIGHT_SOURCE': {
        const wl = parameters['wavelength'] ?? nextComp.properties?.wavelength ?? 350;
        const intensity = parameters['light_intensity'] ?? nextComp.properties?.intensity ?? 80;
        nextComp.properties.wavelength = wl;
        nextComp.properties.intensity = intensity;
        break;
      }

      case 'PHOTO_TUBE': {
        const phi = parameters['work_function'] ?? nextComp.properties?.workFunction ?? 2.28;
        const retarding = parameters['retarding_voltage'] ?? nextComp.properties?.retardingPotential ?? 0;
        nextComp.properties.workFunction = phi;
        nextComp.properties.retardingPotential = retarding;
        break;
      }

      case 'ALPHA_SOURCE': {
        const energy = parameters['beam_energy'] ?? nextComp.properties?.energy ?? 5.5;
        nextComp.properties.energy = energy;
        break;
      }

      case 'GOLD_FOIL': {
        const thick = parameters['foil_thickness'] ?? nextComp.properties?.thickness ?? 400;
        nextComp.properties.thickness = thick;
        break;
      }

      case 'SCATTER_DETECTOR': {
        const countVal = measMap.get('count_rate') ?? simulationResult.derivedValues?.countRate ?? 0;
        const angle = parameters['scatter_angle'] ?? nextComp.properties?.angle ?? 15;
        nextComp.properties.angle = angle;
        nextComp.state = {
          ...nextComp.state,
          displayValue: `θ=${angle}°, ${Math.round(Number(countVal))}/s`,
          valueNumber: Number(countVal),
        };
        break;
      }

      case 'BEAKER': {
        const temp = parameters['temperature'] ?? nextComp.properties?.temperature ?? 25;
        const concA = parameters['concentration_a'] ?? nextComp.properties?.concentrationA ?? 0.1;
        const concB = parameters['concentration_b'] ?? nextComp.properties?.concentrationB ?? 0.1;
        nextComp.properties.temperature = temp;
        nextComp.properties.concentrationA = concA;
        nextComp.properties.concentrationB = concB;
        break;
      }

      case 'SPECTROPHOTOMETER': {
        const absVal = measMap.get('absorbance') ?? simulationResult.derivedValues?.absorbance ?? 0.42;
        nextComp.state = {
          ...nextComp.state,
          displayValue: `A = ${Number(absVal).toFixed(3)}`,
          valueNumber: Number(absVal),
        };
        break;
      }

      case 'FINANCE_CHART': {
        const sharpe = simulationResult.derivedValues?.sharpeRatio ?? 1.85;
        const eqWeight = parameters['equity_weight'] ?? 60;
        nextComp.properties.sharpeRatio = Number(sharpe);
        nextComp.properties.equityWeight = eqWeight;
        break;
      }

      case 'PORTFOLIO_LEDGER': {
        const varRisk = simulationResult.derivedValues?.var95 ?? 2.4;
        const bondWeight = parameters['fixed_income_weight'] ?? 40;
        nextComp.properties.varValue = Number(varRisk);
        nextComp.properties.bondWeight = bondWeight;
        break;
      }

      case 'ELECTROPHORESIS_TANK': {
        const v = parameters['voltage'] ?? 100;
        const gel = parameters['gel_pct'] ?? 1.0;
        nextComp.properties.voltage = v;
        nextComp.properties.gelPct = gel;
        break;
      }

      case 'BULB': {
        const currentVal = measMap.get('current') ?? simulationResult.derivedValues?.current ?? 0;
        nextComp.state = {
          ...nextComp.state,
          brightness: Math.min(1.0, Math.max(0, Number(currentVal) / 0.5)),
        };
        break;
      }

      case 'ANTENNA_TOWER': {
        const freq = parameters['frequency'] ?? 1500;
        const power = parameters['transmit_power'] ?? 10;
        nextComp.properties.frequency = freq;
        nextComp.properties.power = power;
        break;
      }

      case 'RADIATION_PROBE': {
        const dist = parameters['probe_distance'] ?? 5.0;
        const angle = parameters['probe_angle'] ?? 0;
        const eField = measMap.get('e_field') ?? simulationResult.derivedValues?.eField ?? 3.5;
        nextComp.properties.distance = dist;
        nextComp.properties.angle = angle;
        nextComp.state = {
          ...nextComp.state,
          displayValue: `E = ${Number(eField).toFixed(2)} V/m`,
          valueNumber: Number(eField),
        };
        break;
      }

      case 'SIGNAL_GENERATOR': {
        const freq = parameters['frequency'] ?? 1500;
        nextComp.properties.frequency = freq;
        nextComp.state = {
          ...nextComp.state,
          displayValue: `${freq} MHz`,
        };
        break;
      }

      default:
        break;
    }

    return nextComp;
  });

  return {
    simulationResult,
    updatedComponents,
  };
}
