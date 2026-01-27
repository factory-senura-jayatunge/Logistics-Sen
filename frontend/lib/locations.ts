export const locationCoordinates: Record<string, [number, number]> = {
  "Los Angeles, CA": [34.0522, -118.2437],
  "New York, NY": [40.7128, -74.006],
  "Chicago, IL": [41.8781, -87.6298],
  "Houston, TX": [29.7604, -95.3698],
  "Phoenix, AZ": [33.4484, -112.074],
  "Philadelphia, PA": [39.9526, -75.1652],
  "San Antonio, TX": [29.4241, -98.4936],
  "San Diego, CA": [32.7157, -117.1611],
  "Dallas, TX": [32.7767, -96.797],
  "San Jose, CA": [37.3382, -121.8863],
  "Austin, TX": [30.2672, -97.7431],
  "Jacksonville, FL": [30.3322, -81.6557],
  "Fort Worth, TX": [32.7555, -97.3308],
  "Columbus, OH": [39.9612, -82.9988],
  "Charlotte, NC": [35.2271, -80.8431],
  "San Francisco, CA": [37.7749, -122.4194],
  "Indianapolis, IN": [39.7684, -86.1581],
  "Seattle, WA": [47.6062, -122.3321],
  "Denver, CO": [39.7392, -104.9903],
  "Washington, DC": [38.9072, -77.0369],
  "Boston, MA": [42.3601, -71.0589],
  "El Paso, TX": [31.7619, -106.485],
  "Nashville, TN": [36.1627, -86.7816],
  "Detroit, MI": [42.3314, -83.0458],
  "Portland, OR": [45.5152, -122.6784],
  "Memphis, TN": [35.1495, -90.049],
  "Oklahoma City, OK": [35.4676, -97.5164],
  "Las Vegas, NV": [36.1699, -115.1398],
  "Louisville, KY": [38.2527, -85.7585],
  "Baltimore, MD": [39.2904, -76.6122],
  "Milwaukee, WI": [43.0389, -87.9065],
  "Albuquerque, NM": [35.0844, -106.6504],
  "Tucson, AZ": [32.2226, -110.9747],
  "Fresno, CA": [36.7378, -119.7871],
  "Sacramento, CA": [38.5816, -121.4944],
  "Kansas City, MO": [39.0997, -94.5786],
  "Atlanta, GA": [33.749, -84.388],
  "Miami, FL": [25.7617, -80.1918],
  "Raleigh, NC": [35.7796, -78.6382],
  "Omaha, NE": [41.2565, -95.9345],
  "Minneapolis, MN": [44.9778, -93.265],
  "Cleveland, OH": [41.4993, -81.6944],
  "Tampa, FL": [27.9506, -82.4572],
  "St. Louis, MO": [38.627, -90.1994],
  "Pittsburgh, PA": [40.4406, -79.9959],
  "Cincinnati, OH": [39.1031, -84.512],
  "Orlando, FL": [28.5383, -81.3792],
  "New Orleans, LA": [29.9511, -90.0715],
  "Salt Lake City, UT": [40.7608, -111.891],
}

export const transportLocations: Record<string, [number, number]> = {
  "Interstate 95, NJ": [40.2171, -74.7429],
  "Highway 66, TX": [35.222, -101.8313],
  "I-10, CA": [33.9425, -117.4297],
  "Atlantic Ocean": [30.0, -70.0],
  "Pacific Ocean": [35.0, -140.0],
  "Port of Miami": [25.7742, -80.167],
  "Port of Los Angeles": [33.7361, -118.265],
  "Port of Seattle": [47.5815, -122.355],
  "Over Pacific": [37.0, -150.0],
  "JFK Airport": [40.6413, -73.7781],
  "LAX Airport": [33.9416, -118.4085],
  "ORD Airport": [41.9742, -87.9073],
  Nebraska: [41.4925, -99.9018],
  Kansas: [39.0119, -98.4842],
  "Chicago Rail Yard": [41.8525, -87.6514],
  "LA Intermodal": [33.97, -118.24],
  "Houston Terminal": [29.7752, -95.3103],
  "Brooklyn, NY": [40.6782, -73.9442],
}

export function getCoordinatesForLocation(location: string): [number, number] | null {
  if (locationCoordinates[location]) {
    return locationCoordinates[location]
  }
  if (transportLocations[location]) {
    return transportLocations[location]
  }
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (location.toLowerCase().includes(key.toLowerCase().split(",")[0])) {
      return coords
    }
  }
  for (const [key, coords] of Object.entries(transportLocations)) {
    if (location.toLowerCase().includes(key.toLowerCase().split(",")[0].split(" ")[0])) {
      return coords
    }
  }
  return null
}

export function interpolateRoute(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const route: [number, number][] = [start]
  const numPoints = 20

  for (let i = 1; i < numPoints; i++) {
    const t = i / numPoints
    route.push([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t])
  }

  route.push(end)
  return route
}
