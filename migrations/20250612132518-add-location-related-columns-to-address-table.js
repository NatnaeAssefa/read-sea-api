'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First ensure PostGIS extension is installed
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    
    // Add columns initially allowing nulls
    await queryInterface.addColumn('addresses', 'location', {
      type: Sequelize.GEOGRAPHY('POINT', 4326),
      allowNull: true, // Allow nulls initially
    });
    
    await queryInterface.addColumn('addresses', 'lat', {
      type: Sequelize.DOUBLE,
      allowNull: true, // Allow nulls initially
    });
    
    await queryInterface.addColumn('addresses', 'lng', {
      type: Sequelize.DOUBLE,
      allowNull: true, // Allow nulls initially
    });
    
    // Update existing rows with default values
    await queryInterface.sequelize.query(`
      UPDATE addresses 
      SET 
        lat = 0, 
        lng = 0, 
        location = ST_SetSRID(ST_MakePoint(0, 0), 4326)::geography 
      WHERE 
        location IS NULL
    `);
    
    // Now make columns non-nullable
    await queryInterface.changeColumn('addresses', 'location', {
      type: Sequelize.GEOGRAPHY('POINT', 4326),
      allowNull: false,
    });
    
    await queryInterface.changeColumn('addresses', 'lat', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });
    
    await queryInterface.changeColumn('addresses', 'lng', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });
    
    // Create spatial index for faster geospatial queries
    await queryInterface.sequelize.query(
      'CREATE INDEX idx_addresses_location ON addresses USING GIST(location);'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('addresses', 'location');
    await queryInterface.removeColumn('addresses', 'lat');
    await queryInterface.removeColumn('addresses', 'lng');
  }
};