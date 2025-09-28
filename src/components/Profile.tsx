import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { User, MapPin, Bell, Shield, Save, Eye, EyeOff, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { location, error: locationError, loading: locationLoading, getCurrentLocation } = useLocation();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    notification_preferences: {
      severe_weather: true,
      emergency_alerts: true,
      health_reminders: false,
      news_updates: true
    }
  });

  const states = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        suburb: profile.suburb || '',
        state: profile.state || 'NSW',
        postcode: profile.postcode || '',
        notification_preferences: profile.notification_preferences || {
          severe_weather: true,
          emergency_alerts: true,
          health_reminders: false,
          news_updates: true
        }
      });
    }
  }, [profile]);

  useEffect(() => {
    if (location && editing) {
      // Auto-update form with new location when user gets current location
      // Note: We don't auto-save, user needs to click save
    }
  }, [location, editing]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = {
        ...formData,
        latitude: location?.latitude || profile?.latitude,
        longitude: location?.longitude || profile?.longitude,
        updated_at: new Date().toISOString()
      };

      const { error } = await updateProfile(updates);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Profile updated successfully!');
        setEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      setError(error.message);
    }
  };

  const formatLastUpdated = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-blue-100 rounded-full p-3">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  setSuccess(null);
                  // Reset form data
                  if (profile) {
                    setFormData({
                      full_name: profile.full_name || '',
                      phone: profile.phone || '',
                      suburb: profile.suburb || '',
                      state: profile.state || 'NSW',
                      postcode: profile.postcode || '',
                      notification_preferences: profile.notification_preferences || {
                        severe_weather: true,
                        emergency_alerts: true,
                        health_reminders: false,
                        news_updates: true
                      }
                    });
                  }
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Location Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Settings</span>
            </h2>
            
            <div className="space-y-4">
              {editing && !location && (
                <button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                </button>
              )}

              {locationError && editing && (
                <div className="text-sm text-red-600">
                  {locationError.message}
                </div>
              )}

              {(location || (profile?.latitude && profile?.longitude)) && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  ✓ Location: {location?.latitude || profile?.latitude}, {location?.longitude || profile?.longitude}
                  {location && editing && <span className="ml-2 font-medium">(Updated)</span>}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="e.g., 2000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                  <input
                    type="text"
                    value={formData.suburb}
                    onChange={(e) => setFormData(prev => ({ ...prev, suburb: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter suburb"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Preferences</span>
            </h2>
            
            <div className="space-y-4">
              {[
                { 
                  key: 'severe_weather', 
                  label: 'Severe Weather Alerts', 
                  description: 'Storm warnings, heat waves, and extreme weather events',
                  icon: '🌩️'
                },
                { 
                  key: 'emergency_alerts', 
                  label: 'Emergency Alerts', 
                  description: 'Bushfires, floods, and other emergency situations',
                  icon: '🚨'
                },
                { 
                  key: 'health_reminders', 
                  label: 'Health Reminders', 
                  description: 'Vaccination schedules and health check-up reminders',
                  icon: '🏥'
                },
                { 
                  key: 'news_updates', 
                  label: 'News Updates', 
                  description: 'Important news and community announcements',
                  icon: '📰'
                }
              ].map((pref) => (
                <label key={pref.key} className="flex items-start space-x-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notification_preferences[pref.key as keyof typeof formData.notification_preferences]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notification_preferences: {
                        ...prev.notification_preferences,
                        [pref.key]: e.target.checked
                      }
                    }))}
                    disabled={!editing}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-xl mt-0.5">{pref.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{pref.label}</div>
                      <div className="text-sm text-gray-500">{pref.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account Status</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  ✓ Verified
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location Set</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  profile?.latitude && profile?.longitude
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {profile?.latitude && profile?.longitude ? '✓ Set' : '⚠ Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Profile Summary */}
          {profile && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Member since:</span>
                  <br />
                  <span className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString('en-AU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-600">Last updated:</span>
                  <br />
                  <span className="font-medium">
                    {formatLastUpdated(profile.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}