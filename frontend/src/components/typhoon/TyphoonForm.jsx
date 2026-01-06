import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const TyphoonForm = ({ typhoon, onSubmit, onClose, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    as_of: '',
    near_location: '',
    windSpeed: '',
    pressure: '',
    location: { lat: '', lon: '' },
    direction: '',
    speed: '',
    description: '',
    affectedAreas: [],
    warnings: [],
    preparedness: [],
    trackingPath: [],
    forecast: [],
    totalDistance: 0,
    trackingTime: 0,
  });

  const [newAffectedArea, setNewAffectedArea] = useState('');
  const [newWarning, setNewWarning] = useState('');
  const [newPreparedness, setNewPreparedness] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typhoon && mode === 'edit') {
      setFormData({
        ...typhoon,
        windSpeed: typhoon.windSpeed || '',
        pressure: typhoon.pressure || '',
        speed: typhoon.speed || '',
        location: typhoon.location || { lat: '', lon: '' },
        affectedAreas: typhoon.affectedAreas || [],
        warnings: typhoon.warnings || [],
        preparedness: typhoon.preparedness || [],
        trackingPath: typhoon.trackingPath || [],
        forecast: typhoon.forecast || [],
        totalDistance: typhoon.totalDistance || 0,
        trackingTime: typhoon.trackingTime || 0,
      });
    }
  }, [typhoon, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addToArray = (field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert string values to numbers
      const submitData = {
        ...formData,
        windSpeed: parseInt(formData.windSpeed),
        pressure: parseInt(formData.pressure),
        speed: parseInt(formData.speed),
        totalDistance: parseInt(formData.totalDistance || 0),
        trackingTime: parseInt(formData.trackingTime || 0),
        location: {
          lat: parseFloat(formData.location.lat),
          lon: parseFloat(formData.location.lon)
        }
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to save typhoon data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-blue-950/95 backdrop-blur-sm p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create New Typhoon' : 'Edit Typhoon'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Typhoon Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Typhoon Rolly"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Severe Tropical Storm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">As Of *</label>
              <input
                type="text"
                name="as_of"
                value={formData.as_of}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 5:00 A.M. - 12/13/2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Near Location *</label>
              <input
                type="text"
                name="near_location"
                value={formData.near_location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 100 km east of Samar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Wind Speed (km/h) *</label>
              <input
                type="number"
                name="windSpeed"
                value={formData.windSpeed}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 165"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Pressure (hPa) *</label>
              <input
                type="number"
                name="pressure"
                value={formData.pressure}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 965"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Direction *</label>
              <input
                type="text"
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., Northwest"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Speed (km/h) *</label>
              <input
                type="number"
                name="speed"
                value={formData.speed}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 25"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Latitude *</label>
              <input
                type="number"
                step="0.0001"
                name="location.lat"
                value={formData.location.lat}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 13.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Longitude *</label>
              <input
                type="number"
                step="0.0001"
                name="location.lon"
                value={formData.location.lon}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 124.0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Describe the typhoon..."
            />
          </div>

          {/* Affected Areas */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Affected Areas</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAffectedArea}
                onChange={(e) => setNewAffectedArea(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Add affected area..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('affectedAreas', newAffectedArea, setNewAffectedArea))}
              />
              <button
                type="button"
                onClick={() => addToArray('affectedAreas', newAffectedArea, setNewAffectedArea)}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.affectedAreas.map((area, index) => (
                <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm rounded-full flex items-center gap-2">
                  {area}
                  <button type="button" onClick={() => removeFromArray('affectedAreas', index)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Warnings</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newWarning}
                onChange={(e) => setNewWarning(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Add warning..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('warnings', newWarning, setNewWarning))}
              />
              <button
                type="button"
                onClick={() => addToArray('warnings', newWarning, setNewWarning)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <span className="flex-1 text-sm text-white/90">{warning}</span>
                  <button type="button" onClick={() => removeFromArray('warnings', index)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preparedness Tips */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Preparedness Tips</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newPreparedness}
                onChange={(e) => setNewPreparedness(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Add preparedness tip..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('preparedness', newPreparedness, setNewPreparedness))}
              />
              <button
                type="button"
                onClick={() => addToArray('preparedness', newPreparedness, setNewPreparedness)}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.preparedness.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="flex-1 text-sm text-white/90">{tip}</span>
                  <button type="button" onClick={() => removeFromArray('preparedness', index)}>
                    <Trash2 className="w-4 h-4 text-green-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Typhoon' : 'Update Typhoon'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TyphoonForm;
