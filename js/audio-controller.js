import { deleteUploadButton, editUploadButton } from "./text-field-controller.js"

/**
 * Toggles the volume of the audio between mute and the last set volume.
 * Updates the volume icon and slider accordingly.
 * 
 * @param {HTMLElement} click - The volume icon element that was clicked.
 * @return {void}
 */
const volume = (click) => {
  const parent = click.parentElement
  const audio = parent.querySelector('audio')
  const volume = parent.querySelector('volume')
  const slider = volume.querySelector('input')

  if (audio.volume > 0) {
    volume.querySelector('i').setAttribute('class', 'fa-solid fa-volume-xmark')
    volume.setAttribute('last-value', audio.volume)
    volume.setAttribute('value', '0')
    slider.value = volume.getAttribute('value')
    audio.volume = volume.getAttribute('value')

    const percent = (audio.volume / 1) * 100
    const color = `linear-gradient(90deg, var(--silver) ${percent}%, #fff ${percent}%)`
  
    slider.style.background = color
  } else {
    if (volume.getAttribute('last-value') > .5) volume.querySelector('i').setAttribute('class', 'fa-solid fa-volume-high')
    else volume.querySelector('i').setAttribute('class', 'fa-solid fa-volume-low')
    volume.setAttribute('value', volume.getAttribute('last-value') || .1)
    volume.removeAttribute('last-value')
    slider.value = volume.getAttribute('value')
    audio.volume = volume.getAttribute('value')

    const percent = (audio.volume / 1) * 100
    const color = `linear-gradient(90deg, var(--silver) ${percent}%, #fff ${percent}%)`
  
    slider.style.background = color
  }
}

/**
 * Plays or pauses the audio when the play button is clicked.
 * Updates the duration display accordingly.
 * 
 * @param {HTMLElement} click - The play button element that was clicked.
 * @return {void}
 */
const playAudio = (click) => {
  const audio = click.parentElement.querySelector('audio')
  const duration = click.parentElement.querySelector('duration')
  const sec = String(Math.floor(audio.duration % 60)).padStart(2, '0')
  const min = String(Math.floor(audio.duration / 60)).padStart(2, '0')

  duration.textContent = `${min}:${sec}`

  if (audio.paused) {
    audio.play()
  } else {
    audio.pause()
  }
}

/**
 * Creates and appends audio content elements to a given div.
 * Optional edit and delete functionality can be added to the audio.
 *
 * @param {string} src - The source URL of the audio.
 * @param {string} name - The name of the audio file.
 * @param {string} type - The MIME type of the audio file.
 * @param {HTMLElement} edit - Optional. The edit button element.
 * @param {HTMLElement} del - Optional. The delete button element.
 * @param {HTMLElement} div - The div element to which the audio content will be appended.
 * @returns {void}
 */
