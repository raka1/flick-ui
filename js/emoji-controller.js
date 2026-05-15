import { setSelectedEmojiCategory } from './cache.js'

/**
 * Handles the selection of an emoji category, updating the displayed emojis and active category styling.
 * 
 * @param {string} category - The selected emoji category.
 * @return {void}
 */
export const selectEmojiCategory = (category) => {
  const emojiContainer = document.getElementById('emoji-container')
  const emojis = emojiContainer.querySelectorAll('#emoji-right > div')
  const categoryElements = emojiContainer.querySelectorAll('#emoji-left > div')

  emojis.forEach(emoji => {
    if (emoji.getAttribute('data-category') === category) {
      emoji.style.display = ''
    } else {
      emoji.style.display = 'none'
    }
  })

  categoryElements.forEach(catEl => {
    if (catEl.getAttribute('data-category') === category) {
      catEl.classList.add('active')
    } else {
      catEl.classList.remove('active')
    }
  })

  setSelectedEmojiCategory(category)
}

/**
 * Handles the input event for the emoji search bar, filtering emojis based on the search query.
 * 
 * @param {Event} event - The input event triggered by the search bar.
 * @return {void}
 */
export const searchEmojiInput = (event) => {
  const query = event.target.value.toLowerCase()
  const emojiContainer = document.getElementById("emoji-container")
  const emojis = emojiContainer.querySelectorAll("#emoji-right > div")

  emojis.forEach((emoji) => {
    if (
      emoji.getAttribute("data-description").toLowerCase().includes(query) ||
      emoji.getAttribute("data-aliases").toLowerCase().includes(query) ||
      emoji.getAttribute("data-tags").toLowerCase().includes(query)
    ) {
      emoji.style.display = ""
    } else {
      emoji.style.display = "none"
    }
  })

  const emojiList = emojiContainer.querySelector("#emoji-list")

  if (query.length > 0) emojiList.classList.add("searching")
  else {
    emojiList.classList.remove("searching")
    emojis.forEach((emoji) => {
      if (emoji.getAttribute("data-category") !== getSelectedEmojiCategory())
        emoji.style.display = "none"
    })
  }
}

/**
 * Hides the emoji container and track absolute element when the emoji button is clicked.
 * 
 * @returns {void}
 */
export const closeEmoji = () => {
  const emojico = document.getElementById('emoji-container')

  if (!emojico.classList.contains('hide')) {
    const emojiabs = document.getElementById('emoji-container-track-wrapper')

    emojico.classList.add('hide')

    emojico.addEventListener('transitionend', () => {
      emojiabs.style.display = 'none'
    }, { once: true })
  }
}
