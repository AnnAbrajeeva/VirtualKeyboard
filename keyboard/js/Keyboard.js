/* eslint-disable import/extensions */
import Key from "./Key.js";
import * as storage from "./service/setLocal.js";
import langs from "./lang/lang.js";
import removeClass from "./service/removeClass.js";

class Keyboard {
  constructor() {
    this.keyPad = [
      [
        "Backquote",
        "Digit1",
        "Digit2",
        "Digit3",
        "Digit4",
        "Digit5",
        "Digit6",
        "Digit7",
        "Digit8",
        "Digit9",
        "Digit0",
        "Minus",
        "Equal",
        "Backspace",
      ],
      [
        "Tab",
        "KeyQ",
        "KeyW",
        "KeyE",
        "KeyR",
        "KeyT",
        "KeyY",
        "KeyU",
        "KeyI",
        "KeyO",
        "KeyP",
        "BracketLeft",
        "BracketRight",
        "Backslash",
        "Delete",
      ],
      [
        "CapsLock",
        "KeyA",
        "KeyS",
        "KeyD",
        "KeyF",
        "KeyG",
        "KeyH",
        "KeyJ",
        "KeyK",
        "KeyL",
        "Semicolon",
        "Quote",
        "Enter",
      ],
      [
        "ShiftLeft",
        "KeyZ",
        "KeyX",
        "KeyC",
        "KeyV",
        "KeyB",
        "KeyN",
        "KeyM",
        "Comma",
        "Period",
        "Slash",
        "ArrowUp",
        "ShiftRight",
      ],
      [
        "ControlLeft",
        "MetaLeft",
        "AltLeft",
        "Space",
        "AltRight",
        "ArrowLeft",
        "ArrowDown",
        "ArrowRight",
        "ControlRight",
      ],
    ];
    this.capsLock = false;
    this.isShift = false;
    this.isAlt = false;
    this.isCtrl = false;
  }

  createKeyboardWrapper(lang) {
    const main = document.createElement("main");

    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");

    const display = document.createElement("div");
    display.classList.add("display");

    this.displayWrapper = document.createElement("textarea");
    this.displayWrapper.classList.add("display__wrapper");
    this.displayWrapper.setAttribute(
      "placeholder",
      "Виртуальная клавиатура под Windows.\nСмена раскладки - Shift + Alt"
    );

    display.append(this.displayWrapper);
    wrapper.append(display);

    this.keyboard = document.createElement("div");
    this.keyboard.classList.add("keyboard");
    this.keyboard.setAttribute("data-lang", lang);

    this.keyboardInner = this.createKeyboard(langs[lang]);

    this.keyboard.append(this.keyboardInner);
    wrapper.append(this.keyboard);

    main.append(wrapper);
    document.body.append(main);

    this.end = this.displayWrapper.selectionStart;
  }

  createKeyboard(lang) {
    this.keyPressed = [];
    const keyboardWrapper = document.createElement("div");
    keyboardWrapper.classList.add("keyboard__wrapper");

    this.keyPad.forEach((rows) => {
      const row = document.createElement("div");
      row.classList.add("row");
      rows.forEach((key) => {
        const keyValue = lang.find((item) => item.code === key);
        const button = new Key(keyValue);

        this.keyPressed.push(button);
        row.append(button.button);
      });
      keyboardWrapper.append(row);
    });

    document.addEventListener("keydown", this.keyPrint);
    document.addEventListener("keyup", this.keyPrint);

    this.keyboard.addEventListener("mousedown", this.mouseClick);
    this.keyboard.addEventListener("mouseup", this.mouseClick); 
    
    this.start = this.displayWrapper.selectionStart;
    this.end = this.displayWrapper.selectionEnd;

    return keyboardWrapper;

   
  }

  mouseClick = (e) => {
    const btn = e.target.closest(".button");
    const code = btn.dataset.key;
    this.keyPrint({ code, type: e.type });
  };

  keyPrint = (e) => {
    const pressed = this.keyPressed.find((key) => key.code === e.code);
    this.displayWrapper.focus();
    if (!pressed) return;

    if (pressed) {
      if (e.repeat) {
        return;
      }
      if (e.preventDefault) e.preventDefault();
      if (e.type === "keydown" || e.type === "mousedown") {
        pressed.button.classList.add("pressed");
        pressed.button.classList.add("on");
        this.addSound(e);

        if (e.code.match("Shift")) {
          this.isShift = !this.isShift;
          if (this.isShift) {
            // Смена регистра
            this.changeRegister(e);
            pressed.button.classList.add("on");
          } else {
            pressed.button.classList.remove("on");
            this.changeRegister(e);
          }
        }

        if (e.code.match("Alt")) {
          if (e.repeat) {
            this.audio.pause();
          }
          this.isAlt = !this.isAlt;
        }

        if (e.code.match("Caps")) {
          this.capsLock = !this.capsLock;
          if (this.capsLock) {
            pressed.button.classList.add("on");
          } else {
            pressed.button.classList.remove("on");
          }
          this.changeRegister();
        }

        // Смена языка
        if (e.code.match("Alt") && this.isShift) {
          this.changeLang();
          this.isShift = false;
          this.isAlt = false;
          this.changeRegister();
        }
        if (e.code.match("Shift") && this.isAlt) {
          this.changeLang();
          this.isShift = false;
          this.isAlt = false;
          this.changeRegister();
        }

        if (!this.capsLock) {
          this.printLetter(pressed, this.isShift ? pressed.big : pressed.small);
        } else if (this.isShift) {
          this.changeRegister();
          this.printLetter(
            pressed,
            pressed.disableLetter.innerHTML ? pressed.big : pressed.small
          );
        } else {
          this.printLetter(
            pressed,
            !pressed.disableLetter.innerHTML ? pressed.big : pressed.small
          );
        }

       
        if (this.isShift && e.code.match(/Arrow/)) {
          this.setSelection(e)
        }

        // Отжатие клавиши
      } else if (e.type === "keyup" || e.type === "mouseup") {
        if(e.type === "keyup") {
          if (
            e.code === "ShiftLeft" ||
            e.code === "ShiftRight" ||
            e.code === "AltLeft" ||
            e.code === "AltRight"
          ) {
            this.isShift = false
            this.isAlt = false
            this.changeRegister()
            pressed.button.classList.remove("on");
          }
        }

        if (
          e.code !== "CapsLock" &&
          e.code !== "ShiftLeft" &&
          e.code !== "ShiftRight" &&
          e.code !== "AltLeft" &&
          e.code !== "AltRight"
        ) {
          pressed.button.classList.remove("on");
        }

        this.keyPressed.forEach((key) => {
          removeClass(key, "Shift", this.isShift);
          removeClass(key, "Alt", this.isAlt);
        });
        pressed.button.classList.remove("pressed");
      }
    }
  };

