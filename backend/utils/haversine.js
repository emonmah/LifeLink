// utils/haversine.js - UPDATED
function toRad(deg) {
  return deg * Math.PI / 180;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  
  console.log(`Calculating distance: (${lat1}, ${lon1}) to (${lat2}, ${lon2})`);
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  console.log(`Distance calculated: ${distance} km`);
  
  return distance;
}

// Test the function
console.log("Test haversine distance (Dhaka to Chittagong):", 
  haversineDistance(23.8103, 90.4125, 22.3569, 91.7832));

module.exports = { haversineDistance, toRad };