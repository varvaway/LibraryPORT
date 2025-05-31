const checkAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Только зарегистрированные читатели могут бронировать книги. Пожалуйста, войдите в личный кабинет или оставьте заявку на регистрацию.'
    });
  }
  next();
};

module.exports = {
  checkAuth
};
