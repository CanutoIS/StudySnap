const { User, Post, Conversation, Suggestion } = require('../../data/models')

module. exports = async () => {

    // in series
    // return User.deleteMany()
    //     .then(() => Post.deleteMany())

    // in parallel (faster)
    // return Promise.all([
    //     User.deleteMany(),
    //     Post.deleteMany()
    // ])

    await User.deleteMany()
    await Post.deleteMany()
    await Conversation.deleteMany()
    await Suggestion.deleteMany()
}