import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchHealthFacilities } from '../lib/api';
import { HealthFacility } from '../types';
import { MapPin, Phone, Navigation, Clock, Filter, Search } from 'lucide-react';

export default function Health() {
  const { profile } = useAuth();
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'hospital' | 'gp' | 'pharmacy'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHealthFacilities();
  }, [profile]);

  useEffect(() => {
    filterFacilities();
  }, [facilities, filter, searchQuery]);

  const loadHealthFacilities = async () => {
    if (!profile?.latitude || !profile?.longitude) {
      setError('Location not available. Please set your location in your profile.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchHealthFacilities(profile.latitude, profile.longitude);
      setFacilities(data);
    } catch (err) {
      console.error('Error loading health facilities:', err);
      setError('Failed to load health facilities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterFacilities = () => {
    let filtered = facilities;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(facility => facility.type === filter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(query) ||
        facility.address.toLowerCase().includes(query) ||
        facility.services?.some(service => service.toLowerCase().includes(query))
      );
    }

    setFilteredFacilities(filtered);
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'gp': return '👨‍⚕️';
      case 'pharmacy': return '💊';
      default: return '🏥';
    }
  };

  const getFacilityTypeLabel = (type: string) => {
    switch (type) {
      case 'hospital': return 'Hospital';
      case 'gp': return 'GP Clinic';
      case 'pharmacy': return 'Pharmacy';
      default: return 'Healthcare';
    }
  };

  const openDirections = (facility: HealthFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Facilities</h1>
        <p className="text-gray-600 mt-1">
          Find hospitals, GP clinics, and pharmacies near {profile?.suburb ? `${profile.suburb}, ${profile.state}` : 'your location'}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search facilities, services, or addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: facilities.length },
              { key: 'hospital', label: 'Hospitals', count: facilities.filter(f => f.type === 'hospital').length },
              { key: 'gp', label: 'GP Clinics', count: facilities.filter(f => f.type === 'gp').length },
              { key: 'pharmacy', label: 'Pharmacies', count: facilities.filter(f => f.type === 'pharmacy').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredFacilities.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
            <p className="text-gray-600">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No health facilities available for your location'
              }
            </p>
          </div>
        ) : (
          filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">
                      {getFacilityIcon(facility.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {facility.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          facility.type === 'hospital' ? 'bg-red-100 text-red-700' :
                          facility.type === 'gp' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getFacilityTypeLabel(facility.type)}
                        </span>
                        {facility.emergencyServices && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Emergency
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{facility.address}</span>
                      {facility.distance && (
                        <span className="text-blue-600 font-medium">
                          • {facility.distance.toFixed(1)} km away
                        </span>
                      )}
                    </div>

                    {facility.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <a href={`tel:${facility.phone}`} className="hover:text-blue-600">
                          {facility.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {facility.services && facility.services.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {facility.services.map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => openDirections(facility)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Directions</span>
                  </button>

                  {facility.phone && (
                    <a
                      href={`tel:${facility.phone}`}
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emergency Banner */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🚨</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Emergency Services</h3>
            <p className="text-red-700 text-sm">
              In case of emergency, call <strong>000</strong> immediately. 
              For non-emergency medical advice, call <strong>13 HEALTH (13 43 25 84)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}