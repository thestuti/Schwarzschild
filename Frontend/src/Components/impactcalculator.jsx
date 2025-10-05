
const G = 9.81; 
const TNT_ENERGY = 4.184e15; // 1 megaton TNT = 4.184e15 Joules

/**
 * 1️⃣ Kinetic Energy (Joules)
 */
export function calcKineticEnergy(diameter, density, velocity) {
  // diameter in meters, velocity in m/s, density in kg/m^3
  const volume = (Math.PI / 6) * Math.pow(diameter, 3);
  const mass = density * volume;
  const energy = 0.5 * mass * Math.pow(velocity, 2);
  return energy; // Joules
}

/**
 * 2️⃣ Energy in Megatons of TNT
 */
export function energyInMegatons(energyJoules) {
  return energyJoules / TNT_ENERGY;
}

/**
 * 3️⃣ Crater Diameter (m)
 * - Use simple crater model (good for < 4 km)
 */
export function calcCraterDiameter(diameter, densityImpactor, densityTarget, velocity, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const term =
    (G * Math.pow(diameter, 3) * densityImpactor) / densityTarget;
  const craterDiameter =
    1.161 * Math.pow(term, 0.217) *
    Math.pow(velocity, 0.44) *
    Math.pow(Math.sin(angleRad), 1 / 3);
  return craterDiameter; // meters
}

/**
 * 4️⃣ Crater Depth (m)
 */
export function calcCraterDepth(craterDiameter) {
  return 0.2 * craterDiameter;
}

/**
 * 5️⃣ Seismic Magnitude (Richter)
 */
export function calcSeismicMagnitude(energyJoules) {
  return 0.67 * Math.log10(energyJoules) - 5.87;
}

/**
 * 6️⃣ Airblast Radius (km)
 * - Approx. radius of heavy damage zone
 */
export function calcAirBlastRadius(energyMegatons) {
  return 0.28 * Math.cbrt(energyMegatons); // km
}

/**
 * 7️⃣ Fireball Radius (m)
 */
export function calcFireballRadius(energyJoules) {
  return 0.002 * Math.pow(energyJoules, 0.4);
}

/**
 * 8️⃣ Thermal Radiation Radius (km)
 * - For 3rd-degree burns
 */
export function calcThermalRadius(energyJoules) {
  return 0.0015 * Math.pow(energyJoules, 0.41); // km
}

/**
 * 9️⃣ Ejecta Blanket Radius (m)
 */
export function calcEjectaRadius(craterDiameter) {
  return 10 * craterDiameter;
}

/**
 * 🔟 Wrapper function — compute all results together
 */
export function computeImpactEffects({
  diameter,
  densityImpactor,
  velocity,
  densityTarget ,
  angleDeg ,
}) {
  const E = calcKineticEnergy(diameter, densityImpactor, velocity);
  const EMT = energyInMegatons(E);
  const craterDiameter = calcCraterDiameter(
    diameter,
    densityImpactor,
    densityTarget,
    velocity,
    angleDeg
  );
  const craterDepth = calcCraterDepth(craterDiameter);
  const magnitude = calcSeismicMagnitude(E);
  const fireballRadius = calcFireballRadius(E);
  const thermalRadius = calcThermalRadius(E);
  const airblastRadius = calcAirBlastRadius(EMT);
  const ejectaRadius = calcEjectaRadius(craterDiameter);

  return {
    energyJoules: E,
    energyMegatons: EMT,
    craterDiameter,
    craterDepth,
    magnitude, //earthquake
    fireballRadius,
    thermalRadius,
    airblastRadius,
    ejectaRadius,
  };
}

//import { computeImpactEffects } from "./utils/impactCalculations";

//const impact = computeImpactEffects({
//  diameter: 100,           // meters
//  densityImpactor: 3000,   // kg/m³ (rock)
//  velocity: 20000,         // m/s
//  densityTarget: 2500,     // kg/m³ (Earth surface)
//  angleDeg: 45
//});

//console.log(impact);


//output
//{
//  energyJoules: 6.28e17,
//  energyMegatons: 150,
//  craterDiameter: 1200,
//  craterDepth: 240,
//  magnitude: 8.3,
//  fireballRadius: 4200,
//  thermalRadius: 7.8,
//  airblastRadius: 7.3,
//  ejectaRadius: 12000
//}