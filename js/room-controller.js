import { defaultCubic } from "./cache.js"

/**
 * Filters the list of chat rooms based on the search query entered in the search input field.
 * It shows only the rooms whose names include the search query (case-insensitive).
 * 
 * @return {void}
 */
export const roomSearch = () => {
  const query = document.querySelector('input#search-message').value
  const rooms = document.querySelectorAll('div#room > div')

  rooms.forEach(room => {
    const name = room.querySelector('div[name]').innerText.toLowerCase()
    if (name.includes(query.toLowerCase())) {
      room.style.display = ''
    } else {
      room.style.display = 'none'
    } 
  })
}

/**
 * Inserts an element into the 'room' container in order based on its 'order' attribute.
 * 
 * @param {HTMLElement} element - The element to be inserted.
 * @return {void}
 */
export const roomInsert = (element) => {
  const room = document.getElementById('room')

  for (let i = 0; i < room.children.length; i++) {
    if (element.getAttribute('order') > room.children[i].getAttribute('order')) {
      room.insertBefore(element, room.children[i])
      return
    } else continue
  }

  room.appendChild(element)
}

/**
 * Shifts an element to the top of a container by animating the transition of the element and the other elements in the container.
 * 
 * @param {HTMLElement} element - The element that needs to be shifted to the top of the container.
 * @returns {void}
 */
export const shiftUp = (element) => {
  const room = document.getElementById('room')
  let count = 0
  let childs = []


  if (room.children[0] == element)
    return
  else
    element.style.transition = 'transform ' + defaultCubic

  for (let i = 0; i < room.children.length; i++) {
    if (element == room.children[i] && i !== 0) {
      requestAnimationFrame(() => {
        element.style.transform = `translateY(-${count * element.getBoundingClientRect().height}px)`
        childs.forEach(child => {
          child.style.transform = `translateY(${child.getBoundingClientRect().height}px)`
        })
      })
      break // Exit the loop once the target element is found
    } else {
      const child = room.children[i]
      child.style.transition = 'transform ' + defaultCubic
      count++
      childs.push(child)
    }
  }

  element.addEventListener('transitionend', () => {
    element.style.transition = ''
    element.style.transform = ''

    childs.forEach(child => {
      child.style.transition = ''
      child.style.transform = ''
    })

    room.prepend(element)
  }, { once: true })
}
