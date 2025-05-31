const express = require('express');
const router = express.Router();
const { userAuth, adminAuth } = require('../middleware/auth');
const db = require('../models');

// Получить все ресурсы
router.get('/', async (req, res) => {
  try {
    const resources = await db.MultimediaResource.findAll({
      attributes: ['КодРесурса', 'Название', 'Описание', 'Тип', 'Ссылка']
    });
    // Map Russian field names to English for the API response
    const mappedResources = resources.map(resource => ({
      id: resource.КодРесурса,
      title: resource.Название,
      description: resource.Описание,
      type: resource.Тип,
      url: resource.Ссылка
    }));
    res.json(mappedResources);
  } catch (error) {
    console.error('Ошибка при получении ресурсов:', error);
    console.error('Детали ошибки:', error.message, error.stack);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить ресурс по ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await db.MultimediaResource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Ресурс не найден' });
    }
    res.json(resource);
  } catch (error) {
    console.error('Ошибка при получении ресурса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать новый ресурс (только админ)
router.post('/', userAuth, adminAuth, async (req, res) => {
  try {
    const { title, description, type, url } = req.body;
    const resource = await db.MultimediaResource.create({
      Название: title,
      Описание: description,
      Тип: type,
      Ссылка: url
    });
    res.status(201).json({
      id: resource.КодРесурса,
      title: resource.Название,
      description: resource.Описание,
      type: resource.Тип,
      url: resource.Ссылка
    });
  } catch (error) {
    console.error('Ошибка при создании ресурса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить ресурс (только админ)
router.put('/:id', userAuth, adminAuth, async (req, res) => {
  try {
    const resource = await db.MultimediaResource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Ресурс не найден' });
    }
    const { title, description, type, url } = req.body;
    await resource.update({
      Название: title,
      Описание: description,
      Тип: type,
      Ссылка: url
    });
    res.json({
      id: resource.КодРесурса,
      title: resource.Название,
      description: resource.Описание,
      type: resource.Тип,
      url: resource.Ссылка
    });
  } catch (error) {
    console.error('Ошибка при обновлении ресурса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить ресурс (только админ)
router.delete('/:id', userAuth, adminAuth, async (req, res) => {
  try {
    const resource = await db.MultimediaResource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Ресурс не найден' });
    }
    await resource.destroy();
    res.json({ message: 'Ресурс успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении ресурса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
