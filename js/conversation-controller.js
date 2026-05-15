import { formatDate, rawText2textDiv } from './utilities.js'
import {
  defaultCubic,
  setEditingChat,
  setReplyingChat,
  getEditingChat,
  getReplyingChat,
  getIId,
  setAdditionalChatContainerHeight,
  getAdditionalChatContainerHeight
} from "./cache.js"
import { setIId, getDataChats, getDataUsers, myId } from './cache.js'
import { emojiRegex } from './emoji-regex.js'
import { contentAudio } from './audio-controller.js'
import { contentImage } from './image-controller.js'
import { contentVideo } from './video-controller.js'
import { contentFile } from './file-controller.js'
import { closeAttachments } from './text-field-controller.js'

/**
 * Retrieves and displays chat messages between two users.
 * 
 * @param {HTMLElement} element - The HTML element that triggered the chat retrieval.
 * @param {number} id - The ID of the user to retrieve chat messages for.
 * @returns {void}
 */
export const formatChats = (element, id) => {
  if (getEditingChat() || getReplyingChat()) {
    const chatContainer = document.getElementById('chat-container')

    setAdditionalChatContainerHeight(0)
    chatContainer.style.height = 'calc(100vh - 7.925em)'
  }

  if (getEditingChat()) {
    const editable = document.getElementById('editable')
    const editingCaption = document.getElementById('editing-caption')

    editingCaption.classList.add('hide')
    getEditingChat().classList.remove("editing")
    setEditingChat(null)
    editable.innerText = ''

    editingCaption.addEventListener('transitionend', () => {
      editingCaption.style.display = 'none'
    }, { once: true })

    // Trigger input event to update text field state
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
    })
    editable.dispatchEvent(event)
  }

  if (getReplyingChat()) {
    const replyingCaption = document.getElementById('replying-caption')

    replyingCaption.classList.add('hide')
    getReplyingChat().classList.remove("replying")
    setReplyingChat(null)

    replyingCaption.addEventListener('transitionend', () => {
      replyingCaption.style.display = 'none'
    }, { once: true })
  }

  const attachment = document.getElementById('upload-attachment').children.length

  if (attachment > 0) closeAttachments()

  let chatSeeker = getDataChats().find(item => item.participants.includes(id))
  let user = getDataUsers().find(item => item.id == id)
  setIId(id)

  const splash = document.getElementById('splash')
  const heading = document.getElementById('heading')
  const chat = document.getElementById('chat-container')

  if (splash) {
    splash.style.opacity = 0
    splash.style.visibility = 'hidden'

    splash.addEventListener('transitionend', () => {
      splash.remove()
    }, { once: true })
  }

  heading.innerHTML = `
    <div avatar style="background-image: url('${user.avatar}')">
    </div><div name>${user.name}</div>
  `

  chat.innerHTML = ''

  chatSeeker.messages.forEach(message => {
    appendChat(message.id, message.sender, message.sender != 1 ? user.name : null, message.message, message.content, new Date(message.timestamp), message.isEdited ? true : false, message.replyId ? message.replyId : null)
  })
  
  const rooms = document.querySelectorAll('#room > div')
  rooms.forEach(room => room.classList.remove('active'))
  element.classList.add('active')
}

export const createContentElement = (content, chatDiv) => {
  const contentDiv = document.createElement('div')
  contentDiv.setAttribute('content', '')

  if (content.tag == 'AUDIO')
    contentAudio(content.src, content.name, content.type, null, null, contentDiv)
  else if (content.tag == 'IMG')
    contentImage(content.src, null, null, contentDiv, true)
  else if (content.tag == 'VIDEO')
    contentVideo(content.src, content.type, null, null, contentDiv)
  else
    contentFile(content.src, content.name, content.size, null, null, contentDiv)

  chatDiv.append(contentDiv)
}

const closeConfirmainer = () => {
  const closer = document.querySelector('.closer')
  const modal = document.querySelector('.modal')

  closer.style.visibility = 'hidden'
  closer.style.opacity = '0'

  modal.style.visibility = 'hidden'
  modal.style.opacity = '0'

  closer.addEventListener('transitionend', () => {
    closer.remove()
    modal.remove()
  }, { once: true })
}

