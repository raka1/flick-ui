import {
  getAdditionalChatContainerHeight,
  setAdditionalChatContainerHeight,
  getReplyingChat,
  setReplyingChat,
  getIId,
  myId,
  getEditingChat,
  setEditingChat,
  defaultCubic
} from './cache.js'
import { formatDate, rawText2textDiv } from './utilities.js'
import { getChats } from './chats.js'
import { shiftUp } from './room-controller.js'
import { createContentElement } from './conversation-controller.js'
import { appendChat, appendReplyingChat } from './conversation-controller.js'

let lastRange = null

const editable = document.getElementById('editable')
editable.addEventListener('keyup', saveSelection)
editable.addEventListener('mouseup', saveSelection)
editable.addEventListener('blur', saveSelection)

/**
 * Saves the current selection range in the text editor.
 * If there is a selection range, it stores it in the lastRange variable.
 * 
 * @return {void}
 */
function saveSelection() {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    lastRange = selection.getRangeAt(0)
  }
}

/**
 * Focuses the text editor on the last saved selection range.
 * If there is a saved range, it sets the window selection to that range.
 * 
 * @returns {void}
 */
export const focusOnLastRange = () => {
  if (lastRange) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(lastRange)
  }
}

/**
 * Inserts an emoji into a text editor.
 * 
 * @param {string} emoji - The emoji to be inserted into the text editor.
 * @returns {void}
 */
