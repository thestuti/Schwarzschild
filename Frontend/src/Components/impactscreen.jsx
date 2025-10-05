import { useEffect, useState } from "react";
import useAsteroidStore from "../other/useAsteroidStore";
import { computeImpactEffects } from "./impactcalculator";

export default function ImpactResultsSidebar() {
  const { type, speed, size, launched2,crashed,setCrashed } = useAsteroidStore();
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // initially closed, off-screen

  function hidethesidebar(){
    setIsOpen(false);
    setCrashed(!crashed);

  }

  // Auto-slide in on page load
  useEffect(() => {
    if(crashed==true){
    const timer = setTimeout(() => setIsOpen(true), 100); // slight delay for smooth effect
    return () => clearTimeout(timer);
    }
  }, [crashed]);

  // Compute impact results whenever parameters change
  useEffect(() => {
    if (!size || !speed || !launched2) return;

    const densityMap = {
      A: 3700,
      B: 2200,
      C: 3000,
    };

    const density = densityMap[type] || 3000;

    const res = computeImpactEffects({
      diameter: Number(size) * 1000,
      densityImpactor: density,
      velocity: Number(speed) * 1000,
      densityTarget: 2500,
      angleDeg: 45,
    });

    setResults(res);
  }, [size, speed, type, launched2]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow transition-all duration-300"
      >
        {isOpen ? "Hide Impact Panel" : "Show Impact Panel"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-neutral-900 border-l border-neutral-800 shadow-xl overflow-y-auto p-6 space-y-6 transform transition-transform duration-700 ease-out z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-2xl font-bold text-white border-b border-neutral-700 pb-2">
          Impact Analysis
        </h2>

        {!results ? (
          <div className="text-neutral-400 italic">
            Launch an asteroid to view calculated impact results.
          </div>
        ) : (
          <div className="space-y-4 text-neutral-200">
            {/* Energy & Scale */}
            <div className="bg-neutral-800 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                Energy & Scale
              </h3>
              <p>
                <strong>Energy:</strong> {results.energyMegatons.toFixed(2)} Mt TNT
              </p>
              <p>
                <strong>Kinetic Energy:</strong> {results.energyJoules.toExponential(2)} J
              </p>
              <p>
                <strong>Seismic Magnitude:</strong> {results.magnitude.toFixed(1)} Mw
              </p>
            </div>

            {/* Crater Details */}
            <div className="bg-neutral-800 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                Crater Details
              </h3>
              <p>
                <strong>Crater Diameter:</strong>{" "}
                {(results.craterDiameter / 1000).toFixed(2)} km
              </p>
              <p>
                <strong>Crater Depth:</strong> {(results.craterDepth / 1000).toFixed(2)} km
              </p>
              <p>
                <strong>Ejecta Radius:</strong> {(results.ejectaRadius / 1000).toFixed(2)} km
              </p>
            </div>

            {/* Surface Effects */}
            <div className="bg-neutral-800 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                Surface Effects
              </h3>
              <p>
                <strong>Fireball Radius:</strong> {(results.fireballRadius / 1000).toFixed(2)} km
              </p>
              <p>
                <strong>Thermal Radius:</strong> {results.thermalRadius.toFixed(2)} km
              </p>
              <p>
                <strong>Airblast Radius:</strong> {results.airblastRadius.toFixed(2)} km
              </p>
            </div>
            <div className="pt-4" id="toglobe" >
                        
                        <button
                            
                            type="button"
                            onClick={hidethesidebar}
                            className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded shadow transition-all duration-300 hover:cursor-pointer"
                        >
                           Launch another one
                        </button>
                        
                       
                    </div>
            
          </div>
        )}
      </div>
    </>
  );
}
