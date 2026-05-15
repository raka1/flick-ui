"use strict"

import { formatDate } from './utilities.js'
import {
  myId,
  getDataUsers,
  setDataUsers,
  getDataChats,
  setDataChats,
  getDataEmojis,
  setDataEmojis,
  getSelectedEmojiCategory,
  setSelectedEmojiCategory,
  getEditingChat,
  setEditingChat,
  getReplyingChat,
  setReplyingChat,
  getAdditionalChatContainerHeight,
  setAdditionalChatContainerHeight
} from './cache.js'
import { roomSearch, roomInsert } from './room-controller.js'
import { focusOnLastRange, enter, addText } from './text-field-controller.js'
import { formatChats } from './conversation-controller.js'
import { selectEmojiCategory, searchEmojiInput, closeEmoji } from './emoji-controller.js'
import { contentAudio } from './audio-controller.js'
import { contentImage } from './image-controller.js'
import { contentVideo } from './video-controller.js'
import { contentFile } from './file-controller.js'
import { closeAttachments } from './text-field-controller.js'
import { getChats } from './chats.js'
import { users } from './users.js'

/**
 * Cancels the edit state of the currently editing chat.
 * 
 * @returns {void}
 */
const cancelEdit = () => {
  const editable = document.getElementById('editable')
  const placeholder = document.getElementById('in-placeholder')
  const editingCaption = document.getElementById('editing-caption')
  const chatContainer = document.getElementById('chat-container')

  placeholder.style.display = ''
  editable.innerText = ''
  editingCaption.classList.add('hide')
  getEditingChat().classList.remove("editing")
  setEditingChat(null)
  document.getElementById('text-editor-container').classList.remove('send')

  editingCaption.addEventListener('transitionend', () => {
    editingCaption.style.display = 'none'
  }, { once: true })
  
  const uploadAttachment = document.getElementById('upload-attachment')

  // Adjust chat container height
  setAdditionalChatContainerHeight(0)
  chatContainer.style.height = `calc(100vh - 7.925em)`

  // Adjust caption if attachment container exist
  if (uploadAttachment.children.length > 0) {
    uploadAttachment.innerHTML = ''
    uploadAttachment.classList.add('hide')

    editingCaption.addEventListener('transitionend', () => {
      const uploadAttachmentTrackWrapper = document.getElementById('upload-attachment-track-wrapper')

      editingCaption.style.bottom = '3.75em'
      uploadAttachmentTrackWrapper.style.display = 'none'
    }, { once: true })
  }
}

/** 
 * Cancels the reply state of the currently replying chat.
 * 
 * @returns {void}
 */
const cancelReply = () => {
  const replyingCaption = document.getElementById('replying-caption')
  const chatContainer = document.getElementById('chat-container')

  replyingCaption.classList.add('hide')
  getReplyingChat().classList.remove("replying")
  setReplyingChat(null)

  replyingCaption.addEventListener('transitionend', () => {
    replyingCaption.style.display = 'none'
  }, { once: true })
  
  // Adjust chat container height
  const additionalHeight = getAdditionalChatContainerHeight() - 2.65
  setAdditionalChatContainerHeight(additionalHeight)
  chatContainer.style.height = `calc(100vh - 7.925em - ${additionalHeight}em)`

  // Adjust caption if attachment container exist
  if (document.getElementById('upload-attachment').children.length > 0) {
    replyingCaption.addEventListener('transitionend', () => {
      replyingCaption.style.bottom = '3.75em'
    }, { once: true })
  }
}

const cancelEditingButton = document.querySelector('#editing-caption span')
const cancelReplyingButton = document.querySelector('#replying-caption span')

cancelEditingButton.addEventListener('click', () => {
  cancelEdit()
})

cancelReplyingButton.addEventListener('click', () => {
  cancelReply()
})

/**
 * Fetches and displays a list of emojis from a JSON file.
 * 
 * @return {Promise<void>} A promise that resolves when the emojis have been fetched and displayed.
 */
