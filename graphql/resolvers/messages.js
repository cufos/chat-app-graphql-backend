const { Message, User } = require('../../models')
const { UserInputError, AuthenticationError } = require('apollo-server')
const { Op } = require('sequelize')

module.exports = {
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')

        const otherUser = await User.findOne({ where: { username: from } })

        if (!otherUser) throw new UserInputError('User not found')

        let usernames = [user.username, otherUser.username]

        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: username },
            to: { [Op.in]: usernames }
          },
          order: [['createdAt', 'DESC']]
        })

        return messages
      } catch (err) {
        throw err
      }
    }
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')

        const recipient = await User.findOne({ where: { username: to } })

        if (!recipient) throw new UserInputError('User not found')
        else if (recipient.username === user.username) {
          throw new UserInputError('This action it\'s not allowed, can\'t message yourself')
        }

        if (content.trim() === '') throw new UserInputError('Message is empty')

        const message = await Message.create({
          from: user.username,
          to,
          content
        })

        return message
      } catch (err) {
        throw err
      }
    }
  }
}
