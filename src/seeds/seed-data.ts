import sequelize from "../database/sequelize"
import ModelSync from "../models/index"
import { Category, Product } from "../models/MarketPlace"
import { User, Role, UserProfile, AccessRule, ActionLog } from "../models/User";
import { File, Notification, Config } from "../models/System";
import { Address, PaymentMethod, ProductImage, Cart, CartItem, Order, OrderItem, OrderTracking, Favorite, SearchHistory, AppSetting, ChappaPayment } from "../models/MarketPlace";
import { NotificationCategory, NotificationType, UserType } from "../utilities/constants/Constants";

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
  
  // Seed Role
  const roles = await Role.bulkCreate([
    { name: "Admin", description: "Administrator role", type: "System", access_rules: [] },
    { name: "User", description: "Regular user role", type: "User", access_rules: [] }
  ]);

  // Seed User
  const users = await User.bulkCreate([
    { first_name: "admin", last_name: "admin", email: "admin@example.com", password: "admin123", role_id: roles[0].id, last_used_key: roles[0].id, type: UserType.ADMIN },
    { first_name: "user1", last_name: "user1", email: "user1@example.com", password: "user123", role_id: roles[1].id, last_used_key: roles[1].id, type: UserType.USER },
    { first_name: "user2", last_name: "user2", email: "user2@example.com", password: "user123", role_id: roles[1].id, last_used_key: roles[1].id, type: UserType.USER }
  ]);

  // Seed UserProfile
  await UserProfile.bulkCreate([
    { user_id: users[0].id, bio: "Admin profile", website_url: "http://admin.com", social_media_links: ["http://twitter.com/admin"], address: "123 Admin St", city: "Admin City", country: "Admin Country", date_of_birth: new Date("1990-01-01"), gender: "Male", time_zone: "UTC", preferred_contact_method: "email", is_active: true, last_activity_time: new Date() },
    { user_id: users[1].id, bio: "User 1 profile", website_url: "http://user1.com", social_media_links: ["http://twitter.com/user1"], address: "123 User St", city: "User City", country: "User Country", date_of_birth: new Date("1995-01-01"), gender: "Female", time_zone: "UTC", preferred_contact_method: "email", is_active: true, last_activity_time: new Date() },
    { user_id: users[2].id, bio: "User 2 profile", website_url: "http://user2.com", social_media_links: ["http://twitter.com/user2"], address: "123 User St", city: "User City", country: "User Country", date_of_birth: new Date("1998-01-01"), gender: "Male", time_zone: "UTC", preferred_contact_method: "email", is_active: true, last_activity_time: new Date() }
  ]);

  // Seed AccessRule
  await AccessRule.bulkCreate([
    { name: "create_user", description: "Can create users", group: "user", type: "System" },
    { name: "edit_user", description: "Can edit users", group: "user", type: "User" },
    { name: "delete_user", description: "Can delete users", group: "user", type: "System" }
  ]);

  // Seed ActionLog
  await ActionLog.bulkCreate([
    { action: "create", object: "user", description: "Created user", prev_data: {}, new_data: { username: "user1", email: "user1@example.com" } },
    { action: "update", object: "user", description: "Updated user", prev_data: { username: "user1" }, new_data: { username: "user1_updated" } }
  ]);

  // Seed File
  const files = await File.bulkCreate([
    { name: "file1.txt", type: "text/plain", size: 1024, path: "/files/file1.txt" },
    { name: "file2.txt", type: "text/plain", size: 2048, path: "/files/file2.txt" }
  ]);

  // Seed Notification
  await Notification.bulkCreate([
    { notification_title: "Welcome", notification_body: "Welcome to the platform", notification_type: NotificationType.INFO, notification_category: NotificationCategory.INFO, is_read: false, user_id: users[0].id, notification_date: new Date(), notification_url: "/welcome" },
    { notification_title: "New Message", notification_body: "You have a new message", notification_type: NotificationType.WARNING, notification_category: NotificationCategory.WARNING, is_read: false, user_id: users[1].id, notification_date: new Date(), notification_url: "/messages" }
  ]);

  // Seed Config
  await Config.bulkCreate([
    { key: "site_name", object_type: "system", type: "string", value: "My Site" },
    { key: "site_description", object_type: "system", type: "string", value: "My Site Description" }
  ]);

  // Seed Address
  const addresses = await Address.bulkCreate([
    { user_id: users[0].id, name: "Home", address_line1: "123 Admin St", city: "Admin City", state: "Admin State", postal_code: "12345", country: "Admin Country", is_default: true },
    { user_id: users[1].id, name: "Home", address_line1: "123 User St", city: "User City", state: "User State", postal_code: "54321", country: "User Country", is_default: true }
  ]);

  // Seed PaymentMethod
  const paymentMethods = await PaymentMethod.bulkCreate([
    { user_id: users[0].id, type: "credit_card", provider: "Visa", account_number: "1234", expiry_date: "12/25", is_default: true, address_id: addresses[0].id },
    { user_id: users[1].id, type: "credit_card", provider: "Mastercard", account_number: "5678", expiry_date: "12/25", is_default: true, address_id: addresses[1].id }
  ]);

  // Seed ProductImage
  await ProductImage.bulkCreate([
    { product_id: products[0].id, file_id: files[0].id, is_primary: true },
    { product_id: products[1].id, file_id: files[1].id, is_primary: true }
  ]);

  // Seed Cart
  const carts = await Cart.bulkCreate([
    { user_id: users[0].id },
    { user_id: users[1].id }
  ]);

  // Seed CartItem
  await CartItem.bulkCreate([
    { cart_id: carts[0].id, product_id: products[0].id, quantity: 1 },
    { cart_id: carts[1].id, product_id: products[1].id, quantity: 2 }
  ]);

  // Seed Order
  const orders = await Order.bulkCreate([
    { user_id: users[0].id, order_number: "ORD001", status: "processing", address_id: addresses[0].id, payment_method_id: paymentMethods[0].id, subtotal: 199.99, shipping_fee: 10, tax: 20, total: 229.99, estimated_delivery: new Date() },
    { user_id: users[1].id, order_number: "ORD002", status: "shipped", address_id: addresses[1].id, payment_method_id: paymentMethods[1].id, subtotal: 349.99, shipping_fee: 10, tax: 36, total: 395.99, estimated_delivery: new Date() }
  ]);

  // Seed OrderItem
  await OrderItem.bulkCreate([
    { order_id: orders[0].id, product_id: products[0].id, quantity: 1, price: 199.99 },
    { order_id: orders[1].id, product_id: products[1].id, quantity: 1, price: 349.99 }
  ]);

  // Seed OrderTracking
  await OrderTracking.bulkCreate([
    { order_id: orders[0].id, status: "processing", description: "Order is being processed", location: "Warehouse", latitude: 0, longitude: 0, timestamp: new Date() },
    { order_id: orders[1].id, status: "shipped", description: "Order has been shipped", location: "Shipping Center", latitude: 0, longitude: 0, timestamp: new Date() }
  ]);

  // Seed Favorite
  await Favorite.bulkCreate([
    { user_id: users[0].id, product_id: products[0].id },
    { user_id: users[1].id, product_id: products[1].id }
  ]);

  // Seed SearchHistory
  await SearchHistory.bulkCreate([
    { user_id: users[0].id, query: "headphones", last_searched: new Date(), search_count: 1 },
    { user_id: users[1].id, query: "smartwatch", last_searched: new Date(), search_count: 1 }
  ]);

  // Seed AppSetting
  await AppSetting.bulkCreate([
    { user_id: users[0].id, language: "en", theme: "light", notifications_enabled: true, email_notifications: true, push_notifications: true },
    { user_id: users[1].id, language: "en", theme: "dark", notifications_enabled: true, email_notifications: true, push_notifications: true }
  ]);

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