const getGemoji = async () => {
  const response = await fetch('/js/emoji.json')  
  const emojiContainer = document.getElementById('emoji-container')

  setDataEmojis(await response.json())

  // Emoji search bar

  const input = document.createElement('input')
  const searchE = document.createElement('div')
  const icon = document.createElement('i')

  input.type = 'text'
  input.id = 'search-emoji'
  input.placeholder = 'Search emoji...'
  input.oninput = searchEmojiInput

  icon.className = 'fa-solid fa-magnifying-glass'
  searchE.id = 'search-e'

  emojiContainer.appendChild(input)
  emojiContainer.appendChild(searchE)
  searchE.appendChild(icon)

  // Emoji container inner

  const list = document.createElement('div')
  const left = document.createElement('div')
  const right = document.createElement('div')

  list.id = 'emoji-list'
  left.id = 'emoji-left'
  right.id = 'emoji-right'
  list.appendChild(left)
  list.appendChild(right)
  emojiContainer.appendChild(list)

  // Emoji loop

  let emojis = []

  getDataEmojis().forEach(emoji => {
    if (getSelectedEmojiCategory() == null) setSelectedEmojiCategory(emoji.category)

    if (!emojis.includes(emoji.category)) {
      const div = document.createElement('div')

      div.textContent = emoji.emoji
      div.setAttribute('data-category', emoji.category)
      div.onclick = () => selectEmojiCategory(emoji.category)

      emojis.push(emoji.category)
      left.appendChild(div)
    }

    const div = document.createElement('div')
    div.textContent = emoji.emoji
    div.setAttribute('data-description', emoji.description)
    div.setAttribute('data-category', emoji.category)
    div.setAttribute('data-aliases', emoji.aliases.join(' '))
    div.setAttribute('data-tags', emoji.tags.join(' '))
    div.onclick = () => addText(emoji.emoji)

    if (emoji.category !== getSelectedEmojiCategory()) div.style.display = 'none'

    right.appendChild(div)
  })

  document.querySelectorAll('#emoji-left div')[0].classList.add('active')
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container')
  const loading = document.querySelector('.loading')

  setDataUsers(users.users)
  setDataChats(getChats().chats)

  getDataChats().forEach((e, i) => {
    if (e.participants.includes(myId)) {
      e.participants.splice(e.participants.indexOf(myId), 1)

      let div = document.createElement('div')
      let left = document.createElement('div')
      let right = document.createElement('div')
      let row = document.createElement('div')
      let name = document.createElement('div')
      let time = document.createElement('div')
      let preview = document.createElement('div')
      let inter = e.participants[0]
      let dataInter = getDataUsers().find(item => item.id === inter)

      div.setAttribute('id', 'room-' + dataInter.id)
      div.setAttribute('order', Date.parse(e.messages[e.messages.length - 1].timestamp)/1000)
      div.onclick = () => formatChats(div, dataInter.id)
      left.setAttribute('left', '')
      right.setAttribute('right', '')
      row.setAttribute('row', '')
      name.setAttribute('name', '')
      time.setAttribute('time', '')
      preview.setAttribute('preview', '')

      left.style.backgroundImage = 'url(' + dataInter.avatar + ')'

      name.textContent = dataInter.name
      time.textContent = formatDate(new Date(e.messages[e.messages.length - 1].timestamp)).split(' ')[0] == 'Today' ? formatDate(new Date(e.messages[e.messages.length - 1].timestamp)).split(' ')[1] : formatDate(new Date(e.messages[e.messages.length - 1].timestamp)).split(' ')[0]
      preview.textContent = e.messages[e.messages.length - 1].message

      row.appendChild(name)
      row.appendChild(time)
      right.appendChild(row)
      right.appendChild(preview)
      div.appendChild(left)
      div.appendChild(right)

      roomInsert(div)
    }
  })

  container.style.display = 'grid'

  requestAnimationFrame(() => {
    container.style.opacity = '1'
    container.style.visibility = 'visible'
    loading.style.opacity = '0'
    loading.style.visibility = 'hidden'
  })

  loading.addEventListener('transitionend', () => {
    loading.style.display = 'none'
  }, { once: true })

  getGemoji()
})