const deleteConfirm = (chatDiv) => {
  const container = chatDiv.parentElement
  const avatarPreview = chatDiv.parentElement.parentElement.querySelector('div[avatar]').cloneNode(true)
  const namePreview = chatDiv.parentElement.parentElement.querySelector('div[name]').cloneNode(true)
  const timePreview = chatDiv.parentElement.parentElement.querySelector('div[time]').cloneNode(true)
  const chatDivPreview = chatDiv.cloneNode(true)

  const preview = document.createElement('div')
  const rightDiv = document.createElement('div')
  const modal = document.createElement('div')
  const buttonWrapper = document.createElement('div')
  const cancelButton = document.createElement('button')
  const confirmButton = document.createElement('button')
  const message = document.createElement('div')
  const closer = document.createElement('div')
  const hr = document.createElement('hr')
  const footerSpace = document.createElement('div')

  chatDivPreview.querySelector('div[options]').remove()

  rightDiv.appendChild(namePreview)
  rightDiv.appendChild(timePreview)
  rightDiv.appendChild(chatDivPreview)

  preview.id = 'preview-delete-chat'
  preview.appendChild(avatarPreview)
  preview.appendChild(rightDiv)
  preview.querySelector('div:nth-child(2)').style.pointerEvents = 'none'

  hr.style.border = 'none'
  hr.style.height = '1px'
  hr.style.backgroundColor = 'var(--silver)'
  hr.style.margin = '1em 0'

  modal.classList.add('modal')
  closer.classList.add('closer')

  message.innerHTML = '<h2>Delete Message</h2><p>Are you sure you want to delete this message?</p>'

  modal.style.position = 'fixed'
  modal.style.borderRadius = '0.5em'
  modal.style.padding = '0 1em'
  modal.style.minHeight = '250px'
  modal.style.maxHeight = '400px'
  modal.style.width = '500px'
  modal.style.transform = 'translate(-50%, -50%)'
  modal.style.backgroundColor = 'white'
  modal.style.top = '50%'
  modal.style.left = '50%'
  modal.style.zIndex = '2'
  modal.style.opacity = '0'
  modal.style.transition = `opacity ${defaultCubic}, visibility ${defaultCubic}`

  closer.style.visibility = 'hidden'
  closer.style.opacity = '0'
  closer.style.top = '0'
  closer.style.left = '0'
  closer.style.height = '100%'
  closer.style.width = '100%'
  closer.style.position = 'fixed'
  closer.style.backgroundColor = 'var(--placeholder)'
  closer.style.zIndex = '1'
  closer.style.transition = `opacity ${defaultCubic}, visibility ${defaultCubic}`

  cancelButton.textContent = 'Cancel'
  cancelButton.onclick = closeConfirmainer
  cancelButton.onmouseenter = () => {
    cancelButton.style.backgroundColor = 'var(--silver)'
  }
  cancelButton.onmouseleave = () => {
    cancelButton.style.backgroundColor = 'white'
  }
  cancelButton.style.padding = '0.5em 1em'
  cancelButton.style.margin = '0 0.5em'
  cancelButton.style.border = '1px solid var(--silver)'
  cancelButton.style.transition = `background-color ${defaultCubic}`

  confirmButton.textContent = 'Delete'
  confirmButton.onclick = () => {
    const parentContainers = container.parentElement.parentElement.querySelectorAll(':scope > div')
    const containerIndex = Array.from(parentContainers).indexOf(container.parentElement)
    const chatDivs = container.querySelectorAll(':scope > div[chat]')
    const chatDivIndex = Array.from(chatDivs).indexOf(chatDiv)

    if (containerIndex === 0 && chatDivIndex === chatDivs.length - 1) {
      const room = document.querySelector('#room-' + getIId())
      const preview = room.querySelector('[preview]')
      const timestamp = room.querySelector('[time]')
      const chatSeeker = getDataChats().find(item => item.participants.includes(getIId()))

      if (chatDivs.length > 1) {
        const prevChatDiv = chatDivs[chatDivIndex - 1]
        const prevMessageId = prevChatDiv.getAttribute('message-id')
        const prevMessage = chatSeeker.messages.find(item => item.id == prevMessageId)
        const prevText = prevMessage.message

        preview.innerHTML = prevText
      } else {
        const prevContainer = parentContainers[containerIndex + 1]
        const prevChats = prevContainer.querySelectorAll('div[chat]')
        const prevMessageId = prevChats[prevChats.length - 1].getAttribute('message-id')
        const prevMessage = chatSeeker.messages.find(item => item.id == prevMessageId)

        preview.innerHTML = prevMessage.message
        timestamp.textContent = formatDate(new Date(prevMessage.timestamp)).split(' ')[0] == 'Today' ? formatDate(new Date(prevMessage.timestamp)).split(' ')[1] : formatDate(new Date(prevMessage.timestamp)).split(' ')[0]
      }
    }

    chatDiv.remove()
    closeConfirmainer()

    if (container.querySelectorAll(':scope > div[chat]').length === 0) {
      container.parentElement.remove()
    }

    // Delete from chats data
    const messageId = chatDiv.getAttribute('message-id')
    let chatSeeker = getDataChats().find(item => item.participants.includes(getIId()))
    chatSeeker.messages = chatSeeker.messages.filter(item => item.id != messageId)
  }
  confirmButton.onmouseenter = () => {
    confirmButton.style.backgroundColor = 'var(--pomegranate)'
    confirmButton.style.borderColor = 'var(--pomegranate)'
  }
  confirmButton.onmouseleave = () => {
    confirmButton.style.backgroundColor = 'var(--alizarin)'
    confirmButton.style.borderColor = 'var(--alizarin)'
  }
  confirmButton.style.padding = '0.5em 1em'
  confirmButton.style.margin = '0 0.5em'
  confirmButton.style.backgroundColor = 'var(--alizarin)'
  confirmButton.style.color = 'white'
  confirmButton.style.border = '1px solid var(--alizarin)'
  confirmButton.style.transition = `background-color ${defaultCubic}, border-color ${defaultCubic}`

  buttonWrapper.style.position = 'absolute'
  buttonWrapper.style.bottom = '1em'
  buttonWrapper.style.right = '1em'

  footerSpace.style.height = '3em'

  buttonWrapper.appendChild(cancelButton)
  buttonWrapper.appendChild(confirmButton)

  modal.appendChild(message)
  modal.appendChild(hr.cloneNode())
  modal.appendChild(preview)
  modal.appendChild(hr)
  modal.appendChild(footerSpace)
  modal.appendChild(buttonWrapper)

  closer.onclick = closeConfirmainer

  container.appendChild(modal)
  container.appendChild(closer)

  requestAnimationFrame(() => {
    closer.style.visibility = 'visible'
    closer.style.opacity = '.5'
    modal.style.visibility = 'visible'
    modal.style.opacity = '1'
  })
}

