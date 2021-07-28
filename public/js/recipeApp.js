$(document).ready(() => {
  let socket = io()

  $('#chatForm').submit(() => {
    let text = $('#chat-input').val(),
      userId = $('#chat-user-id').val(),
      userName = $('#chat-user-name').val()

    socket.emit('message', {
      content: text,
      userId: userId,
      userName: userName,
    }) // emits from data
    $('#chat-input').val('')
    return false
  })
  // Emit an event when the form is submitted.

  const create = () => {
    socket = io()
  }

  const destroy = () => {
    socket.close()
  }

  window.create = create
  window.destroy = destroy

  socket.on('message', (message) => {
    displayMessage(message);
    for (let i = 0; i < 6; i++) {
      $('.chat-icon').fadeOut(200).fadeIn(200)
    }
  })
  // Listen for an event, and populate the chat box.

  let getCurrentUserClass = (id) => {
    let userId = $('#chat-user-id').val()
    return userId === id ? 'current-user' : ''
  }

  let displayMessage = (message) => {
    $('#chat').prepend(
      $('<li>').html(`
      <div class="message ${getCurrentUserClass(message.user)}">
      <strong> ${message.userName} </strong>: ${message.content}
      </div>`)
    )
  }
  // Dislpay messages from the server in the chat box

  socket.on('load all messages', (data) => {
    console.log('I can see the load all messages...')
    data.forEach((message) => {
      displayMessage(message)
    })
  })

  socket.on('user disconnected', () => {
    displayMessage({
      userName: 'Notice',
      content: 'User left the group',
    })
  })

  $('#modal-button').click(() => {
    $('.modal-body').html('')
    $.get('/api/courses?apiToken=recipeT0k3n', (results = {}) => {
      let data = results.data
      if (!data || !data.courses) return
      data.courses.forEach((course) => {
        $('.modal-body').append(
          `<div>
						<span class="course-title">
							${course.title}
						</span>
						<button class='button ${
              course.joined ? 'joined-button' : 'join-button'
            }' data-id="${course._id}">
							${course.joined ? 'Joined' : 'Join'}
						</button>
						<div class="course-description">
							${course.description}
						</div>
					</div>`
        )
      })
    }).then(() => {
      addJoinButtonListener()
    })
  })
})

let addJoinButtonListener = () => {
  $('.join-button').click((event) => {
    let $button = $(event.target),
      courseId = $button.data('id')
    $.get(`/api/courses/${courseId}/join`, (results = {}) => {
      let data = results.data
      if (data && data.success) {
        $button
          .text('Joined')
          .addClass('joined-button')
          .removeClass('join-button')
      } else {
        $button.text('Try again')
      }
    })
  })
}