// For change name
document.querySelector('input#name').addEventListener('input', e => {
  document.querySelectorAll('.my-name').forEach(element => {
    if (e.target.value == '') element.textContent = 'Literature'
    else element.textContent = e.target.value
  })
})

document.querySelector('input#search-message').addEventListener('input', roomSearch)

document.querySelector('input#add').addEventListener('change', e => {
  const files = e.target.files
  const uploadAttachment = document.getElementById('upload-attachment')

  for (let it = 0; it < files.length; it++) {
    const edit = document.createElement('span')
    const del = document.createElement('span')
    const div = document.createElement('div')

    edit.classList.add('edit')
    del.classList.add('delete')

    const fileUrl = URL.createObjectURL(files[it])

    if (files[it].type.split('/')[0] == 'audio')
      contentAudio(fileUrl, files[it].name, files[it].type, edit, del, div)
    else if (files[it].type.split('/')[0] == 'image')
      contentImage(fileUrl, edit, del, div, false)
    else if (files[it].type.split('/')[0] == 'video')
      contentVideo(fileUrl, files[it].type, edit, del, div)
    else {
      const size = files[it].size
      const sizeStr = '' + (size < 1024 ? size + ' B' : size < 1048576 ? (size / 1024).toFixed(2) + ' KB' : size < 1073741824 ? (size / 1048576).toFixed(2) + ' MB' : (size / 1073741824).toFixed(2) + ' GB')
      
      contentFile(fileUrl, files[it].name, sizeStr, edit, del, div)
    }

    div.appendChild(edit)
    div.appendChild(del)
    uploadAttachment.appendChild(div)
  }

  if (!uploadAttachment.classList.contains('hide')) return
  
  // Show upload attachment container
  const textEditorContainer = document.getElementById('text-editor-container')
  const uploadAttachmentTrackWrapper = document.getElementById('upload-attachment-track-wrapper')
  const chatContainer = document.getElementById('chat-container')

  // Adjust chat container height
  const additionalHeight = getAdditionalChatContainerHeight() + 7.45
  setAdditionalChatContainerHeight(additionalHeight)
  chatContainer.style.height = `calc(100vh - 7.925em - ${additionalHeight}em)`

  // Adjust caption if attachment container exist
  if (document.getElementById('editing-caption').style.display != 'none') {
    const editingCaption = document.getElementById('editing-caption')
    editingCaption.style.bottom = '11.2em'
  }
  if (document.getElementById('replying-caption').style.display != 'none') {
    const replyingCaption = document.getElementById('replying-caption')
    replyingCaption.style.bottom = '11.2em'
  }

  textEditorContainer.classList.add('send')
    
  uploadAttachmentTrackWrapper.style.display = ''
  e.target.value = ''
  requestAnimationFrame(() => uploadAttachment.classList.remove('hide'))
})

document.querySelector('input#edit').addEventListener('change', e => {
  const parent = document.querySelector('.editingUpload')
  const [file] = e.target.files
  const type = file.type
  const edit = document.createElement('span')
  const del = document.createElement('span')
  const fileUrl = URL.createObjectURL(file)

  parent.innerHTML = ''

  edit.classList.add('edit')
  del.classList.add('delete')

  if (type.split('/')[0] == 'audio')
    contentAudio(fileUrl, file.name, file.type, edit, del, parent)
  else if (type.split('/')[0] == 'image')
    contentImage(fileUrl, edit, del, parent, false)
  else if (type.split('/')[0] == 'video')
    contentVideo(fileUrl, file.type, edit, del, parent)
  else {
    const size = file.size
    const sizeStr = '' + (size < 1024 ? size + ' B' : size < 1048576 ? (size / 1024).toFixed(2) + ' KB' : size < 1073741824 ? (size / 1048576).toFixed(2) + ' MB' : (size / 1073741824).toFixed(2) + ' GB')

    contentFile(fileUrl, file.name, sizeStr, edit, del, parent)
  }

  e.target.value = ''

  parent.appendChild(edit)
  parent.appendChild(del)

  parent.classList.remove('editingUpload')
})