const editChat = (chatDiv) => {
  const messageId = chatDiv.getAttribute('message-id')
  const messageObject = getDataChats().find(item =>
    item.participants.includes(getIId())).messages.find(item =>
      item.id == messageId)
  const editable = document.getElementById('editable')
  const editingCaption = document.getElementById('editing-caption')
  const chatContainer = document.getElementById('chat-container')

  if (messageObject.content) editingCaption.style.bottom = '11.2em'
  editingCaption.style.display = ''
  editingCaption.classList.add('hide')
  chatDiv.classList.add('editing')

  requestAnimationFrame(() => editingCaption.classList.remove('hide'))
  
  // Adjust chat container height
  if (!getReplyingChat() && !getEditingChat()) {
    const additionalHeight = getAdditionalChatContainerHeight() + 2.65
    setAdditionalChatContainerHeight(additionalHeight)
    chatContainer.style.height = `calc(100vh - 7.925em - ${additionalHeight}em)`
  }

  // Hide previous editing caption if exist
  if (getEditingChat()) getEditingChat().classList.remove("editing")

  // Hide replying caption if exist
  if (getReplyingChat()) {
    const replyingCaption = document.getElementById('replying-caption')
  
    replyingCaption.classList.add('hide')
    getReplyingChat().classList.remove("replying")
    setReplyingChat(null)
  
    replyingCaption.addEventListener('transitionend', () => {
      replyingCaption.style.display = 'none'
    }, { once: true })
  }

  // Remove previous attachments in edit mode
  if (document.getElementById('upload-attachment').children.length > 0) {
    const uploadAttachment = document.getElementById('upload-attachment')
    uploadAttachment.innerHTML = ''

    if (!messageObject.content)
      closeAttachments()
  }
  
  setEditingChat(chatDiv)

  editable.innerText = messageObject.message
  
  if (messageObject.content) {
    const uploadAttachment = document.getElementById('upload-attachment')

    messageObject.content.forEach(con => {
      const edit = document.createElement('span')
      const del = document.createElement('span')
      const div = document.createElement('div')
      
      edit.classList.add('edit')
      del.classList.add('delete')

      if (con.tag == 'AUDIO')
        contentAudio(con.src, con.name, con.type, edit, del, div)
      else if (con.tag == 'IMG')
        contentImage(con.src, edit, del, div, false)
      else if (con.tag == 'VIDEO')
        contentVideo(con.src, con.type, edit, del, div)
      else
        contentFile(con.src, con.name, con.size, edit, del, div)

      div.appendChild(edit)
      div.appendChild(del)
      uploadAttachment.appendChild(div)
    })

    // Adjust chat container height
    const additionalHeight = getAdditionalChatContainerHeight() + 7.45
    setAdditionalChatContainerHeight(additionalHeight)
    chatContainer.style.height = `calc(100vh - 7.925em - ${additionalHeight}em)`

    const textEditorContainer = document.getElementById('text-editor-container')
    const uploadAttachmentTrackWrapper = document.getElementById('upload-attachment-track-wrapper')

    textEditorContainer.classList.add('send')
      
    uploadAttachmentTrackWrapper.style.display = ''
    requestAnimationFrame(() => uploadAttachment.classList.remove('hide'))
  }

  // Trigger input event to update text field state
  const event = new Event('input', {
    bubbles: true,
    cancelable: true,
  })
  editable.dispatchEvent(event)

  // Focus on text field
  editable.focus()
  const sel = window.getSelection()
  sel.selectAllChildren(editable)
  sel.collapseToEnd()
}

