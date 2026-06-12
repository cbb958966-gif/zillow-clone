import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const propertyTypes = ['SINGLE_FAMILY', 'CONDO', 'TOWNHOUSE', 'APARTMENT', 'MULTI_FAMILY']
const statuses = ['ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'OFF_MARKET']

const cities = [
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'San Jose', state: 'CA' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'Fresno', state: 'CA' },
  { city: 'Oakland', state: 'CA' },
  { city: 'Long Beach', state: 'CA' },
  { city: 'Bakersfield', state: 'CA' },
  { city: 'Anaheim', state: 'CA' },
  { city: 'New York', state: 'NY' },
  { city: 'Brooklyn', state: 'NY' },
  { city: 'Queens', state: 'NY' },
  { city: 'Buffalo', state: 'NY' },
  { city: 'Rochester', state: 'NY' },
  { city: 'Yonkers', state: 'NY' },
  { city: 'Syracuse', state: 'NY' },
  { city: 'Albany', state: 'NY' },
  { city: 'Miami', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Fort Lauderdale', state: 'FL' },
  { city: 'West Palm Beach', state: 'FL' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Aurora', state: 'IL' },
  { city: 'Naperville', state: 'IL' },
  { city: 'Joliet', state: 'IL' },
  { city: 'Rockford', state: 'IL' },
  { city: 'Houston', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'El Paso', state: 'TX' },
  { city: 'Arlington', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Mesa', state: 'AZ' },
  { city: 'Chandler', state: 'AZ' },
  { city: 'Scottsdale', state: 'AZ' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Spokane', state: 'WA' },
  { city: 'Tacoma', state: 'WA' },
  { city: 'Vancouver', state: 'WA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Colorado Springs', state: 'CO' },
  { city: 'Aurora', state: 'CO' },
  { city: 'Fort Collins', state: 'CO' },
  { city: 'Boston', state: 'MA' },
  { city: 'Worcester', state: 'MA' },
  { city: 'Springfield', state: 'MA' },
  { city: 'Cambridge', state: 'MA' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Augusta', state: 'GA' },
  { city: 'Savannah', state: 'GA' },
  { city: 'Columbus', state: 'GA' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Reno', state: 'NV' },
  { city: 'Henderson', state: 'NV' },
  { city: 'Portland', state: 'OR' },
  { city: 'Eugene', state: 'OR' },
  { city: 'Salem', state: 'OR' },
  { city: 'Washington', state: 'DC' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Pittsburgh', state: 'PA' },
  { city: 'Allentown', state: 'PA' },
]

const streetNames = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine St', 'Elm St', 'Park Ave', 
  'Lake Dr', 'Hill Rd', 'River Way', 'Forest Ave', 'Valley Rd', 'Sunset Blvd', 
  'Ocean Dr', 'Bay View', 'Mountain View', 'Garden St', 'Spring St', 'Summer Ave',
  'Willow Dr', 'Birch Ln', 'Walnut St', 'Chestnut Ave', 'Spruce Rd', 'Aspen Way',
  'Cherry Blossom', 'Lavender Ln', 'Rose Garden', 'Ivy Lane', 'Meadow Dr'
]

const propertyTitles = [
  'Beautiful Modern Home',
  'Cozy Family Residence',
  'Luxury Downtown Condo',
  'Spacious Townhouse',
  'Charming Bungalow',
  'Elegant Victorian Home',
  'Newly Renovated Apartment',
  'Waterfront Property',
  'Mountain View Estate',
  'Historic Downtown Loft',
  'Garden Level Condo',
  'Penthouse Suite',
  'Ranch Style Home',
  'Craftsman Bungalow',
  'Contemporary Design',
  'Traditional Colonial',
  'Mediterranean Villa',
  'Starter Home',
  'Investment Property',
  'Income Generating Duplex',
]

const descriptions = [
  'This stunning property features modern amenities and an open floor plan. Perfect for families or professionals seeking comfort and convenience.',
  'Charming home with hardwood floors throughout. Recently updated kitchen and bathrooms. Great neighborhood with excellent schools.',
  'Spacious living areas with natural light. Updated appliances and fixtures. Close to shopping, dining, and entertainment.',
  'Beautiful landscaping with mature trees. Large backyard perfect for entertaining. Two-car garage with workshop space.',
  'Move-in ready with fresh paint and new carpeting. Modern kitchen with granite countertops and stainless steel appliances.',
  'Prime location near downtown. Walking distance to parks and public transportation. This property won\'t last long!',
  'Open concept living with high ceilings. Chef\'s kitchen with island. Primary suite with spa-like bathroom.',
  'Quiet residential street. Friendly neighbors. Community features pool and clubhouse. HOA covers lawn maintenance.',
  'Corner lot with extra parking. Guest suite perfect for in-laws or rental income. Home office space with fiber internet.',
  'Energy efficient with solar panels. Low utility bills. Smart home features throughout.EV charging station in garage.',
]

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function generateRandomProperty(index: number) {
  const location = getRandomElement(cities)
  const streetNum = getRandomNumber(100, 9999)
  const streetName = getRandomElement(streetNames)
  const zipCode = getRandomNumber(10000, 99999).toString()
  
  return {
    title: `${getRandomElement(propertyTitles)} #${index + 1}`,
    description: getRandomElement(descriptions),
    price: getRandomNumber(150000, 5000000),
    address: `${streetNum} ${streetName}`,
    city: location.city,
    state: location.state,
    zipCode: zipCode,
    beds: getRandomNumber(1, 8),
    baths: getRandomNumber(1, 6),
    sqft: getRandomNumber(500, 8000),
    lotSize: getRandomFloat(0.1, 5),
    yearBuilt: getRandomNumber(1950, 2024),
    propertyType: getRandomElement(propertyTypes),
    status: getRandomElement(statuses),
    lat: getRandomFloat(25.0, 48.0),
    lng: getRandomFloat(-125.0, -70.0),
  }
}

async function main() {
  console.log('Starting to generate 10,000 properties...')
  
  // Create admin user if not exists
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    })
    console.log('Created admin user')
  }

  const batchSize = 100
  const totalProperties = 10000
  
  for (let i = 0; i < totalProperties; i += batchSize) {
    const properties = []
    
    for (let j = 0; j < batchSize && i + j < totalProperties; j++) {
      properties.push(generateRandomProperty(i + j))
    }
    
    await prisma.property.createMany({
      data: properties
    })
    
    console.log(`Created ${i + batchSize} properties...`)
  }
  
  console.log(`Successfully created ${totalProperties} properties!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
