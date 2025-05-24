'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Пользователи', {
      КодПользователя: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      Имя: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Фамилия: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      ЭлектроннаяПочта: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      ХэшПароля: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      Роль: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Пользователь'
      },
      Телефон: {
        type: Sequelize.STRING(20),
        allowNull: true
      }
    });

    // Добавляем DEFAULT для Роли
    await queryInterface.sequelize.query(`
      ALTER TABLE [Пользователи] 
        ADD CONSTRAINT DF_Роль_Default DEFAULT N'Пользователь' FOR [Роль];
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Пользователи');
    await queryInterface.sequelize.query(`
      ALTER TABLE [Пользователи] 
        DROP CONSTRAINT DF_Роль_Default;
    `);
  }
};