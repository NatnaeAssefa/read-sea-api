// Configuration for database connections
const dbConfig = {
  // Primary connection (Neon DB)
  url: "postgresql://neondb_owner:npg_5ZeuWBXl3bVQ@ep-spring-dream-a8vkj3al-pooler.eastus2.azure.neon.tech/marketplace?sslmode=require",
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  
  // Connection pool settings
  pool: {
    max: 5,           // Maximum number of connections
    min: 0,           // Minimum number of connections
    acquire: 60000,   // Maximum time (ms) to acquire a connection
    idle: 10000,      // Maximum time (ms) a connection can be idle
    evict: 1000       // How frequently to check for idle connections
  },
  
  // Retry logic
  retry: {
    max: 3           // Maximum retry attempts
  },

  // Local DB fallback config
  database: process.env.LOCAL_DB_NAME || "local_db",
  username: process.env.LOCAL_DB_USER || "postgres",
  password: process.env.LOCAL_DB_PASSWORD || "postgres", 
  host: process.env.LOCAL_DB_HOST || "localhost",
  port: parseInt(process.env.LOCAL_DB_PORT || "5432"),
};

export default dbConfig; 