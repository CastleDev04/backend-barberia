module.exports = {
  secret: process.env.JWT_SECRET || 'mi_secreto_barberia',
  expiresIn: '8h'
};