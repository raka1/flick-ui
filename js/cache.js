export const defaultCubic = 'cubic-bezier(0.075, 0.82, 0.165, 1) .5s'
export const myId = 1

let iId
export const getIId = () => iId
export const setIId = (value) => {
  iId = value
}

let dataUsers
export const getDataUsers = () => dataUsers
export const setDataUsers = (value) => {
  dataUsers = value
}

let dataChats
export const getDataChats = () => dataChats
export const setDataChats = (value) => {
  dataChats = value
}

let dataEmojis
export const getDataEmojis = () => dataEmojis
export const setDataEmojis = (value) => {
  dataEmojis = value
}

let selectedEmojiCategory
export const getSelectedEmojiCategory = () => selectedEmojiCategory
export const setSelectedEmojiCategory = (value) => {
  selectedEmojiCategory = value
}

let editingChat = null
export const getEditingChat = () => editingChat
export const setEditingChat = (value) => {
  editingChat = value
}

let replyingChat = null
export const getReplyingChat = () => replyingChat
export const setReplyingChat = (value) => {
  replyingChat = value
}

let additionalChatContainerHeight = 0
export const getAdditionalChatContainerHeight = () => additionalChatContainerHeight
export const setAdditionalChatContainerHeight = (value) => {
  additionalChatContainerHeight = value
}