// Handle for all click events
document.addEventListener('click', async e => {
  // Focus to the input when input placeholder is clicked
  const placeholder = document.getElementById('in-placeholder')
  const editable = document.getElementById('editable')

  if (e.target == placeholder) editable.focus()

  if (e.target == placeholder || e.target == editable) {
    const editable = document.getElementById('editable')
    const selection = window.getSelection()
    const range = document.createRange()
    
    range.selectNodeContents(editable)
    range.collapse(false)
    selection.addRange(range)
  }

  // Emoji declare
  const emoji = document.getElementById('emoji')
  const emojii = document.querySelector('#emoji i')
  const emojiii = document.querySelectorAll('#emoji-container *')
  const emojico = document.getElementById('emoji-container')
  const emojiabs = document.getElementById('emoji-container-track-wrapper')

  // Upload declare
  const upload = document.getElementById('upload')
  const uploadd = document.querySelector('#upload i')
  const input = document.querySelector('input#add')

  // Click emoji
  if ((e.target == emoji || e.target == emojii) && emojico.classList.contains('hide')) {
    emojiabs.style.display = ''
    requestAnimationFrame(() => emojico.classList.remove('hide'))
    editable.focus()
    focusOnLastRange()

    return
  } else if ((e.target == emoji || e.target == emojii) && !emojico.classList.contains('hide')) {
    emojico.classList.add('hide')

    emojiabs.addEventListener('transitionend', () => {
      emojiabs.style.display = 'none'
    }, { once: true })

    editable.focus()
    focusOnLastRange()
    return
  }

  // Prevent focus loss on editable when clicking inside emoji container
  const listContainer = document.querySelectorAll('#emoji-list > div')

  if (e.target == emojico || Array.from(listContainer).includes(e.target)) {
    editable.focus()
    focusOnLastRange()
    return
  }

  // Click upload
  if (e.target == upload || e.target == uploadd) {
    input.click()
    editable.focus()
    focusOnLastRange()
    return
  }

  if (e.target == emoji
      || e.target == emojii
      || e.target == emojico
      || Array.from(emojiii).includes(e.target)
      || e.target == editable)
    return

  if (emojico && !emojico.classList.contains('hide')) {
    emojico.classList.add('hide')

    emojico.addEventListener('transitionend', () => {
      emojiabs.style.display = 'none'
    }, { once: true })
  }
})

const onSend = () => {
  const attachment = document.getElementById('upload-attachment').children.length

  if (attachment > 0) closeAttachments()
  closeEmoji()
  enter()
}

document.getElementById('enter').addEventListener('click', onSend)
document.getElementById('editable').addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const attachment = document.getElementById('upload-attachment').children.length

    e.preventDefault()
    e.stopPropagation()

    closeEmoji()
    if (attachment > 0) closeAttachments()
    
    if (getEditingChat())
      cancelEdit()
    else if (getReplyingChat())
      cancelReply()
  }

  if ((e.key === 'Enter' && !e.shiftKey)) {
    e.preventDefault()
    e.stopPropagation()

    onSend()
  }
})

document.getElementById('editable').addEventListener('input', e => {
  const textEditorContainer = document.getElementById('text-editor-container')
  const editable = document.getElementById('editable')
  const placeholder = document.getElementById('in-placeholder')

  if (editable.textContent == '' && editable.getElementsByTagName('br').length < 2) {
    const uploadExist = document.querySelector('#upload-attachment > div')

    placeholder.style.display = ''
    editable.innerHTML = ''
    if (!uploadExist) textEditorContainer.classList.remove('send')
  } else {
    placeholder.style.display = 'none'
    textEditorContainer.classList.add('send')
  }
})
