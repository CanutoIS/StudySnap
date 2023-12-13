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
    post: () => ({
        content: generateLongString(501)
    })
}

function generateLongString(targetLength) {
    let longString = '';
    for (let i = 0; i < targetLength; i++) {
        longString += 'a'; // You can use any character or sequence of characters.
    }
    return longString;
}