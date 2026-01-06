import React from 'react';
import { AlertCircle, MapPin } from 'lucide-react';
import { mockWeatherAlerts } from '../utils/helpers';

const Alerts = () => {
    const alerts = mockWeatherAlerts;

    return (
        <div className="space-y-4">
            {alerts.map((alert) => (
                <div key={alert.id} className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 border ${alert.severity === 'high' ? 'border-red-500/30' : 'border-yellow-500/30'
                    }`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${alert.severity === 'high' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                            }`}>
                            <AlertCircle className={`w-5 h-5 ${alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                                }`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">{alert.title}</h3>
                            <p className="text-sm text-white/80 mb-2">{alert.message}</p>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                                <MapPin className="w-3 h-3" />
                                {alert.location}
                                <span className="mx-2">•</span>
                                {new Date(alert.timestamp).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Alerts;