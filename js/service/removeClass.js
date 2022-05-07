export default function removeClass(key, code, isTrue) {
    const keyCode = new RegExp(`${code}`) 
    if(key.code.match(keyCode) && !isTrue && key.button.classList.contains('on')) {
        key.button.classList.remove('on')
      }
}