const replyChat = (chatDiv) => {
  const replyingCaption = document.getElementById('replying-caption')
  const chatContainer = document.getElementById('chat-container')

  replyingCaption.style.display = ''
  replyingCaption.classList.add('hide')
  chatDiv.classList.add('replying')

  requestAnimationFrame(() => replyingCaption.classList.remove('hide'))
  
  // Adjust chat container height
  if (!getEditingChat() && !getReplyingChat()) {
    const additionalHeight = getAdditionalChatContainerHeight() + 2.65
    setAdditionalChatContainerHeight(additionalHeight)
    chatContainer.style.height = `calc(100vh - 7.925em - ${additionalHeight}em)`
  }

  // Hide previous replying caption if exist
  if (getReplyingChat()) getReplyingChat().classList.remove("replying")

  // Hide editing caption if exist
  if (getEditingChat()) {
    const editable = document.getElementById('editable')
    const placeholder = document.getElementById('in-placeholder')
    const editingCaption = document.getElementById('editing-caption')
  
    placeholder.style.display = ''
    editable.innerText = ''
    editingCaption.classList.add('hide')
    getEditingChat().classList.remove("editing")
    setEditingChat(null)
  
    editingCaption.addEventListener('transitionend', () => {
      editingCaption.style.display = 'none'
    }, { once: true })
  }
  
  setReplyingChat(chatDiv)

  // Adjust caption if attachment container exist
  if (document.getElementById('upload-attachment').children.length > 0) {
    replyingCaption.style.bottom = '11.2em'
  }
  
  // Focus on text field
  editable.focus()
  const sel = window.getSelection()
  sel.selectAllChildren(editable)
  sel.collapseToEnd()
}

