import React from 'react';
import { CloudRain, TrendingUp, AlertCircle } from 'lucide-react';
import { mockTyphoonData } from '../utils/helpers';

const History = () => {
    const historicalTyphoons = mockTyphoonData.historical;

    return (
        <div className="space-y-4">
            {historicalTyphoons.map((typhoon, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">{typhoon.name}</h3>
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                            {typhoon.year}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <CloudRain className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-white/70">Category</p>
                            <p className="text-sm font-bold text-white">{typhoon.category}</p>
                        </div>
                        <div className="text-center">
                            <TrendingUp className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-white/70">Damage</p>
                            <p className="text-sm font-bold text-white">{typhoon.damage}</p>
                        </div>
                        <div className="text-center">
                            <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-white/70">Fatalities</p>
                            <p className="text-sm font-bold text-white">{typhoon.fatalities}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default History;