import useAsteroidStore from '../other/useAsteroidStore';

function ImpactAnalysis() {

    const { type, speed, distance, size, damage } = useAsteroidStore();

    return (
        <div className="flex-1 p-8">
            <div className="max-w-md mx-auto bg-neutral-900 rounded-xl shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold border-b border-neutral-700 pb-2">Impact Analysis</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Type</label>
                        <div className="w-full p-2 rounded bg-neutral-700 text-neutral-100 border border-neutral-600">
                            {type}
                        </div>
                    </div>
                    <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Speed (km/s)</label>
                        <div className="w-full p-2 rounded bg-neutral-700 text-neutral-100 border border-neutral-600">
                            {speed}
                        </div>
                    </div>
                    <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Distance (million km)</label>
                        <div className="w-full p-2 rounded bg-neutral-700 text-neutral-100 border border-neutral-600">
                            {distance}
                        </div>
                    </div>
                    <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Size (m)</label>
                        <div className="w-full p-2 rounded bg-neutral-700 text-neutral-100 border border-neutral-600">
                            {size}
                        </div>
                    </div>
                    <div>
                        <label className="block text-neutral-300 font-semibold mb-1">Total Estimated Damage</label>
                        <div className="w-full p-2 rounded bg-neutral-700 text-neutral-100 border border-neutral-600">
                            {damage}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImpactAnalysis;
