const Message = require('../models/message'),
  User = require('../models/user')

module.exports = (io) => {
  io.on('connection', (client) => {
    // client emits directly
    console.log('new connection...')

    client.on('disconnect', () => {
      client.broadcast.emit('user disconnected')
      console.log('user disconnected...')
    })

    client.on('message', (data) => {
      // listens for custom message event
      let messageAttribute = {
          content: data.content,
          userName: data.userName,
          user: data.userId,
        },
        m = new Message(messageAttribute)
      // m.save()
      //     .then(() => {
      //         io.emit("message", messageAttribute);
      //     })
      //     .catch(error => console.log(`error: ${error.message}`));
      User.findById({ _id: messageAttribute.user })
        .then(() => {
          m.save()
            .then(() => {
              io.emit('message', messageAttribute)
            })
            .catch((error) => console.log(`error: ${error.message}`))
        })
        .catch(() => console.log('User does not exist'))
    })

    Message.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .then((messages) => {
        console.log('I can emit load all')
        client.emit('load all messages', messages.reverse()) //emits a custom evnt with 10 messages to the new sockets only
      })
  })
}

// client repersents the connected entity on the other side of the sokcet ith te server.
// Client listners run only if an initial io connection is made.
