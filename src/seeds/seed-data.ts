import sequelize from "../database/sequelize"
import ModelSync from "../models/index"
import { Category, Product } from "../models/MarketPlace"

async function seedDatabase() {
  console.log("Initializing models...")
  ModelSync(sequelize)

  console.log("Syncing database...")
  await sequelize.sync({ force: true })

  console.log("Seeding categories...")
  const categories = await Category.bulkCreate([
    { name: "Electronics", description: "Electronic devices and accessories" },
    { name: "Clothing", description: "Apparel and fashion items" },
    { name: "Home & Kitchen", description: "Home appliances and kitchen essentials" },
  ])

  console.log("Seeding products...")
  const products = await Product.bulkCreate([
    {
      name: "Wireless Bluetooth Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 199.99,
      stock: 50,
      rating: 4.7,
      reviewCount: 856,
      featured: true,
      trending: true,
      category_id: categories[0].id,
    },
    {
      name: "Smart Watch Series 5",
      description: "Latest smartwatch with health monitoring features",
      price: 349.99,
      stock: 30,
      rating: 4.8,
      reviewCount: 1243,
      featured: true,
      trending: true,
      category_id: categories[0].id,
    },
    {
      name: "Men's Casual Jacket",
      description: "Stylish leather jacket for men",
      price: 89.99,
      stock: 100,
      rating: 4.5,
      reviewCount: 647,
      featured: true,
      trending: true,
      category_id: categories[1].id,
    },
    {
      name: "Premium Coffee Maker",
      description: "Professional coffee maker for home use",
      price: 129.99,
      stock: 45,
      rating: 4.6,
      reviewCount: 532,
      featured: true,
      trending: false,
      category_id: categories[2].id,
    },
    {
      name: "Wireless Charging Pad",
      description: "Fast wireless charger compatible with all devices",
      price: 49.99,
      stock: 200,
      rating: 4.4,
      reviewCount: 328,
      featured: false,
      trending: true,
      category_id: categories[0].id,
    },
    {
      name: "Stainless Steel Water Bottle",
      description: "Eco-friendly insulated water bottle",
      price: 34.99,
      stock: 150,
      rating: 4.7,
      reviewCount: 421,
      featured: false,
      trending: false,
      category_id: categories[2].id,
    },
    {
      name: "Smartphone Case",
      description: "Protective case for latest smartphone models",
      price: 29.99,
      stock: 300,
      rating: 4.3,
      reviewCount: 215,
      featured: false,
      trending: false,
      category_id: categories[0].id,
    },
    {
      name: "Bluetooth Speaker",
      description: "Portable speaker with rich bass and long battery life",
      price: 79.99,
      stock: 80,
      rating: 4.5,
      reviewCount: 367,
      featured: false,
      trending: true,
      category_id: categories[0].id,
    },
  ])

  console.log("Database seeded successfully!")
}

seedDatabase()
  .then(() => {
    console.log("Seed script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error seeding database:", error)
    process.exit(1)
  })
