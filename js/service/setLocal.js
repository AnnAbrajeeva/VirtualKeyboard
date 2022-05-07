export function setLocalStorage(value) {
   localStorage.setItem('lang', JSON.stringify(value))
}

export function getLocalStorage() {
    const lang = JSON.parse(localStorage.getItem('lang'))
    return lang
}
