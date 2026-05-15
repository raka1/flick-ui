import { deleteUploadButton, editUploadButton } from "./text-field-controller.js"
import { defaultCubic } from "./cache.js"

let x, y

/**
 * Creates a modal-like view for an element when it is clicked.
 * It creates a fake element to cover the original element, adds a closer element to close the modal,
 * and adjusts the position and size of the original element to make it appear as a modal.
 * 
 * @param {HTMLElement} element - The element that is clicked and needs to be viewed as a modal.
 * @returns {void}
 */
const viewImage = (element) => {
  const faker = document.createElement('div')
  const closer = document.createElement('div')
  const rect = element.getBoundingClientRect()

  faker.classList.add('faker')
  closer.classList.add('closer')
  element.classList.add('view')

  faker.style.height = rect.height + 'px'
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

  element.parentElement.append(closer)
  element.parentElement.append(faker)

  element.style.position = 'fixed'
  element.style.top = rect.top + 'px'
  element.style.left = rect.left + 'px'
  element.style.transform = 'translate(0, 0)'
  element.style.zIndex = '2'

  x = rect.left
  y = rect.top

  element.onclick = null
  closer.onclick = closeImage

  requestAnimationFrame(() => {
    closer.style.visibility = 'visible'
    closer.style.opacity = '.5'
    element.style.top = '50%'
    element.style.left = '50%'
    element.style.transform = 'translate(-50%, -50%)'
    element.style.borderRadius = '0'
    element.style.maxHeight = '80vh'
    element.style.maxWidth = '80vw'
  })
}

/**
 * Closes the expanded view of an element.
 * Restores the element's original position and size, removes the overlay, and reverts the click event listener.
 * 
 * @returns {void}
 */
const closeImage = () => {
  const view = document.querySelector('.view')
  const faker = document.querySelector('.faker')
  const closer = document.querySelector('.closer')
  
  view.style.left = x + 'px'
  view.style.top = y + 'px'
  view.style.removeProperty('transform')
  view.style.removeProperty('border-radius')
  view.style.removeProperty('max-height')
  view.style.removeProperty('max-width')
  closer.style.visibility = 'hidden'
  closer.style.opacity = '0'

  closer.addEventListener('transitionend', () => {
    faker.remove()
    closer.remove()
  
    view.removeAttribute('style')

    view.onclick = () => viewImage(view)
    view.classList.remove('view')    
  }, { once: true })
}

/**
 * Creates an image element and appends it to a given div element. 
 * Optional edit and delete functionality can be added to the image.
 * 
 * @param {string} src - The source URL of the image.
 * @param {HTMLElement} edit - Optional. The edit button element.
 * @param {HTMLElement} del - Optional. The delete button element.
 * @param {HTMLElement} div - The div element to which the image will be appended.
 * @param {boolean} view - Optional. Indicates whether the image should have a click event listener for viewing.
 * @returns {void}
 */
export const contentImage = (src, edit, del, div, view) => {
  const img = document.createElement('img')
      
  img.src = src
  if (view) img.onclick = () => viewImage(img)

  if (edit) {
    edit.setAttribute('title', 'Edit')
    edit.onclick = () => editUploadButton(edit)
    edit.innerHTML = '<i class="fa-solid fa-pen"></i>'
  }
  
  if (del) {
    del.setAttribute('title', 'Delete')
    del.onclick = () => deleteUploadButton(del)
    del.innerHTML = '<i class="fa-solid fa-trash"></i>'
  }

  div.appendChild(img)
}
