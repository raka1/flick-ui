/**
 * Formats a given date into a readable string.
 * @param {Date} date - The date to format.
 * @return {string} The formatted date string.
 */
export const formatDate = (date) => {
  const now = new Date()
  const dd = ('0' + date.getDate()).slice(-2)
  const mm = ('0' + (date.getMonth() + 1)).slice(-2)
  const yyyy = date.getFullYear()
  const h = ('0' + date.getHours()).slice(-2)
  const m = ('0' + date.getMinutes()).slice(-2)
  let rDate = ''

  if (now.getDate() == date.getDate() && now.getMonth() == date.getMonth() && now.getFullYear() == date.getFullYear()) {
    rDate = `Today`
  } else if (Math.floor(now.getTime()/86400000) - 1 == Math.floor(date.getTime()/86400000)) {
    rDate = `Yesterday`
  } else if (now.getFullYear() == date.getFullYear()) {
    rDate = `${dd}/${mm}`
  } else {
    rDate = `${dd}/${mm}/${yyyy}`
  }

  return `${rDate} ${h}:${m}`
}

/**
 * Converts raw text with newlines into a div element with structured line breaks.
 * @param {string} rawText - The raw text input.
 * @return {HTMLElement} A div element containing the formatted text.
 */
export const rawText2textDiv = rawText => {
  const splits = rawText.split('\n')
  const textDiv = document.createElement('div')

  for (let i = 0; i < splits.length; i++) {
    textDiv.innerHTML = `${textDiv.innerHTML}<div>${splits[i].trim() ? splits[i].trim() : '&nbsp;'}</div>`
  }

  return textDiv
}