import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';
import { Search, MapPin, Droplet, Phone, Map, List, Award, Navigation, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

const SearchDonors = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    bloodGroup: 'O+',
    location: '',
    radius: 10
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    withLocation: 0,
    availableNow: 0
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Get current location function
  const getCurrentLocation = useCallback(() => {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return Promise.reject('Geolocation not supported');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setCurrentLocation(location);
          setUsingCurrentLocation(true);
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to get your location. ';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }

          setLocationError(errorMessage);
          setUsingCurrentLocation(false);
          reject(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const geocodeLocation = useCallback(async (locationName) => {
    try {
      if (locationName === 'Current Location' && currentLocation) {
        return {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          displayName: 'Your Current Location'
        };
      }

      // For Bangladesh - common locations
      const commonLocations = {
        'dhaka': { lat: 23.8103, lng: 90.4125, name: 'Dhaka' },
        'chittagong': { lat: 22.3569, lng: 91.7832, name: 'Chittagong' },
        'khulna': { lat: 22.8456, lng: 89.5403, name: 'Khulna' },
        'rajshahi': { lat: 24.3745, lng: 88.6042, name: 'Rajshahi' },
        'sylhet': { lat: 24.8949, lng: 91.8687, name: 'Sylhet' },
        'barisal': { lat: 22.7010, lng: 90.3535, name: 'Barisal' },
        'rangpur': { lat: 25.7466, lng: 89.2517, name: 'Rangpur' },
        'mymensingh': { lat: 24.7471, lng: 90.4203, name: 'Mymensingh' },
        'comilla': { lat: 23.4680, lng: 91.1782, name: 'Comilla' },
        'narayanganj': { lat: 23.6238, lng: 90.5000, name: 'Narayanganj' }
      };

      const lowerName = locationName.toLowerCase();

      for (const [key, location] of Object.entries(commonLocations)) {
        if (lowerName.includes(key)) {
          return {
            lat: location.lat,
            lng: location.lng,
            displayName: location.name
          };
        }
      }
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName + ', Bangladesh')}&limit=1&accept-language=en`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            return {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
              displayName: data[0].display_name.split(',')[0]
            };
          }
        }
      } catch (osmError) {
        console.warn('OpenStreetMap geocoding failed:', osmError);
      }

      // Fallback: Use Dhaka coordinates
      return {
        lat: 23.8103,
        lng: 90.4125,
        displayName: 'Dhaka'
      };

    } catch (error) {
      console.error('Geocoding error:', error);
      // Default to Dhaka if everything fails
      return {
        lat: 23.8103,
        lng: 90.4125,
        displayName: 'Dhaka'
      };
    }
  }, [currentLocation]);

  const handleSearch = useCallback(async () => {
    if (!searchParams.bloodGroup) {
      alert('Please select a blood group');
      return;
    }

    setLoading(true);
    setDonors([]);

    try {
      let coordinates = null;

      // Handle location if provided
      if (searchParams.location && searchParams.location.trim() !== '') {
        if (searchParams.location === 'Current Location') {
          if (!currentLocation) {
            // Get current location if not already available
            coordinates = await getCurrentLocation();
          } else {
            coordinates = currentLocation;
          }
        } else {
          // Geocode the entered location
          const geocoded = await geocodeLocation(searchParams.location);
          coordinates = {
            lat: geocoded.lat,
            lng: geocoded.lng
          };
        }
      }

      console.log('🔍 Searching for blood group:', searchParams.bloodGroup);
      console.log('📍 Using coordinates:', coordinates);

      const apiParams = {
        bloodGroup: searchParams.bloodGroup,
        maxResults: 100
      };
      if (coordinates) {
        apiParams.lat = coordinates.lat;
        apiParams.lng = coordinates.lng;
        apiParams.radius = searchParams.radius;
      }

      console.log('📡 API Parameters:', apiParams);

      const response = await axios.get('/donor/search', {
        params: apiParams
      });

      console.log('✅ API Response:', response.data);

      if (response.data.success) {
        const formattedDonors = response.data.donors.map(donor => ({
          _id: donor.id || donor._id,
          name: donor.name || 'Anonymous Donor',
          bloodGroup: donor.bloodGroup,
          distance: donor.distance || 0,
          phone: donor.phone || 'Contact admin',
          points: donor.totalPoints || donor.points || 0,
          lastDonation: donor.lastDonationDate,
          address: donor.coordinates ?
            `${donor.coordinates.lat?.toFixed(4)}, ${donor.coordinates.lng?.toFixed(4)}` :
            donor.area || donor.address || 'Location not specified',
          isAvailable: donor.isAvailable,
          nextAvailableDate: donor.nextAvailableDate,
          email: donor.email,
          nidVerified: donor.nidVerified,
          registrationDate: donor.registrationDate,
          hasLocation: donor.hasLocation,
          city: donor.city || donor.area || ''
        }));

        setDonors(formattedDonors);

        // Update statistics
        setStats({
          total: response.data.count || 0,
          withLocation: response.data.statistics?.withLocation || 0,
          availableNow: response.data.statistics?.availableNow || 0,
          totalFound: response.data.totalFound || 0
        });

      } else {
        alert(response.data.msg || 'No donors found');
        setDonors([]);
      }

    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentLocation, geocodeLocation, getCurrentLocation]);

  const handleUseCurrentLocation = async () => {
    try {
      setLocationError('');
      const location = await getCurrentLocation();

      if (location) {
        setSearchParams({
          ...searchParams,
          location: 'Current Location'
        });

        // Auto-search after getting location
        setTimeout(() => {
          handleSearch();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  };

  const handleRequest = (donorId) => {
    const donor = donors.find(d => d._id === donorId);
    if (!donor.isAvailable) {
      alert(`This donor is not available until ${new Date(donor.nextAvailableDate).toLocaleDateString()}`);
      return;
    }

    navigate('/seeker/requests/create', { state: { donor } });
  };

  // Common locations in Bangladesh
  const commonLocations = [
    'Current Location',
    'Dhaka',
    'Chittagong',
    'Khulna',
    'Rajshahi',
    'Sylhet',
    'Barisal',
    'Rangpur',
    'Mymensingh',
    'Comilla'
  ];

  useEffect(() => {

  }, []);

  // Handle Enter key press for search
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !loading) {
        handleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSearch, loading]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🔍 Search Blood Donors</h1>
        <p className="text-gray-600 mt-2">
          Find available blood donors by blood group {searchParams.location && 'near your location'}
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 md:mb-8">
        {/* Location Error Alert */}
        {locationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{locationError}</p>
                <p className="text-xs text-red-600 mt-1">
                  Try entering a city name manually instead.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplet className="w-4 h-4 inline-block mr-1" />
              Blood Group *
            </label>
            <select
              value={searchParams.bloodGroup}
              onChange={(e) => setSearchParams({ ...searchParams, bloodGroup: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Location Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline-block mr-1" />
              Location (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter city name or use current location"
                value={searchParams.location}
                onChange={(e) => {
                  setSearchParams({ ...searchParams, location: e.target.value });
                  setUsingCurrentLocation(false);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 pr-28 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                list="locationSuggestions"
              />
              <datalist id="locationSuggestions">
                {commonLocations.map((loc, idx) => (
                  <option key={idx} value={loc} />
                ))}
              </datalist>
              <button
                onClick={handleUseCurrentLocation}
                disabled={loading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-xs px-3 py-1.5 rounded transition-colors ${currentLocation && searchParams.location === 'Current Location'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  } disabled:opacity-50`}
              >
                {currentLocation && searchParams.location === 'Current Location' ?
                  '📍 Using GPS' :
                  '📍 Use GPS'}
              </button>
            </div>

            {/* Current Location Status */}
            {usingCurrentLocation && currentLocation && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 flex items-center gap-1">
                  <span className="font-medium">📍 Current Location:</span>
                  <span>
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </span>
                  {currentLocation.accuracy && (
                    <span className="text-gray-500 ml-2">
                      (±{Math.round(currentLocation.accuracy)}m)
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Quick Location Buttons */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Quick locations:</p>
              <div className="flex flex-wrap gap-2">
                {commonLocations.slice(0, 6).map((location, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (location === 'Current Location') {
                        handleUseCurrentLocation();
                      } else {
                        setSearchParams({ ...searchParams, location });
                      }
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${searchParams.location === location
                      ? location === 'Current Location'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-center">
            <button
              onClick={handleSearch}
              disabled={loading || !searchParams.bloodGroup}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search Donors'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      {donors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.availableNow}</div>
              <div className="text-sm text-gray-600">Available Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.withLocation}</div>
              <div className="text-sm text-gray-600">With Location</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{donors.length}</div>
              <div className="text-sm text-gray-600">Showing</div>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle & Sort Info */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">
            {donors.length > 0 ? (
              <>
                Showing <span className="font-bold text-gray-900">{donors.length}</span> of{' '}
                <span className="font-bold text-gray-900">{stats.totalFound || stats.total}</span> donors
                {searchParams.location && searchParams.location !== '' && (
                  <span className="ml-2 text-sm text-gray-500">
                    {currentLocation ? 'sorted by distance' : 'sorted by registration date'}
                  </span>
                )}
              </>
            ) : (
              'No donors to display'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
            title="Map View"
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {donors.length > 0 ? (
            donors.map((donor) => (
              <div key={donor._id} className="bg-white rounded-xl shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {donor.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm md:text-base">
                        {donor.name || 'Anonymous Donor'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                          <Droplet className="w-3 h-3" />
                          {donor.bloodGroup || 'Unknown'}
                        </span>
                        {donor.distance > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {donor.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600" title="Donation Points">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-bold">{donor.points || 0}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last Donation
                    </span>
                    <span className="font-medium">
                      {donor.lastDonation ?
                        new Date(donor.lastDonation).toLocaleDateString() :
                        'Never'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium flex items-center gap-1 ${donor.isAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                      {donor.isAvailable ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Available Now
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          {donor.nextAvailableDate ?
                            `Available from ${new Date(donor.nextAvailableDate).toLocaleDateString()}` :
                            'Not Available'}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Location
                    </span>
                    <span className="font-medium text-right max-w-[150px] truncate" title={donor.address}>
                      {donor.address || 'Location not specified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Contact
                    </span>
                    <span className="font-medium">
                      {donor.phone || 'Contact admin'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(donor._id)}
                    disabled={!donor.isAvailable}
                    className={`flex-1 py-2 rounded-lg transition-colors text-sm md:text-base ${donor.isAvailable
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {donor.isAvailable ? 'Request Blood' : 'Not Available'}
                  </button>
                  <button
                    onClick={() => alert(`Email: ${donor.email}\nNID Verified: ${donor.nidVerified ? 'Yes' : 'No'}`)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title="View Details"
                  >
                    ℹ️
                  </button>
                </div>
              </div>
            ))
          ) : !loading && (
            <div className="md:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No donors found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchParams.bloodGroup ?
                    `No ${searchParams.bloodGroup} donors found${searchParams.location ? ` near ${searchParams.location}` : ''}.` :
                    'Please select a blood group to search.'
                  }
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {commonLocations.slice(1, 6).map((location, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchParams({ ...searchParams, location });
                        setTimeout(() => handleSearch(), 100);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      Search in {location}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <p className="mb-2">Try:</p>
                  <ul className="space-y-1">
                    <li>• Selecting a different blood group</li>
                    <li>• Searching in a different location</li>
                    <li>• Increasing the search radius</li>
                    <li>• Using "Current Location" for GPS-based search</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Map View Coming Soon</h3>
          <p className="text-gray-600 mb-4">We're working on adding interactive maps to show donor locations.</p>
          <button
            onClick={() => setViewMode('list')}
            className="mt-4 text-red-600 hover:text-red-800 font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Switch to List View
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-900 font-medium">Searching for donors</p>
            <p className="text-gray-600 text-sm mt-2">
              Looking for {searchParams.bloodGroup} donors
              {searchParams.location && ` near ${searchParams.location}`}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDonors;