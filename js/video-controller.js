import { deleteUploadButton, editUploadButton } from "./text-field-controller.js"

let fullscreenIdle = null
let mouseListenscreen = []

/**
 * Resets the idle timeout when the user interacts with the full screen video player.
 * 
 * @param {HTMLElement} controlPanel - The control panel element of the full screen video player.
 * @returns {void}
 */
const idleReset = (controlPanel) => {
  controlPanel.style.bottom = '0'
  clearTimeout(fullscreenIdle)

  fullscreenIdle = setTimeout(idleResetTimeout(controlPanel), 2000)
}

/**
 * Returns a function that resets the control panel position after a timeout.
 * 
 * @param {HTMLElement} controlPanel - The control panel element of the video player.
 * @returns {Function} - A function that resets the control panel position.
 */
const idleResetTimeout = (controlPanel) => {
  return () => {
    const play = controlPanel.parentElement.querySelector('div[play]')

    if (play.classList.contains('played'))
      controlPanel.style.bottom = '-32px'
  }
}

/**
 * Toggles the volume of a video element between mute and unmute.
 * Updates the volume icon and the volume level of the video accordingly.
 * 
 * @param {HTMLElement} click - The click event object that triggers the function.
 * @returns {void}
 */
const volume = (click) => {
  const parent = click.parentElement
  const video = parent.querySelector('video')
  const volume = parent.querySelector('volume')
  const slider = volume.querySelector('input')

  if (video.volume > 0) {
    volume.querySelector('i').setAttribute('class', 'fa-solid fa-volume-xmark')
    volume.setAttribute('last-value', video.volume)
    volume.setAttribute('value', '0')
    slider.value = volume.getAttribute('value')
    video.volume = volume.getAttribute('value')

    const percent = (video.volume / 1) * 100
    const color = `linear-gradient(90deg, var(--silver) ${percent}%, #fff ${percent}%)`
  
    slider.style.background = color
  } else {
    if (volume.getAttribute('last-value') > .5) volume.querySelector('i').setAttribute('class', 'fa-solid fa-volume-high')
    else volume.querySelector('i').setAttribute('class', 'fa-solid fa-volume-low')
    volume.setAttribute('value', volume.getAttribute('last-value') || .1)
    volume.removeAttribute('last-value')
    slider.value = volume.getAttribute('value')
    video.volume = volume.getAttribute('value')

    const percent = (video.volume / 1) * 100
    const color = `linear-gradient(90deg, var(--silver) ${percent}%, #fff ${percent}%)`
  
    slider.style.background = color
  }
}

/**
 * Plays or pauses a video element when a button is clicked and displays the duration of the video.
 * 
 * @param {HTMLElement} click - The button element that is clicked.
 * @returns {void}
 */
const playVideo = (click) => {
  const video = click.parentElement.querySelector('video')
  const duration = click.parentElement.querySelector('duration')
  const sec = String(Math.floor(video.duration % 60)).padStart(2, '0')
  const min = String(Math.floor(video.duration / 60)).padStart(2, '0')

  duration.textContent = `${min}:${sec}`

  if (video.paused) {
    video.play()
  } else {
    video.pause()
  }
}

/**
 * Toggles fullscreen mode for a given element.
 * 
 * @param {HTMLElement} click - The element that triggers the fullscreen mode toggle.
 * @returns {void}
 */
