export default {
    secret: process.env.JWT_SECRET || 'your-secret-key', // В продакшене использовать переменные окруженя!!!
    expiresIn: '24h', // Время жизни токена
};