export const contentAudio = (src, name, type, edit, del, div) => {
  const i = document.createElement('i')
  const desc = document.createElement('span')

  let audio = document.createElement('audio')
  
  audio.innerHTML = `<source src="${src}" type="${type}">`
  audio.style.display = 'none'

  i.classList.add('fa-solid', 'fa-file-audio', 'file-icon-audio')
  desc.classList.add('desc')
  desc.innerHTML = name

  div.appendChild(audio)
  div.appendChild(i)
  div.appendChild(desc)

  // Give custom controls for the audio
  if (!del && !edit) {
    audio.style.display = ''
    i.style.display = 'none'
    desc.style.display = 'none'

    const controlPanel = document.createElement('div')
    const originalAudio = audio
    let inputDown = false

    // Make the audio as the wrapper instead
    audio = document.createElement('div')

    audio.setAttribute('audio-wrapper', '')
    audio.setAttribute('tabindex', '0')
    controlPanel.setAttribute('control-panel', '')
    
    const play = document.createElement('play')
    play.onclick = () => playAudio(play.parentElement)
    const playIcon = document.createElement('i')
    playIcon.classList.add('fa-solid', 'fa-play')
    play.appendChild(playIcon)
    
    const span = document.createElement('span')
    const current = document.createElement('current')
    current.textContent = '00:00'
    const slash = document.createTextNode('/')
    const duration = document.createElement('duration')
    duration.textContent = '00:00'
    span.appendChild(current)
    span.appendChild(slash)
    span.appendChild(duration)

    const input = document.createElement('input')
    input.type = 'range'
    input.min = '0'
    input.max = '100'
    input.step = '0.1'
    input.value = '0'

    const volumeEl = document.createElement('volume')
    volumeEl.value = '1'
    const volumeIcon = document.createElement('i')
    volumeIcon.classList.add('fa-solid', 'fa-volume-high')
    volumeIcon.onclick = () => volume(volumeEl.parentElement.parentElement)
    const volumeInput = document.createElement('input')
    volumeInput.type = 'range'
    volumeInput.min = '0'
    volumeInput.max = '1'
    volumeInput.step = '0.01'
    volumeInput.value = '1'
    volumeEl.appendChild(volumeIcon)
    volumeEl.appendChild(volumeInput)

    controlPanel.appendChild(play)
    controlPanel.appendChild(span)
    controlPanel.appendChild(input)
    controlPanel.appendChild(volumeEl)

    // Add listener for audio duration change
    originalAudio.addEventListener('timeupdate', () => {
      const currentTime = (originalAudio.currentTime / originalAudio.duration) * 100
      const color = `linear-gradient(90deg, var(--silver) ${currentTime}%, #fff ${currentTime}%)`
      const current = audio.querySelector('current')
      const sec = String(Math.floor(originalAudio.currentTime % 60)).padStart(2, '0')
      const min = String(Math.floor(originalAudio.currentTime / 60)).padStart(2, '0')
    
      current.textContent = `${min}:${sec}`

      controlPanel.querySelector('input').style.background = color
      controlPanel.querySelector('input').value = currentTime
    })

    // Add some listener for play/pause/end
    originalAudio.addEventListener('ended', () => {
      play.classList.remove('played')
      originalAudio.classList.add('ended')
      play.innerHTML = '<i class="fa-solid fa-repeat"></i>'
    })

    originalAudio.addEventListener('play', () => {
      play.innerHTML = '<i class="fa-solid fa-pause"></i>'
      play.classList.add('played')
      originalAudio.classList.remove('ended')
      controlPanel.classList.add('everplayed')
      inputDown = false
    })

    originalAudio.addEventListener('pause', () => {
      if (!inputDown) {
        play.innerHTML = '<i class="fa-solid fa-play"></i>'
        play.classList.remove('played')
      }
    })

    // Add listener for slider change
    controlPanel.querySelector('input').addEventListener('input', () => {
      const seekTime = (originalAudio.duration * (controlPanel.querySelector('input').value / 100))
      const percent = (originalAudio.currentTime / originalAudio.duration) * 100
      const color = `linear-gradient(90deg, var(--silver) ${percent}%, #fff ${percent}%)`

      controlPanel.querySelector('input').style.background = color
      if (originalAudio.classList.contains('ended')) {
        play.innerHTML = '<i class="fa-solid fa-play"></i>'
        originalAudio.classList.remove('ended')        
      }
      originalAudio.currentTime = seekTime
    })

    // For volume UI update
    const volumePut = controlPanel.querySelector('volume input')
    const volumeCon = controlPanel.querySelector('volume i')

    const updateVolumeUI = () => {
      const percent = (originalAudio.volume / 1) * 100
      const color = `linear-gradient(90deg, var(--silver) ${percent}%, #fff ${percent}%)`
    
      volumePut.style.background = color
      
      if (originalAudio.volume > 0.5) {
        volumeCon.setAttribute('class', 'fa-solid fa-volume-high')
      } else if (originalAudio.volume === 0) {
        volumeCon.setAttribute('class', 'fa-solid fa-volume-xmark')
      } else {
        volumeCon.setAttribute('class', 'fa-solid fa-volume-low')
      }
    
      volumePut.value = originalAudio.volume
    }
    
    volumePut.addEventListener('input', () => {
      originalAudio.volume = volumePut.value
      updateVolumeUI()
    })
    
    volumePut.addEventListener('wheel', e => {
      const step = 0.2
      let currentValue = parseFloat(volumePut.value)
    
      if (e.deltaY > 0) {
        currentValue = Math.max(currentValue - step, 0)
      } else {
        currentValue = Math.min(currentValue + step, 1)
      }
    
      originalAudio.volume = currentValue
      updateVolumeUI()
    })

    // Add listener for slider on hold
    controlPanel.querySelector('input').addEventListener('mousedown', () => {
      inputDown = true
      originalAudio.pause()
    })

    controlPanel.querySelector('input').addEventListener('mouseup', () => {
      if (play.classList.contains('played'))
        originalAudio.play()
    })

    audio.appendChild(originalAudio)
    audio.appendChild(controlPanel)

    div.appendChild(audio)
  }

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
}