  setSelection(e) {
    let start = this.displayWrapper.selectionStart
    let end = this.displayWrapper.selectionEnd
    if(e.code === 'ArrowRight') {
      start = this.displayWrapper.selectionStart
      end += 1
      this.displayWrapper.setSelectionRange(start, end)
    } else if(start > 0) {
        start -= 1
        this.displayWrapper.setSelectionRange(start, end)
      }
  }

  changeLang() {
    let useLang = this.keyboard.getAttribute("data-lang");
    if (useLang === "ru") {
      useLang = "en";
      storage.setLocalStorage(useLang);
      this.keyboard.setAttribute("data-lang", useLang);
    } else {
      useLang = "ru";
      storage.setLocalStorage(useLang);
      this.keyboard.setAttribute("data-lang", useLang);
    }

    this.keyPressed.forEach((k) => {
      const key = k;
      const button = langs[useLang].find((item) => key.code === item.code);
      if (!button) return;
      key.small = button.small;
      key.big = button.big;

      if (button.big !== null && !button.small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
        key.activeLetter.innerHTML = button.small;
        key.disableLetter.innerHTML = button.big;
      } else if (button.big === null) {
        key.activeLetter.innerHTML = button.small;
        key.disableLetter.innerHTML = "";
      } else {
        key.activeLetter.innerHTML = button.small;
        key.disableLetter.innerHTML = "";
      }
    });
  }

  changeRegister() {
    this.keyPressed.forEach((k) => {
      const key = k;

      if (this.isShift) {
        if (key.big !== null && !key.small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
          key.disableLetter.classList.remove("disable");
          key.disableLetter.classList.add("active");

          key.activeLetter.classList.remove("active");
          key.activeLetter.classList.add("disable");
        } else if (key.big !== null && key.small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
          key.activeLetter.innerHTML = key.big;
        } else if (key.big === null) {
          return key;
        }
      }

      if (!this.isShift) {
        if (key.big !== null && !key.small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
          key.disableLetter.classList.remove("active");
          key.disableLetter.classList.add("disable");

          key.activeLetter.classList.remove("disable");
          key.activeLetter.classList.add("active");
        } else if (key.big !== null && key.small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
          key.activeLetter.innerHTML = key.small;
        } else if (key.big === null) {
          return key;
        }
      }

      if (this.capsLock && !this.isShift) {
        if (key.big !== null && key.small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
          key.activeLetter.innerHTML = key.big;
        }
      } else if (this.capsLock && this.isShift) {
        if (key.big !== null && key.small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
          key.activeLetter.innerHTML = key.small;
        }
      }

      return null;
    });
  }

  addSound = (e) => {
    this.audio = new Audio();
    switch (e.code) {
      case "Enter":
        this.audio.src = "./assets/sound/Enter.mp3";
        break;

      case "Space":
        this.audio.src = "./assets/sound/Space.mp3";
        break;

      case "Backspace":
        this.audio.src = "./assets/sound/Backspace.mp3";
        break;

      default:
        this.audio.src = "./assets/sound/keys.mp3";
        break;
    }
    this.audio.play();
  };

  printLetter(value, letter) {
    let posCursor = this.displayWrapper.selectionStart;
    const left = this.displayWrapper.value.slice(0, posCursor);
    const right = this.displayWrapper.value.slice(posCursor);

    if (value.button.classList.contains("btn-func")) {
      switch (value.code) {
        case "Tab":
          this.displayWrapper.value = `${left}\t${right}`;
          posCursor += 1;
          break;

        case "Space":
          this.displayWrapper.value = `${left} ${right}`;
          posCursor += 1;
          break;

        case "Backspace":
          this.displayWrapper.value = left.slice(0, -1) + right;
          posCursor -= 1;
          break;

        case "Delete":
          this.displayWrapper.value = left + right.slice(1);
          break;

        case "ArrowLeft":
          posCursor = posCursor - 1 >= 0 ? posCursor - 1 : 0;
          break;

        case "ArrowRight":
          posCursor += 1;
          break;

        case "ArrowUp":
          posCursor = 0;
          break;

        case "ArrowDown":
          posCursor = this.displayWrapper.value.length;
          break;

        case "Enter":
          this.displayWrapper.value = `${left}\n${right}`;
          posCursor += 1;
          break;
        default:
      }
    } else {
      posCursor += 1;
      this.displayWrapper.value = `${left}${letter}${right}`;
    }

    this.displayWrapper.setSelectionRange(posCursor, posCursor);
    this.displayWrapper.focus();
  }
}

export default Keyboard;
