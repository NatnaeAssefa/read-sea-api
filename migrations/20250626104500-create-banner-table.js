'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop table if it exists to ensure clean creation
    await queryInterface.dropTable('banners').catch(() => {
      // Ignore error if table doesn't exist
    });

    await queryInterface.createTable('banners', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "Banner title displayed to users",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Optional banner description",
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: "URL or path to the banner image",
      },
      link_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: "URL to redirect when banner is clicked",
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Banner becomes active from this date",
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Banner becomes inactive after this date",
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Higher numbers indicate higher priority for display order",
      },
      target_audience: {
        type: Sequelize.ENUM,
        values: ['ALL', 'GUEST', 'REGISTERED'],
        allowNull: false,
        defaultValue: 'ALL',
        comment: "Target audience for the banner",
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive', 'Pending', 'Blocked', 'Archived'),
        allowNull: false,
        defaultValue: 'Active',
        comment: "Banner status",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Create indexes for better performance
    await queryInterface.addIndex('banners', ['status']);
    await queryInterface.addIndex('banners', ['start_date', 'end_date']);
    await queryInterface.addIndex('banners', ['target_audience']);
    await queryInterface.addIndex('banners', ['priority']);
    await queryInterface.addIndex('banners', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('banners');
  }
};
