const app = require('./app');
const sequelize = require('./config/database');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    console.log('Подключение к базе данных установлено успешно.');
    // Запуск миграций
    exec('npx sequelize-cli db:migrate', (err, stdout, stderr) => {
      if (err) {
        console.error('Ошибка миграций:', err);
        return;
      }
      console.log('Миграции выполнены успешно');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    });
  })
  .catch(err => {
    console.error('Ошибка при подключении к базе данных:', err);
  });