/**
 * Appends a replying chat message to the given chat div element.
 * 
 * @param {HTMLElement} chatDiv - The chat div element to append the replying chat message to.
 * @param {HTMLElement} replyingChatDiv - The replying chat div element.
 * @returns {void}
 */
export const appendReplyingChat = (chatDiv, replyingChatDiv) => {
  const replyingName = replyingChatDiv.parentElement.querySelector('div[name]').textContent
  const replyingAvatarSrc = replyingChatDiv.parentElement.parentElement.querySelector('div[avatar] > img').src
  const replyTextDiv = replyingChatDiv.querySelector('div[text]')
  const replyEditedDiv = replyingChatDiv.querySelector('div[edited]')
  const replyContentDiv = replyingChatDiv.querySelector('div[content]')
  const replyingMessageId = replyingChatDiv.getAttribute('message-id')
  const replyingAvatarDiv = document.createElement('div')
  const replyingNameDiv = document.createElement('div')
  const replyIdDiv = document.createElement('div')
  const replyLine = document.createElement('div')
  const innerReplyIdDiv = document.createElement('div')

  innerReplyIdDiv.setAttribute('inner-reply-id', '')
  replyLine.setAttribute('reply-line', '')
  replyIdDiv.appendChild(replyLine)
  replyIdDiv.appendChild(innerReplyIdDiv)

  replyingAvatarDiv.setAttribute('replying-avatar', '')
  const replyingAvatarImg = document.createElement('img')
  replyingAvatarImg.src = replyingAvatarSrc
  replyingAvatarImg.alt = replyingName
  replyingAvatarDiv.appendChild(replyingAvatarImg)
  replyIdDiv.appendChild(replyingAvatarDiv)

  replyingNameDiv.setAttribute('replying-name', '')
  replyingNameDiv.textContent = replyingName
  replyIdDiv.appendChild(replyingNameDiv)

  if (replyTextDiv) {
    const replyText = replyTextDiv.textContent.length > 30 ? replyTextDiv.textContent.slice(0, 30) + '...' : replyTextDiv.textContent

    innerReplyIdDiv.textContent = replyText

    if (replyContentDiv) {
      const i = document.createElement('i')

      i.classList.add('fa-solid', 'fa-paperclip')
      innerReplyIdDiv.appendChild(i)
    }
  } else if (replyContentDiv) {
    const i = document.createElement('i')

    i.classList.add('fa-solid', 'fa-paperclip')
    innerReplyIdDiv.appendChild(i)
  }

  replyIdDiv.onclick = () => {
    replyingChatDiv.scrollIntoView({ behavior: 'smooth', block: 'center' })
    replyingChatDiv.classList.add('highlighted')

    setTimeout(() => {
      replyingChatDiv.classList.remove('highlighted')
    }, 2000)
  }

  replyIdDiv.setAttribute('reply-id', replyingMessageId)
  replyIdDiv.appendChild(innerReplyIdDiv)

  if (replyEditedDiv) {
    const editedFlagDiv = document.createElement('div')
    editedFlagDiv.setAttribute('edited-flag', '')
    editedFlagDiv.textContent = '(edited)'
    replyIdDiv.appendChild(editedFlagDiv)
  }
  
  chatDiv.prepend(replyIdDiv)
}

/**
 * Creates and appends a chat message to the chat container.
 * The chat message div element representing the appended chat message.
 * 
 * @param {string} messageId - The unique identifier of the chat message.
 * @param {string} userId - The user ID of the chat message sender.
 * @param {string} name - The name of the chat message sender.
 * @param {string} text - The text content of the chat message.
 * @param {Array} content - An array of content objects associated with the chat message.
 * @param {Date} date - The date and time when the chat message was sent.
 * @param {boolean} isEdited - A flag indicating whether the chat message has been edited.
 * @param {string} replyId - The message ID of the chat message being replied to.
 * @param {boolean} isAnimate - A flag indicating whether to animate the chat message.
 * @returns {HTMLElement} The chat message div element representing the appended chat message.
 */
