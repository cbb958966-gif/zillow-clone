import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const US_CITY_COORDINATES: Record<string, [number, number]> = {
  'New York': [40.7128, -74.0060],
  'Los Angeles': [34.0522, -118.2437],
  'Chicago': [41.8781, -87.6298],
  'Houston': [29.7604, -95.3698],
  'Phoenix': [33.4484, -112.0740],
  'Philadelphia': [39.9526, -75.1652],
  'San Antonio': [29.4241, -98.4936],
  'San Diego': [32.7157, -117.1611],
  'Dallas': [32.7767, -96.7970],
  'San Jose': [37.3382, -121.8863],
  'Austin': [30.2672, -97.7431],
  'Jacksonville': [30.3322, -81.6557],
  'San Francisco': [37.7749, -122.4194],
  'Columbus': [39.9612, -82.9988],
  'Indianapolis': [39.7684, -86.1581],
  'Fort Worth': [32.7555, -97.3308],
  'Charlotte': [35.2271, -80.8431],
  'Seattle': [47.6062, -122.3321],
  'Denver': [39.7392, -104.9903],
  'Boston': [42.3601, -71.0589],
  'Nashville': [36.1627, -86.7816],
  'Baltimore': [39.2904, -76.6122],
  'Oklahoma City': [35.4676, -97.5164],
  'Louisville': [38.2527, -85.7585],
  'Portland': [45.5152, -122.6784],
  'Las Vegas': [36.1699, -115.1398],
  'Milwaukee': [43.0389, -87.9065],
  'Albuquerque': [35.0844, -106.6504],
  'Tucson': [32.2226, -110.9747],
  'Fresno': [36.7378, -119.7871],
  'Sacramento': [38.5816, -121.4944],
  'Mesa': [33.4152, -111.8315],
  'Kansas City': [39.0997, -94.5786],
  'Atlanta': [33.7490, -84.3880],
  'Miami': [25.7617, -80.1918],
  'Cleveland': [41.4993, -81.6944],
  'Minneapolis': [44.9778, -93.2650],
  'New Orleans': [29.9511, -90.0715],
  'Raleigh': [35.7796, -78.6382],
  'Virginia Beach': [36.8529, -75.9780],
  'Omaha': [41.2565, -95.9345],
  'Oakland': [37.8044, -122.2712],
  'Tulsa': [36.1540, -95.9928],
  'Tampa': [27.9506, -82.4572],
  'Arlington': [32.7357, -97.1081],
  'Newark': [40.7357, -74.1724],
  'Buffalo': [42.8864, -78.8784],
  'St. Louis': [38.6270, -90.1994],
  'Riverside': [33.9533, -117.3962],
  'St. Paul': [44.9537, -93.0900],
  'Anchorage': [61.2181, -149.9003],
}

const STATE_COORDINATES: Record<string, [number, number]> = {
  'NY': [40.7128, -74.0060],
  'CA': [36.7783, -119.4179],
  'IL': [40.6331, -89.3985],
  'TX': [31.9686, -99.9018],
  'AZ': [34.0489, -111.0937],
  'PA': [41.2033, -77.1945],
  'OH': [40.4173, -82.9071],
  'FL': [27.6648, -81.5158],
  'GA': [32.1656, -82.9001],
  'NC': [35.7596, -79.0193],
  'MI': [44.3148, -85.6024],
  'WA': [47.7511, -120.7401],
  'CO': [39.5501, -105.7821],
  'MA': [42.4072, -71.3824],
  'TN': [35.5175, -86.5804],
  'MD': [39.0458, -76.6413],
  'OK': [35.0078, -97.0929],
  'KY': [37.8393, -84.2700],
  'OR': [43.8041, -120.5542],
  'NV': [38.8026, -116.4194],
  'WI': [43.7844, -88.7879],
  'NM': [34.5199, -105.8701],
  'MN': [46.7296, -94.6859],
  'SC': [33.8361, -81.1637],
  'AL': [32.3182, -86.9023],
  'LA': [30.9843, -91.9623],
  'AR': [35.2010, -91.8318],
  'UT': [39.3210, -111.0937],
  'IA': [41.8780, -93.0977],
  'MS': [32.3547, -89.3985],
  'KS': [39.0119, -98.4842],
}

function getCoordinates(city: string, state: string): [number, number] {
  const cityKey = city.trim()
  const stateKey = state.trim().toUpperCase()
  
  if (US_CITY_COORDINATES[cityKey]) {
    const baseCoords = US_CITY_COORDINATES[cityKey]
    return [
      baseCoords[0] + (Math.random() - 0.5) * 0.1,
      baseCoords[1] + (Math.random() - 0.5) * 0.1
    ]
  }
  
  if (STATE_COORDINATES[stateKey]) {
    const baseCoords = STATE_COORDINATES[stateKey]
    return [
      baseCoords[0] + (Math.random() - 0.5) * 2,
      baseCoords[1] + (Math.random() - 0.5) * 2
    ]
  }
  
  return [
    39.8283 + (Math.random() - 0.5) * 10,
    -98.5795 + (Math.random() - 0.5) * 20
  ]
}

async function addCoordinates() {
  console.log('Adding coordinates to properties...')
  
  const properties = await prisma.property.findMany({
    where: {
      OR: [
        { lat: null },
        { lng: null }
      ]
    },
    select: {
      id: true,
      city: true,
      state: true
    },
    take: 10000
  })
  
  console.log(`Found ${properties.length} properties without coordinates`)
  
  let updated = 0
  for (const property of properties) {
    const [lat, lng] = getCoordinates(property.city, property.state)
    
    await prisma.property.update({
      where: { id: property.id },
      data: { lat, lng }
    })
    
    updated++
    if (updated % 500 === 0) {
      console.log(`Updated ${updated} properties`)
    }
  }
  
  console.log(`Done! Updated ${updated} properties with coordinates`)
  
  const withCoords = await prisma.property.count({
    where: {
      AND: [
        { lat: { not: null } },
        { lng: { not: null } }
      ]
    }
  })
  console.log(`Total properties with coordinates: ${withCoords}`)
}

addCoordinates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