const fullscreenVideo = (click) => {
  const isInFullScreen =
    (document.fullscreenElement && document.fullscreenElement !== null) ||
    (document.webkitFullscreenElement &&
      document.webkitFullscreenElement !== null) ||
    (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
    (document.msFullscreenElement && document.msFullscreenElement !== null)

  const parent = click.parentElement
  const controlPanel = parent.querySelector('div[control-panel]')

  if (!mouseListenscreen.hasOwnProperty(parent))
    mouseListenscreen[parent] = idleReset.bind(null, controlPanel)

  if (!isInFullScreen) {
    if (parent.requestFullscreen) parent.requestFullscreen()
    else if (parent.mozRequestFullScreen) parent.mozRequestFullScreen()
    else if (parent.webkitRequestFullScreen) parent.webkitRequestFullScreen()
    else if (parent.msRequestFullscreen) parent.msRequestFullscreen()

    parent.addEventListener('mousemove', mouseListenscreen[parent])
    parent.addEventListener('mousedown', mouseListenscreen[parent])
  
    fullscreenIdle = setTimeout(idleResetTimeout(controlPanel), 2000)
  } else {
    if (document.exitFullscreen) document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen()
    else if (document.msExitFullscreen) document.msExitFullscreen()

    parent.removeEventListener('mousemove', mouseListenscreen[parent])
    parent.removeEventListener('mousedown', mouseListenscreen[parent])

    delete mouseListenscreen[parent]

    clearTimeout(fullscreenIdle)
  }
}

/**
 * Creates a video element with custom controls and styling.
 * Optional edit and delete functionality can be added to the video.
 * 
 * @param {string} src - The source URL of the video.
 * @param {string} type - The type of the video file.
 * @param {boolean} controls - Optional. Custom controls for the video. Default is `false`.
 * @param {HTMLElement} edit - Optional. The edit button element.
 * @param {HTMLElement} del - Optional. The delete button element.
 * @param {HTMLElement} div - The div element to which the video will be appended.
 * @returns {void}
 */
export const contentVideo = (src, type, edit, del, div) => {
  let video = document.createElement('video')

  video.innerHTML = `<source src="${src}" type="${type}">`
  
  // Give custom controls for the video
  if (!edit && !del) {
    const play = document.createElement('div')
    const controlPanel = document.createElement('div')
    const originalVideo = video
    let inputDown = false

    // Make the video as the wrapper instead
    video = document.createElement('div')

    video.setAttribute('video-wrapper', '')
    video.setAttribute('tabindex', '0')
    play.setAttribute('play', '')
    play.onclick = () => playVideo(play)
    play.ondblclick = () => fullscreenVideo(play)
    controlPanel.setAttribute('control-panel', '')
    originalVideo.onclick = () => playVideo(originalVideo)
    originalVideo.ondblclick = () => fullscreenVideo(originalVideo)

    play.innerHTML = '<i class="fa-solid fa-play"></i>'
    const inPlay = document.createElement('play')
    inPlay.onclick = () => playVideo(inPlay.parentElement)
    const playIcon = document.createElement('i')
    playIcon.classList.add('fa-solid', 'fa-play')
    inPlay.appendChild(playIcon)

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

    const fullscreen = document.createElement('fullscreen')
    fullscreen.onclick = () => fullscreenVideo(fullscreen.parentElement)
    const fullscreenIcon = document.createElement('i')
    fullscreenIcon.classList.add('fa-solid', 'fa-expand')
    fullscreen.appendChild(fullscreenIcon)

    controlPanel.appendChild(inPlay)
    controlPanel.appendChild(span)
    controlPanel.appendChild(input)
    controlPanel.appendChild(volumeEl)
    controlPanel.appendChild(fullscreen)

    // Add listener for video duration change
    originalVideo.addEventListener('timeupdate', () => {
      const currentTime = (originalVideo.currentTime / originalVideo.duration) * 100
      const color = `linear-gradient(90deg, var(--silver) ${currentTime}%, #fff ${currentTime}%)`
      const current = video.querySelector('current')
      const sec = String(Math.floor(originalVideo.currentTime % 60)).padStart(2, '0')
      const min = String(Math.floor(originalVideo.currentTime / 60)).padStart(2, '0')
    
      current.textContent = `${min}:${sec}`

      controlPanel.querySelector('input').style.background = color
      controlPanel.querySelector('input').value = currentTime
    })

    // Add some listener for play/pause/end
    originalVideo.addEventListener('ended', () => {
      play.classList.remove('played')
      originalVideo.classList.add('ended')
      inPlay.innerHTML = '<i class="fa-solid fa-repeat"></i>'
    })

    originalVideo.addEventListener('play', () => {
      inPlay.innerHTML = '<i class="fa-solid fa-pause"></i>'
      play.classList.add('played')
      originalVideo.classList.remove('ended')
      controlPanel.classList.add('everplayed')
      inputDown = false
    })

    originalVideo.addEventListener('pause', () => {
      if (!inputDown) {
        inPlay.innerHTML = '<i class="fa-solid fa-play"></i>'
        play.classList.remove('played')
      }
    })

    // Add listener for slider change
    controlPanel.querySelector('input').addEventListener('input', () => {
      const seekTime = (originalVideo.duration * (controlPanel.querySelector('input').value / 100))
      const percent = (originalVideo.currentTime / originalVideo.duration) * 100
      const color = `linear-gradient(90deg, var(--silver) ${percent}%, #fff ${percent}%)`

      controlPanel.querySelector('input').style.background = color
      if (originalVideo.classList.contains('ended')) {
        miniPlay.innerHTML = '<i class="fa-solid fa-play"></i>'
        originalVideo.classList.remove('ended')        
      }
      originalVideo.currentTime = seekTime
    })

    // For volume UI update
    const volumePut = controlPanel.querySelector('volume input')
    const volumeCon = controlPanel.querySelector('volume i')

    const updateVolumeUI = () => {
      const percent = (originalVideo.volume / 1) * 100
      const color = `linear-gradient(90deg, var(--silver) ${percent}%, #fff ${percent}%)`
    
      volumePut.style.background = color
      
      if (originalVideo.volume > 0.5) {
        volumeCon.setAttribute('class', 'fa-solid fa-volume-high')
      } else if (originalVideo.volume === 0) {
        volumeCon.setAttribute('class', 'fa-solid fa-volume-xmark')
      } else {
        volumeCon.setAttribute('class', 'fa-solid fa-volume-low')
      }
    
      volumePut.value = originalVideo.volume
    }
    
    volumePut.addEventListener('input', () => {
      originalVideo.volume = volumePut.value
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
    
      originalVideo.volume = currentValue
      updateVolumeUI()
    })

    // add listener for slider on hold
    controlPanel.querySelector('input').addEventListener('mousedown', () => {
      inputDown = true
      originalVideo.pause()
    })

    // Add listener for key
    video.addEventListener("keydown", e => {
      switch (e.key) {
        case 'ArrowLeft':
          originalVideo.currentTime -= 5
          if (originalVideo.classList.contains('ended')) {
            originalVideo.classList.remove('ended')
            miniPlay.innerHTML = '<i class="fa-solid fa-play"></i>'
          }
          break
        case 'ArrowRight':
          originalVideo.currentTime += 5
          break
        case ' ':
          playVideo(originalVideo)
          break
      }
    })

    // Add listener for fullscreen change
    video.addEventListener("fullscreenchange", () => {
      const fullCon = video.querySelector('fullscreen')

      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
        video.style.borderRadius = '0'
        originalVideo.style.borderRadius = '0'
        originalVideo.style.maxHeight = '100vh'
        originalVideo.style.maxWidth = '100vw'
        originalVideo.style.height = '100vh'
        originalVideo.style.width = '100vw'
        originalVideo.style.objectFit = 'cover'
        controlPanel.style.bottom = '0'

        play.classList.add('full')

        fullCon.innerHTML = '<i class="fa-solid fa-compress"></i>'
      } else {
        video.removeAttribute('style')
        originalVideo.removeAttribute('style')
        controlPanel.removeAttribute('style')
        
        play.classList.remove('full')

        fullCon.innerHTML = '<i class="fa-solid fa-expand"></i>'
      }
    })

    controlPanel.querySelector('input').addEventListener('mouseup', () => {
      if (play.classList.contains('played'))
        originalVideo.play()
    })

    video.appendChild(originalVideo)
    video.appendChild(controlPanel)
    video.appendChild(play)
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

  div.appendChild(video)
}
