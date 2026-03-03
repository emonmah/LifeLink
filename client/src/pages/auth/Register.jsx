import { useState, useRef } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Droplet, FileText, Upload, Loader2, AlertCircle,
  MapPin, Navigation, Map, CheckCircle, Search
} from "lucide-react";
// Add these new states


export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "donor",
    bloodGroup: "",
    nidNumber: "",
    location: {
      lat: "",
      lon: "",
      area: ""
    }
  });

  const [nidImage, setNidImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    confirmed: false,
    showMap: false
  });
  const [ready] = useState(true); // Set to true since we'll use manual/geo
  const mapRef = useRef(null); // To reference the map div

  // Mock data for the dropdown (since the library is missing)
  const [data, setData] = useState([]);
  const [value, setValue] = useState(""); // This links to your search input
  const [mapLoaded] = useState(false); // To prevent map crashes

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setForm(prev => ({
          ...prev,
          location: {
            ...prev.location,
            lat: latitude.toFixed(6),
            lon: longitude.toFixed(6)
          }
        }));

        fetchLocationName(latitude, longitude);

        // AUTO-CONFIRM FOR SEEKERS
        if (form.role === 'seeker') {
          setAddressDetails(prev => ({ ...prev, confirmed: true }));
        }

        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        alert("Unable to get your location. Please enter manually.");
      }
    );
  };
  // Fetch location name from coordinates
  const fetchLocationName = async (lat, lon) => {
    try {
      // Get a free key from LocationIQ.com
      const API_KEY = "pk.765b27e0d29e4ef8f9990f521bfa14b2";
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();

      // LocationIQ gives a "display_name" which is much more specific
      if (data.display_name) {
        // We take the first 3 parts of the address for a clean look
        const specificArea = data.display_name.split(',').slice(0, 3).join(',');

        setForm(prev => ({
          ...prev,
          location: { ...prev.location, area: specificArea }
        }));
        setValue(specificArea);
      }
    } catch (error) {
      console.error("Location error:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";

    if (!form.phone) newErrors.phone = "Phone number is required";
    else if (!/^01[3-9]\d{8}$/.test(form.phone)) newErrors.phone = "Valid BD number required";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (form.role === "donor" && !form.bloodGroup) newErrors.bloodGroup = "Blood group is required";

    if (!form.nidNumber) newErrors.nidNumber = "NID number is required";
    if (!nidImage) newErrors.nidImage = "NID image is required";

    // Location validation (required for donors, optional for seekers)
    if (form.role === "donor") {
      if (!form.location.lat || !form.location.lon) {
        newErrors.location = "Location is required for donors";
      }
      if (!form.location.area) {
        newErrors.area = "Area name is required";
      }
      // Only require confirmation button click for Donors
      if (!addressDetails.confirmed) {
        newErrors.locationConfirm = "Please click 'Confirm This Location' after selecting your area.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setForm(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, nidImage: "File size should be less than 5MB" }));
        return;
      }
      setNidImage(file);
      setErrors(prev => ({ ...prev, nidImage: "" }));
    }
  };

  const handleSelect = (description) => {
    setForm(prev => ({
      ...prev,
      location: { ...prev.location, area: description }
    }));
    setData([]); // Clear suggestions
  };

  const confirmLocation = () => {
    if (!form.location.lat || !form.location.area) {
      alert("Please get your location or enter an area first.");
      return;
    }
    setAddressDetails(prev => ({ ...prev, confirmed: true }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();

      // Add all form fields
      Object.keys(form).forEach((key) => {
        if (key === 'location') {
          // Stringify location object
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });

      if (nidImage) {
        formData.append("nidImage", nidImage);
      }

      const res = await axios.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      localStorage.setItem("tempToken", res.data.temporaryToken);
      navigate("/verify-otp");

    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleManualSearch = (e) => {
    const val = e.target.value;
    setValue(val); // Updates the UI
    setForm(prev => ({
      ...prev,
      location: { ...prev.location, area: val } // Updates the data to be sent
    }));
  };

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your LifeLink Account
          </h1>
          <p className="text-gray-600">
            Join our community of lifesavers and make a difference
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          {/* Phone and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="phone"
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Role and Blood Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to *
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                <option value="donor">Donate Blood</option>
                <option value="seeker">Request Blood</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group {form.role === "donor" && "*"}
              </label>
              <div className="relative">
                <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none appearance-none bg-white ${errors.bloodGroup ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              {errors.bloodGroup && <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>}
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Location Information {form.role === "donor" && "*"}
                {addressDetails.confirmed && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  Use My Location
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {form.role === "donor"
                ? "Exact location is required for donors so seekers can find you accurately."
                : "Your location helps us provide better service."}
            </p>

            {/* Address Search with Autocomplete */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Your Address *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={value}
                  onChange={handleManualSearch} // Use the new function
                  disabled={!ready}
                  placeholder="Type your area (e.g., Dhanmondi, Dhaka)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {data.length > 0 && (
                <div className="mt-1 border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
                  {data.map(({ place_id, description }) => (
                    <div
                      key={place_id}
                      onClick={() => handleSelect(description)}
                      className="px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm text-gray-800">{description}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-1 text-xs text-gray-500">
                Start typing your address and select from suggestions
              </p>
            </div>

            {/* Simplified Location Details Display */}
            {form.location.area && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 mb-1">Selected Location</h4>
                    <p className="text-sm text-blue-700 mb-2">{form.location.area}</p>

                    {form.location.lat && (
                      <div className="text-xs text-gray-600">
                        Coordinates: {form.location.lat}, {form.location.lon}
                      </div>
                    )}
                  </div>
                </div>

                {!addressDetails.confirmed && (
                  <button
                    type="button"
                    onClick={confirmLocation}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm This Location
                  </button>
                )}
              </div>
            )}

            {/* Map Preview (when address is selected) */}
            {addressDetails.showMap && !addressDetails.confirmed && mapLoaded && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Map Preview</h4>
                  <span className="text-xs text-gray-500">Confirm your location on map</span>
                </div>
                <div
                  id="map-preview"
                  className="w-full h-64 rounded-lg border border-gray-300 overflow-hidden"
                  ref={mapRef}
                >
                  {/* Map will be rendered here */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Map loading...</p>
                      <p className="text-sm text-gray-500 mt-1">Address: {form.location.fullAddress}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Please verify the location marker is correct
                </p>
              </div>
            )}

            {/* Manual Coordinates Input (Optional, for advanced users) */}
            <details className="mt-4">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                Advanced: Manual Coordinates Input
              </summary>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Latitude</label>
                  <input
                    name="location.lat"
                    type="number"
                    step="any"
                    placeholder="23.810332"
                    value={form.location.lat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Longitude</label>
                  <input
                    name="location.lon"
                    type="number"
                    step="any"
                    placeholder="90.412518"
                    value={form.location.lon}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </details>

            {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
            {errors.area && <p className="mt-2 text-sm text-red-600">{errors.area}</p>}
            {errors.locationConfirm && <p className="mt-2 text-sm text-red-600">{errors.locationConfirm}</p>}
          </div>

          {/* NID Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NID Number *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="nidNumber"
                placeholder="Enter your NID number (10, 13, or 17 digits)"
                value={form.nidNumber}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${errors.nidNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
            </div>
            {errors.nidNumber && <p className="mt-1 text-sm text-red-600">{errors.nidNumber}</p>}
          </div>

          {/* NID Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload NID Photo *
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${errors.nidImage ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-red-400'
              }`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="nidUpload"
                onChange={handleFileChange}
              />
              <label htmlFor="nidUpload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-700 mb-1">
                    {nidImage ? nidImage.name : "Click to upload NID photo"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Max file size: 5MB (JPG, PNG, GIF)
                  </p>
                </div>
              </label>
            </div>
            {errors.nidImage && <p className="mt-1 text-sm text-red-600">{errors.nidImage}</p>}

            {nidImage && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">File selected: {nidImage.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Important Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Important Information</p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Your NID will be verified by our admin team before your account is activated</li>
                  <li>Donors must provide location for seekers to find them</li>
                  <li>You will receive an OTP to verify your email address</li>
                  <li>All information is kept secure and confidential</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-red-600 hover:text-red-800 font-medium">
              Sign in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}