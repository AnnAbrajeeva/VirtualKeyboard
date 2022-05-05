class Key {
  constructor({ small, big, code }) {
    this.small = small;
    this.big = big;
    this.code = code;

    this.button = document.createElement("div");
    this.button.classList.add("button");

    const textBlock = document.createElement("div");
    textBlock.classList.add("button__text");

    this.activeLetter = document.createElement("span");
    this.disableLetter = document.createElement("span");

    this.disableLetter.classList.add("button__letter-top", "disable");
    this.activeLetter.classList.add("button__letter-bottom", "active");

    if (big !== null && !small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
      this.activeLetter.innerHTML = small;
      this.disableLetter.innerHTML = big;
     
    } else if(big === null && code === 'MetaLeft') {
      console.log(123)
      this.activeLetter.innerHTML = '<img src="./assets/img/volume.png" alt="volume" />'
      this.button.classList.add("btn-func", "btn-img");
    } else if (big === null && code !== 'Space') {
      this.activeLetter.innerHTML = small; 
      this.disableLetter.innerHTML = '' 
      this.button.classList.add("btn-func");
    }  else {
      this.activeLetter.innerHTML = small; 
      this.disableLetter.innerHTML = ""
      this.activeLetter.style.alignSelf = "center";
    }

    this.button.setAttribute('data-key', code)

    textBlock.append(this.disableLetter);
    textBlock.append(this.activeLetter);
    this.button.append(textBlock);
  }
}

export default Key;
