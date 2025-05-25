const app = require('./app');
const sequelize = require('./config/database');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    console.log('Подключение к базе данных установлено успешно.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Ошибка при подключении к базе данных:', err);
  });