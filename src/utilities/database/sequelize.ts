import { Sequelize } from 'sequelize';
import dbConfig from '../../config/database';
import ModelSync from "../../models/index";
import { Transaction } from "sequelize";
import LogService from "../../services/Log/Log.service";

let sequelize: Sequelize;

if (dbConfig.url) {
  // Using connection URL (for Neon DB)
  sequelize = new Sequelize(dbConfig.url, {
    dialect: 'postgres',
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging
  });
} else {
  // Using individual connection parameters (for local DB)
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: 'postgres',
      dialectOptions: dbConfig.dialectOptions,
      logging: dbConfig.logging
    }
  );
}

export default () => {
  return new Promise((resolve, reject) => {
    ModelSync(sequelize);

    sequelize
      .sync({ logging: true, force: false, alter: false })
      .then(() => {
        LogService.LogInfo(
          "Database Connection has been established successfully."
        );
        resolve(true);
      })
      .catch((error: any) => {
        LogService.LogError(`Database connection error: ${error}`);
        reject(false);
      });
  });
};

export const createTransaction = (): Promise<Transaction> => {
  return new Promise(async (resolve, reject) => {
    sequelize
      .transaction()
      .then((transaction) => resolve(transaction))
      .catch((error) => reject(error));
  });
};

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    
    // If using URL connection and it fails, try local connection
    if (dbConfig.url) {
      console.log('Attempting to connect to local database...');
      
      try {
        const localSequelize = new Sequelize(
          dbConfig.database,
          dbConfig.username,
          dbConfig.password,
          {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: 'postgres',
            logging: false
          }
        );
        
        await localSequelize.authenticate();
        console.log('Connected to local database successfully.');
        return true;
      } catch (localError) {
        console.error('Local database connection failed too:', localError);
        return false;
      }
    }
    
    return false;
  }
};
