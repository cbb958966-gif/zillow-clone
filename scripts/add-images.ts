import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PROPERTY_IMAGE_SOURCES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80',
  'https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?w=800&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
  'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&q=80',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
  'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753438938-a9a27216b4f5?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80',
  'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
]

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomImages(count: number): string[] {
  const images: string[] = []
  const usedIndices = new Set<number>()
  
  for (let i = 0; i < count; i++) {
    let index: number
    do {
      index = getRandomInt(0, PROPERTY_IMAGE_SOURCES.length - 1)
    } while (usedIndices.has(index) && usedIndices.size < PROPERTY_IMAGE_SOURCES.length)
    
    usedIndices.add(index)
    images.push(PROPERTY_IMAGE_SOURCES[index])
  }
  
  return images
}

async function addImagesToProperties() {
  console.log('Starting to add images to properties...')
  
  const totalProperties = await prisma.property.count()
  console.log(`Total properties: ${totalProperties}`)
  
  const existingImages = await prisma.propertyImage.count()
  console.log(`Existing images: ${existingImages}`)

  // Delete all existing property images first to re-seed fresh
  await prisma.propertyImage.deleteMany({})
  console.log('Deleted all existing images')
  
  const propertiesWithoutImages = await prisma.property.findMany({
    take: 10000,
    select: { id: true }
  })
  
  console.log(`Properties to add images to: ${propertiesWithoutImages.length}`)
  
  let processed = 0
  
  for (const property of propertiesWithoutImages) {
    try {
      const numImages = getRandomInt(3, 8)
      const images = getRandomImages(numImages)
      
      for (let i = 0; i < images.length; i++) {
        await prisma.propertyImage.create({
          data: {
            propertyId: property.id,
            url: images[i],
            isPrimary: i === 0,
            featured: i === 0,
            order: i
          }
        })
      }
      
      processed++
      if (processed % 100 === 0) {
        console.log(`Processed ${processed} / ${propertiesWithoutImages.length} properties`)
      }
    } catch (error) {
      console.error(`Error processing property ${property.id}:`, error)
    }
  }
  
  const finalImageCount = await prisma.propertyImage.count()
  console.log(`Final image count: ${finalImageCount}`)
  
  const propertiesWithImages = await prisma.property.count({
    where: {
      images: { some: {} }
    }
  })
  console.log(`Properties with at least one image: ${propertiesWithImages}`)
}

addImagesToProperties()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
