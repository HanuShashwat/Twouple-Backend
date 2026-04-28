const axios = require('axios');

exports.getCoordinates = async (cityName) => {
  try {
    // Note: In production, you would use Google Maps Geocoding API or Mapbox.
    // For now, we use Nominatim (OpenStreetMap) because it's free and requires no API key.
    
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: cityName,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'TwoupleApp/1.0' // OpenStreetMap requires a User-Agent
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
        formatted_name: response.data[0].display_name
      };
    }

    throw new Error('Could not find coordinates for this location.');
  } catch (error) {
    console.error('[Geocoding Error]:', error.message);
    throw error;
  }
};