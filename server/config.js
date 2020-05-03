module.exports = {
    URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/babynames',
    SECRET: process.env.SECRET || '8Jh6fd6U71A',
    PORT: process.env.PORT || 3000,
    userRoles: { ADMIN: "admin", USER: "user" }
}
