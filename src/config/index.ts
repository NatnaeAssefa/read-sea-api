import { AccessType, UserType } from "../utilities/constants/Constants";

export const DB_TYPES = {
  MYSQL: "mysql",
  POSTGRES: "postgres",
};

const getDBType = (type?: string) => {
  if (type) {
    if (Object.values(DB_TYPES).indexOf(type) !== -1) return type;
  }
  return DB_TYPES.POSTGRES;
};

export const env: any = {
  // Database
  DB_TYPE: getDBType(process.env.DB_TYPE),
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || "5432",
  DB_NAME: process.env.DB_NAME || "test",
  DB_USERNAME: process.env.DB_USERNAME || "test",
  DB_PASSWORD: process.env.DB_PASSWORD || "test",

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || "6379",

  // Auth
  AUTH_KEY: process.env.AUTH_KEY || "sample_key",

  AUTH_KEY_EXPIRY: process.env.AUTH_KEY_EXPIRY || "6h",

  // Server
  PORT: process.env.PORT || 3000,
  PRODUCTION: process.env.PRODUCTION === "true",

  // Swagger
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === "true",

  // Email
  SMTP_HOST: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  SMTP_PORT: process.env.SMTP_PORT || "587",
  SMTP_USER: process.env.SMTP_USER || "test",
  SMTP_PASS: process.env.SMTP_PASS || "password",

  // System
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",
  VERIFICATION_EXPIRY: process.env.VERIFICATION_EXPIRY || 24, // Hours
  RECOVERY_EXPIRY: process.env.RECOVERY_EXPIRY || 24, // Hours

  // Company
  COMPANY_NAME: process.env.COMPANY_NAME || "Boingo AI",
  COMPANY_EMAIL: process.env.SMTP_USER || "support@boingo.ai",

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@boingo.ai",

  ROOT_DIR: "",

  GOOGLE_CERTS_URL: process.env.GOOGLE_CERTS_URL || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_AUTH_URL: process.env.GOOGLE_AUTH_URL || "",
  GOOGLE_TOKEN_URL: process.env.GOOGLE_TOKEN_URL || "",
  GOOGLE_USER_INFO_URL: process.env.GOOGLE_USER_INFO_URL || "",

  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || "",
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || "",
  
  WATER_MARK_IMAGE: process.env.WATER_MARK_IMAGE || "",
  WATER_MARK_IMAGE_DARK: process.env.WATER_MARK_IMAGE_DARK || "",
};
export const constants: any = {
  SYSTEM_CONFIG_KEY: "System Init",
  SYSTEM_CONFIG_TYPE: "string",
  SYSTEM_CONFIG_VALUE: "True",
  BASE_FIRST_NAME: "Bedri",
  BASE_LAST_NAME: "Bahru",
  BASE_PHONE_NUMBER: "251930538714",
  BASE_ROLE: "Super Admin",
  BASE_ROLE_ID: "e48f7ed1-db16-4511-be6a-87ef32aab99d",
  BASE_TYPE: UserType.SYSTEM,
  BASE_EMAIL: "bahrubedri@gmail.com",
  BASE_PASSWORD: "1q2w3e4r5t6y7u8i9o0p",

  BROKER_ROLE: "Broker Role",
};

export type AccessRules = {
  group: string;
  rules: { name: string; type: string }[];
};

export const access_rules: AccessRules[] = [
  //  System
  {
    group: "Global",
    rules: [{ name: "access_paranoid", type: AccessType.SYSTEM }],
  },
  {
    group: "Access Log",
    rules: [
      { name: "read_action_log", type: AccessType.SYSTEM },
      { name: "write_action_log", type: AccessType.SYSTEM },
      { name: "delete_action_log", type: AccessType.SYSTEM },
    ],
  },
  {
    group: "Config",
    rules: [
      { name: "read_config", type: AccessType.SYSTEM },
      { name: "write_config", type: AccessType.SYSTEM },
      { name: "delete_config", type: AccessType.SYSTEM },
    ],
  },
  // Shared
  {
    group: "File",
    rules: [
      { name: "read_file", type: AccessType.BROKER },
      { name: "write_file", type: AccessType.BROKER },
      { name: "delete_file", type: AccessType.SYSTEM },
    ],
  },
  {
    group: "Access Rule",
    rules: [
      { name: "read_access_rule", type: AccessType.BROKER },
      { name: "write_access_rule", type: AccessType.SYSTEM },
      { name: "delete_access_rule", type: AccessType.SYSTEM },
    ],
  },
  {
    group: "Role",
    rules: [
      { name: "read_role", type: AccessType.BROKER },
      { name: "write_role", type: AccessType.BROKER },
      { name: "delete_role", type: AccessType.BROKER },
    ],
  },
  {
    group: "User",
    rules: [
      { name: "read_user", type: AccessType.BROKER },
      { name: "revoke_user_token", type: AccessType.SYSTEM },
      { name: "change_user_password", type: AccessType.SYSTEM },
      { name: "write_user", type: AccessType.BROKER },
      { name: "delete_user", type: AccessType.SYSTEM },
    ],
  },
  // Marketplace rules
  {
    group: "Product",
    rules: [
      { name: "read_product", type: AccessType.USER },
      { name: "write_product", type: AccessType.BROKER },
      { name: "delete_product", type: AccessType.BROKER },
      { name: "approve_product", type: AccessType.SYSTEM },
    ],
  },
  {
    group: "Order",
    rules: [
      { name: "read_order", type: AccessType.USER },
      { name: "write_order", type: AccessType.USER },
      { name: "manage_order", type: AccessType.BROKER },
      { name: "cancel_order", type: AccessType.BROKER },
    ],
  },
  {
    group: "Category",
    rules: [
      { name: "read_category", type: AccessType.USER },
      { name: "write_category", type: AccessType.SYSTEM },
      { name: "delete_category", type: AccessType.SYSTEM },
    ],
  },
  {
    group: "Analytics",
    rules: [
      { name: "view_analytics", type: AccessType.BROKER },
      { name: "export_analytics", type: AccessType.SYSTEM },
    ],
  },
];

export default { env, constants, access_rules };
