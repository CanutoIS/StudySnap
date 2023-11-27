module.exports = {
    user: () => ({
        name: `name-${Math.random()}`,
        email: `email@${Math.random()}.com`,
        username: `username-${Math.random()}`,
        password: `password-${Math.random()}`,
        code: Math.floor(Math.random() * 1000000) + 1 + '',
        avatar: null,
        favs: []
    }),
}