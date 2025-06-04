import { Sequelize } from "sequelize";
// import first
import UserModels from "./User";

import SystemModels from "./System";
import ListingModels from "./Listing";

export default (sequelize: Sequelize) => {
  UserModels(sequelize);
  SystemModels(sequelize);
  ListingModels(sequelize);
};
