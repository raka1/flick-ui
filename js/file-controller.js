import { deleteUploadButton, editUploadButton } from "./text-field-controller.js"

/**
 * Creates and appends a content element to a parent element.
 * 
 * @param {string} src - The source URL of the content.
 * @param {string} name - The name of the content.
 * @param {string} size - The size of the content.
 * @param {HTMLElement} edit - Optional. The edit button element.
 * @param {HTMLElement} del - Optional. The delete button element.
 * @param {HTMLElement} div - The div element to which the video will be appended.
 * @returns {void}
 */
export const contentFile = (src, name, size, edit, del, div) => {
  const i = document.createElement('i')
  const desc = document.createElement('span')
  const blob = document.createElement('span')
  const sizeEl = document.createElement('span')
  const download = document.createElement('span')

  i.classList.add('fa-regular', 'fa-file')
  blob.classList.add('blob')
  desc.classList.add('desc')
  sizeEl.classList.add('size')
  download.classList.add('download')

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

  desc.innerHTML = name
  blob.innerHTML = src
  sizeEl.innerHTML = size
  download.innerHTML = '<i class="fa-solid fa-download"></i>'

  div.appendChild(i)
  div.appendChild(desc)
  div.appendChild(blob)
  div.appendChild(sizeEl)
  div.appendChild(download)

  if (!edit && !del) div.onclick = () => {
    const a = document.createElement('a')
    a.href = src
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
