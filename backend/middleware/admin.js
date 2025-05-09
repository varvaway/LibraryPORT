module.exports = (req, res, next) => {
  if (req.user && req.user.role === 'Администратор') {
    return next();
  }
  return res.status(403).json({ message: 'Доступ запрещён' });
}; 