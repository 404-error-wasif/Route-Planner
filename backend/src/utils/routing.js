import fetch from 'node-fetch';

// Haversine distance in km
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Try OpenRouteService first if API key present, otherwise OSRM
export async function routeDriving(from, to) {
  const orsKey = process.env.ORS_API_KEY;
  if (orsKey) {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
    const body = {
      coordinates: [[from.lon, from.lat],[to.lon, to.lat]]
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': orsKey },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('ORS error');
    const data = await res.json();
    const feat = data.features?.[0];
    const distMeters = feat?.properties?.summary?.distance || 0;
    const durSeconds = feat?.properties?.summary?.duration || 0;
    return {
      geometry: feat?.geometry,
      distance_km: distMeters/1000,
      duration_min: durSeconds/60
    };
  } else {
    // OSRM (public)
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM error');
    const data = await res.json();
    const r = data.routes?.[0];
    return {
      geometry: r?.geometry,
      distance_km: (r?.distance || 0)/1000,
      duration_min: (r?.duration || 0)/60
    };
  }
}
