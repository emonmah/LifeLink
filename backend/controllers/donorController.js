// controllers/donorController.js - UPDATED
const User = require("../models/User");
const { haversineDistance } = require("../utils/haversine");

// SEARCH DONORS BY BLOOD GROUP AND SORT BY DISTANCE
const searchDonors = async (req, res) => {
  try {
    console.log("🔍 Search query params:", req.query);

    const {
      bloodGroup,
      lat,
      lng,
      maxResults = 50
    } = req.query;

    // Validate blood group if provided
    if (bloodGroup) {
      const validBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
      if (!validBloodGroups.includes(bloodGroup)) {
        return res.status(400).json({
          success: false,
          msg: `Invalid blood group. Must be one of: ${validBloodGroups.join(', ')}`
        });
      }
    }

    // Build query for blood group
    // Build query
    const query = {
      role: "donor",
      nidVerified: true,
      status: "active",
      isBlocked: false
    };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    // Check last donation (90-day rule)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Donors who haven't donated in last 90 days or never donated
    query.$or = [
      { lastDonationDate: { $lt: ninetyDaysAgo } },
      { lastDonationDate: { $exists: false } },
      { lastDonationDate: null }
    ];

    console.log(`📋 Searching for blood group: ${bloodGroup}`);

    // Get all donors with the specified blood group
    const allDonors = await User.find(query)
      .select('name email phone bloodGroup location totalPoints lastDonationDate nidVerified nidStatus createdAt')
      .lean();

    console.log(`✅ Found ${allDonors.length} donors with blood group ${bloodGroup}`);

    // Separate donors with and without location
    const donorsWithLocation = [];
    const donorsWithoutLocation = [];

    allDonors.forEach(donor => {
      if (donor.location &&
        donor.location.coordinates &&
        donor.location.coordinates.length === 2 &&
        donor.location.coordinates[0] !== 0 &&
        donor.location.coordinates[1] !== 0) {
        donorsWithLocation.push(donor);
      } else {
        donorsWithoutLocation.push(donor);
      }
    });

    console.log(`📍 ${donorsWithLocation.length} donors have location data`);
    console.log(`❌ ${donorsWithoutLocation.length} donors have NO location data`);

    let sortedDonors = [];

    // If user provided coordinates, calculate distance and sort
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      console.log(`📍 User location: ${latitude}, ${longitude}`);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          msg: "Invalid user coordinates provided"
        });
      }

      // Calculate distance for each donor with location
      const donorsWithDistance = donorsWithLocation.map(donor => {
        const [donorLng, donorLat] = donor.location.coordinates;

        const distance = haversineDistance(
          latitude,
          longitude,
          donorLat,
          donorLng
        );

        const isAvailable = !donor.lastDonationDate ||
          new Date(donor.lastDonationDate) < ninetyDaysAgo;

        // Calculate next available date if donated recently
        let nextAvailableDate = null;
        if (donor.lastDonationDate && !isAvailable) {
          const lastDonation = new Date(donor.lastDonationDate);
          lastDonation.setDate(lastDonation.getDate() + 90);
          nextAvailableDate = lastDonation;
        }

        return {
          ...donor,
          distance: parseFloat(distance.toFixed(1)), // km with 1 decimal place
          isAvailable,
          nextAvailableDate,
          coordinates: {
            lat: donorLat,
            lng: donorLng
          },
          hasLocation: true
        };
      });

      // Sort by distance (nearest first)
      donorsWithDistance.sort((a, b) => a.distance - b.distance);

      // Add donors without location at the end
      const donorsNoLocation = donorsWithoutLocation.map(donor => ({
        ...donor,
        distance: null,
        isAvailable: true,
        nextAvailableDate: null,
        coordinates: null,
        hasLocation: false
      }));

      sortedDonors = [...donorsWithDistance, ...donorsNoLocation];

      console.log(`📊 Sorted ${donorsWithDistance.length} donors by distance`);

    } else {
      // If no user coordinates, just return all donors sorted by registration date (newest first)
      console.log("⚠️ No user coordinates provided, sorting by registration date");

      sortedDonors = allDonors.map(donor => {
        const isAvailable = !donor.lastDonationDate ||
          new Date(donor.lastDonationDate) < ninetyDaysAgo;

        let nextAvailableDate = null;
        if (donor.lastDonationDate && !isAvailable) {
          const lastDonation = new Date(donor.lastDonationDate);
          lastDonation.setDate(lastDonation.getDate() + 90);
          nextAvailableDate = lastDonation;
        }

        const hasLocation = donor.location &&
          donor.location.coordinates &&
          donor.location.coordinates.length === 2 &&
          donor.location.coordinates[0] !== 0 &&
          donor.location.coordinates[1] !== 0;

        return {
          ...donor,
          distance: null,
          isAvailable,
          nextAvailableDate,
          coordinates: hasLocation ? {
            lat: donor.location.coordinates[1],
            lng: donor.location.coordinates[0]
          } : null,
          hasLocation
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
    }

    // Limit results
    const limitedDonors = sortedDonors.slice(0, maxResults);

    // Format response
    const formattedDonors = limitedDonors.map(donor => ({
      id: donor._id,
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      bloodGroup: donor.bloodGroup,
      distance: donor.distance,
      isAvailable: donor.isAvailable,
      lastDonationDate: donor.lastDonationDate,
      nextAvailableDate: donor.nextAvailableDate,
      totalPoints: donor.totalPoints || 0,
      nidVerified: donor.nidVerified,
      nidStatus: donor.nidStatus,
      hasLocation: donor.hasLocation,
      coordinates: donor.coordinates,
      registrationDate: donor.createdAt
    }));

    return res.status(200).json({
      success: true,
      count: formattedDonors.length,
      totalFound: allDonors.length,
      searchCriteria: {
        bloodGroup: bloodGroup,
        userCoordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
        sortBy: lat && lng ? "distance" : "registrationDate"
      },
      donors: formattedDonors,
      statistics: {
        withLocation: donorsWithLocation.length,
        withoutLocation: donorsWithoutLocation.length,
        availableNow: formattedDonors.filter(d => d.isAvailable).length,
        recentlyDonated: formattedDonors.filter(d => !d.isAvailable).length
      }
    });

  } catch (err) {
    console.error("🔥 Search donors error:", err);
    console.error("🔥 Error stack:", err.stack);
    return res.status(500).json({
      success: false,
      msg: "Error searching donors",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// UPDATE DONOR LOCATION
const updateLocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { lat, lng, address, city, area } = req.body;

    // Validate coordinates
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        msg: "Latitude and longitude are required"
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Validate coordinate ranges
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid coordinates"
      });
    }

    // Check if user exists and is a donor
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    if (user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        msg: "Only donors can update location"
      });
    }

    // Update location
    user.location = {
      type: "Point",
      coordinates: [longitude, latitude], // [lng, lat]
      area: area || address || "",
      address: address || "",
      city: city || ""
    };

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Location updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        bloodGroup: user.bloodGroup,
        location: {
          coordinates: {
            lat: latitude,
            lng: longitude
          },
          area: user.location.area,
          address: user.location.address,
          city: user.location.city
        }
      }
    });

  } catch (err) {
    console.error("🔥 Location update error:", err);
    return res.status(500).json({
      success: false,
      msg: "Error updating location",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  searchDonors,
  updateLocation
};