export const addText = (emoji) => {
  const placeholder = document.getElementById('in-placeholder')
  const editable = document.getElementById('editable')

  placeholder.style.display = 'none'
  editable.focus()

  const selection = window.getSelection()

  let range

  if (lastRange) {
    range = lastRange
  } else if (selection.rangeCount > 0) {
    range = selection.getRangeAt(0)
  } else {
    range = document.createRange()
    range.selectNodeContents(editable)
    range.collapse(false)
  }
  
  const textNode = document.createTextNode(emoji)

  range.deleteContents()
  range.insertNode(textNode)

  range.setStartAfter(textNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  lastRange = range
}

/**
 * Handles the sending of messages in a chat application.
 * 
 * This function is called when the user presses the enter key or clicks the enter button.
 * It retrieves the contents of the editable text area and the uploaded attachments.
 * It creates objects for each attachment, including its type and source.
 * It updates the chat room preview and timestamp with the new message content.
 * It clears the editable text area and shows the placeholder text.
 * It removes the 'send' class from the text editor container.
 * It stores the message data in the temporary chat data.
 * It shifts the chat room up in the chat list.
 * 
 * @returns {void}
 */
export const enter = () => {
  const editable = document.getElementById('editable')
  const uploadAttachment = document.getElementById('upload-attachment')
  const uploads = Array.from(uploadAttachment.children)
  let contents = []
  let tagView
  
  const chatContainer = document.getElementById('chat-container')
  const editingCaption = document.getElementById('editing-caption')
  const replyingCaption = document.getElementById('replying-caption')

  uploads.forEach((e, i) => {
    contents[i] = {}
    contents[i].tag = e.firstElementChild.tagName
    switch (e.firstElementChild.tagName) {
      case 'AUDIO':
        contents[i].src = e.querySelector('audio > source').getAttribute('src')
        contents[i].name = e.querySelector('span.desc').textContent
        contents[i].type = e.querySelector('audio > source').getAttribute('type')
        tagView = '<i class="fa-solid fa-music"></i> Audio'
        break
      case 'IMG':
        contents[i].src = e.querySelector('img').getAttribute('src')
        tagView = '<i class="fa-solid fa-image"></i> Image'
        break
      case 'VIDEO':
        contents[i].src = e.querySelector('video > source').getAttribute('src')
        contents[i].type = e.querySelector('video > source').getAttribute('type')
        tagView = '<i class="fa-solid fa-video"></i> Video'
        break
      default:
        contents[i].src = e.querySelector('span.blob').textContent
        contents[i].name = e.querySelector('span.desc').textContent
        contents[i].size = e.querySelector('span.size').textContent
        tagView = '<i class="fa-solid fa-paperclip"></i> Attachment'
        break
    }
  })

  if (!editable.textContent && !uploads.length) return
  if (!contents.length) contents = contents = null

  // Time configure
  const time = new Date()
  const dd = ('0' + time.getDate()).slice(-2)
  const mm = ('0' + (time.getMonth() + 1)).slice(-2)
  const yyyy = time.getFullYear()
  const h = ('0' + time.getHours()).slice(-2)
  const m = ('0' + time.getMinutes()).slice(-2)
  const me = ('0' + time.getSeconds()).slice(-2)

  const trimmedText = editable.innerText.trim()
  const placeholder = document.getElementById('in-placeholder')

  editable.innerText = ''
  placeholder.style.display = ''

  let messageId

  if (getEditingChat()) {
    messageId = getEditingChat().getAttribute('message-id')
  } else {
    const divs = document.querySelectorAll('#chat-container > div')
    const lastDiv = divs[0]
    const lastChatDiv = lastDiv?.querySelector('div[chat]:last-child')
    const lastMessageId = lastChatDiv?.getAttribute('message-id')

    messageId = lastMessageId ? parseInt(lastMessageId) + 1 : 0

    const replyId = getReplyingChat()?.getAttribute('message-id')
    const div = appendChat(
      messageId,
      myId,
      null,
      trimmedText,
      contents,
      time,
      false,
      replyId ? parseInt(replyId) : null
    )

    // Animate chat container slide up
    const latest = document.querySelector('#chat-container > div:first-child > div:nth-child(2)')
    const nameInput = document.querySelector('#left input#name').value
    const timeFormatted = formatDate(time)

    const slide = !latest || 
      nameInput !== latest.querySelector('div[name]').textContent || 
      timeFormatted !== latest.querySelector('div[time]').textContent || 
      replyId
      ? `calc(${div.getBoundingClientRect().height}px + .5em)`
      : `calc(${div.getBoundingClientRect().height}px + .1em)`

    chatContainer.style.transform = `translateY(${slide})`

    requestAnimationFrame(() => {
      chatContainer.style.transition = `transform ${defaultCubic}`
      chatContainer.style.transform = ''
    })

    chatContainer.addEventListener('transitionend', () => {
      chatContainer.style.transition = ''
    }, { once: true })
  }
  
  document.getElementById('text-editor-container').classList.remove('send')

  // Set chat container, editing and replying caption height back to default
  setAdditionalChatContainerHeight(0)
  chatContainer.style.height = 'calc(100vh - 7.925em)'
  editingCaption.style.bottom = '3.75em'
  replyingCaption.style.bottom = '3.75em'

  if (getEditingChat()) {
    const textDiv = rawText2textDiv(trimmedText)
    textDiv.setAttribute('text', '')

    const chatDiv = getEditingChat()
    const editingMessageId = chatDiv.getAttribute('message-id')

    if (chatDiv.querySelector('div[text]')) chatDiv.querySelector('div[text]').remove()
    if (chatDiv.querySelector('div[content]')) {
      chatDiv.querySelectorAll('div[content]').forEach(element => {
        element.remove()
      })
    }
    if (chatDiv.querySelector('div[edited]')) chatDiv.querySelector('div[edited]').remove()

    // Add edited flag
    const editedFlagDiv = document.createElement('div')

    editedFlagDiv.setAttribute('edited', '')
    editedFlagDiv.textContent = '(edited)'
    if (textDiv.textContent.trim()) chatDiv.prepend(textDiv)
    if (contents) contents.forEach(con => createContentElement(con, chatDiv))
    chatDiv.appendChild(editedFlagDiv)

    // Update chats on the UI that linked to all replying to this chat
    document.querySelectorAll(`#chat-container div[reply-id='${editingMessageId}']`).forEach(replyChat => {
      appendReplyingChat(replyChat.parentElement, chatDiv)
      replyChat.remove()
    })

    editingCaption.classList.add('hide')

    editingCaption.addEventListener('transitionend', () => {
      editingCaption.style.display = 'none'
    }, { once: true })

    getEditingChat().classList.remove("editing")
    setEditingChat(null)

    let isLatestChat = false
    let chatSeeker = getChats().chats.find(item => item.participants.includes(getIId()))
    chatSeeker.messages = chatSeeker.messages.map((msg, index) => {
      if (msg.id == messageId) {
        if (index == chatSeeker.messages.length - 1) {
          isLatestChat = true
        }
      }

      return msg.id == messageId ? {
        ...msg,
        message: trimmedText,
        content: contents,
        isEdited: true,
      } : msg
    })

    // If the edited message is the latest message, update the chat preview
    if (isLatestChat) {
      const room = document.querySelector('#room-' + getIId())
      const preview = room.querySelector('[preview]')
      preview.innerHTML = trimmedText ? trimmedText : tagView
    }

    return
  }

  let replyId = null
  if (getReplyingChat()) {
    replyId = parseInt(getReplyingChat().getAttribute('message-id'))
    replyingCaption.classList.add('hide')

    replyingCaption.addEventListener('transitionend', () => {
      replyingCaption.style.display = 'none'
    }, { once: true })

    getReplyingChat().classList.remove("replying")
    setReplyingChat(null)
  }

  const room = document.querySelector('#room-' + getIId())
  const preview = room.querySelector('[preview]')
  const timestamp = room.querySelector('[time]')

  room.setAttribute('order', Date.parse(time)/1000)
  preview.innerHTML = trimmedText ? trimmedText : tagView
  timestamp.textContent = formatDate(time).split(' ')[0] == 'Today' ? formatDate(time).split(' ')[1] : formatDate(time).split(' ')[0]

  // Store data to chats data
  let chatSeeker = getChats().chats.find(item => item.participants.includes(getIId()))
  chatSeeker.messages.push({
    id: messageId,
    sender: myId,
    recipient: getIId(),
    message: trimmedText,
    content: contents,
    timestamp: `${yyyy}-${mm}-${dd} ${h}:${m}:${me}`,
    replyId: replyId,
  })

  shiftUp(room)

  chatContainer.scrollTop = 0
}

/**
 * Handles the edit button click event for an uploaded attachment.
 * 
 * @param {HTMLElement} e - The edit button element that was clicked.
 * @returns {void}
 */
export const editUploadButton = async e => {
  const input = document.querySelector('input#edit')

  e.parentElement.classList.add('editingUpload')

  input.click()
}

/**
 * Closes the upload attachment container and clears its contents.
 * 
 * @returns {void}
 */
export const closeAttachments = () => {
  const uploadAttachment = document.getElementById('upload-attachment')
  const uploadAttachmentTrackWrapper = document.getElementById('upload-attachment-track-wrapper')
  const chatContainer = document.getElementById('chat-container')
  const editable = document.getElementById('editable')
  const textEditorContainer = document.getElementById('text-editor-container')

  if (editable.textContent == '' && editable.getElementsByTagName('br').length < 2)
    textEditorContainer.classList.remove('send')

  // Adjust chat container height
  const additionalHeight = getAdditionalChatContainerHeight() - 7.45
  setAdditionalChatContainerHeight(additionalHeight)
  chatContainer.style.height = `calc(100vh - 7.925em - ${additionalHeight}em)`

  uploadAttachment.classList.add('hide')

  uploadAttachment.addEventListener('transitionend', () => {
    uploadAttachmentTrackWrapper.style.display = 'none'
    uploadAttachment.innerHTML = ''
  }, { once: true })
}

/**
 * Handles the delete button click event for an uploaded attachment.
 *
 * @param {HTMLElement} e - The delete button element that was clicked.
 * @returns {void}
 */
export const deleteUploadButton = e => {
  e.parentElement.remove()

  const array = document.querySelectorAll('#upload-attachment > div')

  if (!array.length) {
    const textEditorContainer = document.getElementById('text-editor-container')
    const editable = document.getElementById('editable')

    // Adjust caption if attachment container exist
    if (document.getElementById('editing-caption').style.display != 'none') {
      const editingCaption = document.getElementById('editing-caption')
      editingCaption.style.bottom = '3.75em'
    }
    if (document.getElementById('replying-caption').style.display != 'none') {
      const replyingCaption = document.getElementById('replying-caption')
      replyingCaption.style.bottom = '3.75em'
    }

    if (editable.textContent == '' && editable.getElementsByTagName('br').length < 2)
      textEditorContainer.classList.remove('send')
    
    closeAttachments()
  }
}