export const appendChat = (messageId, userId, name, text, content, date, isEdited, replyId) => {
  const div = document.createElement('div')
  const textDiv = rawText2textDiv(text)

  textDiv.setAttribute('text', '')

  const timeVal = `${formatDate(date)}`
  const nameInput = document.querySelector('#left input#name')
  const nameVal = userId == myId ? nameInput.value : name
  const chatContainer = document.querySelector('#chat-container')
  const latest = document.querySelector('#chat-container > div:first-child > div:nth-child(2)')

  const createOptionElement = (chatDiv, userId) => {
    const optionChat = document.createElement('div')

    optionChat.setAttribute('options', '')

    const deleteChatAction = () => deleteConfirm(chatDiv)

    const editChatAction = () => editChat(chatDiv)

    const replyChatAction = () => replyChat(chatDiv)

    if (userId == myId) {
      const deleteButton = document.createElement('span')
      deleteButton.setAttribute('delete-chat', '')
      deleteButton.setAttribute('title', 'Delete message')
      deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>'
      deleteButton.onclick = deleteChatAction

      const editButton = document.createElement('span')
      editButton.setAttribute('edit-chat', '')
      editButton.setAttribute('title', 'Edit message')
      editButton.innerHTML = '<i class="fa-solid fa-pen"></i>'
      editButton.onclick = editChatAction

      optionChat.appendChild(deleteButton)
      optionChat.appendChild(editButton)
    }

    const replyButton = document.createElement('span')
    replyButton.setAttribute('reply-chat', '')
    replyButton.setAttribute('title', 'Reply to message')
    replyButton.innerHTML = '<i class="fa-solid fa-reply"></i>'
    replyButton.onclick = replyChatAction
    optionChat.appendChild(replyButton)

    chatDiv.appendChild(optionChat)
  }

  if (emojiRegex.test(textDiv.textContent)) textDiv.style.fontSize = '2.5em'

  const createChatDiv = (messageId, userId, textDiv, content, isEdited) => {
    const chatDiv = document.createElement('div')
    chatDiv.setAttribute('chat', '')
    chatDiv.setAttribute('message-id', messageId)

    createOptionElement(chatDiv, userId)
    if (textDiv.textContent.trim()) chatDiv.append(textDiv)
    if (content) content.forEach(con => createContentElement(con, chatDiv))

    if (isEdited) {
      const editedFlagDiv = document.createElement('div')
      editedFlagDiv.setAttribute('edited', '')
      editedFlagDiv.textContent = '(edited)'
      chatDiv.appendChild(editedFlagDiv)
    }

    return chatDiv
  }

  const createAvatarDiv = (userId, nameVal) => {
    const divAvatar = document.createElement('div')
    divAvatar.setAttribute('avatar', '')

    const user = getDataUsers().find(item => item.id == userId)
    const avatarImg = document.createElement('img')
    avatarImg.src = user.avatar
    avatarImg.alt = nameVal
    divAvatar.appendChild(avatarImg)

    return divAvatar
  }

  const createContentDiv = (nameVal, timeVal, chatDiv) => {
    const divContent = document.createElement('div')

    const nameDiv = document.createElement('div')
    nameDiv.setAttribute('name', '')
    nameDiv.textContent = nameVal

    const timeDiv = document.createElement('div')
    timeDiv.setAttribute('time', '')
    timeDiv.textContent = timeVal

    divContent.append(nameDiv, timeDiv, chatDiv)
    return divContent
  }

  if (!latest || nameVal !== latest.querySelector('div[name]').textContent || timeVal !== latest.querySelector('div[time]').textContent || replyId) {
    const chatDiv = createChatDiv(messageId, userId, textDiv, content, isEdited)

    if (replyId) {
      const replyingChatDiv = chatContainer.querySelector(`div[chat][message-id='${replyId}']`)
      appendReplyingChat(chatDiv, replyingChatDiv)
    }

    const divAvatar = createAvatarDiv(userId, nameVal)
    const divContent = createContentDiv(nameVal, timeVal, chatDiv)

    div.append(divAvatar, divContent)
    chatContainer.prepend(div)

    return div
  } else {
    const chatDiv = createChatDiv(messageId, userId, textDiv, content, isEdited)
    latest.append(chatDiv)

    return textDiv
  }
}
