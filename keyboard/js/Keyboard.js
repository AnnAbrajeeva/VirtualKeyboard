import Key from "./Key.js";
import * as storage from "./service/setLocal.js";
import langs from "./lang/lang.js";
import removeClass from "./service/removeClass.js";
import Display from "./Display.js";
import changeIcon from "./service/changeIcon.js";

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
    // this.isShift = false;
    this.isAlt = false;
    this.isCtrl = false;
    this.isSoundOn = true;
    this.isLeftShift = false;
    this.isRightShift = false;
  }

  createKeyboardWrapper(lang) {
    const main = document.createElement("main");

    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");

    const display = document.createElement("div");
    display.classList.add("display");

    this.displayWrapper = new Display();

    display.append(this.displayWrapper.display);
    wrapper.append(display);

    this.keyboard = document.createElement("div");
    this.keyboard.classList.add("keyboard");
    this.keyboard.setAttribute("data-lang", lang);

    this.keyboardInner = this.createKeyboard(langs[lang]);

    this.keyboard.append(this.keyboardInner);
    wrapper.append(this.keyboard);

    main.append(wrapper);
    document.body.append(main);

    this.end = this.displayWrapper.display.selectionStart;
  }

  createKeyboard(lang) {
    this.allKeys = [];
    this.keyboardWrapper = document.createElement("div");
    this.keyboardWrapper.classList.add("keyboard__wrapper");

    this.keyPad.forEach((rows) => {
      const row = document.createElement("div");
      row.classList.add("row");
      rows.forEach((key) => {
        const keyValue = lang.find((item) => item.code === key);
        const button = new Key(keyValue);
        button.button.addEventListener("mousedown", this.mouseClick);
        button.button.addEventListener("mouseup", this.mouseClick);
        button.button.addEventListener("mouseleave", this.mouseClick);

        this.allKeys.push(button);
        row.append(button.button);
      });
      this.keyboardWrapper.append(row);
    });

    document.addEventListener("keydown", this.keyPrint);
    document.addEventListener("keyup", this.keyPrint);

    return this.keyboardWrapper;
  }

  mouseClick = (e) => {
    e.stopPropagation();
    this.displayWrapper.display.focus();
    if (e.which === 3) return;
    const btn = e.currentTarget;
    if (!btn) return;
    const code = btn.dataset.key;
    if (!code) return;
    this.keyPrint({ code, type: e.type });
  };

  keyPrint = (e) => {
    const pressed = this.allKeys.find((key) => key.code === e.code);

    if (!pressed) return;

    if (e.type === "mousedown") {
      this.allKeys.forEach((key) => {
        if (
          key.button.classList.contains("pressed") &&
          key.button.classList.contains("on") &&
          !key.button.classList.contains("btn-func")
        ) {
          key.button.classList.remove("pressed");
          key.button.classList.remove("on");
        }
      });
    }

    if (pressed) {
      if (e.repeat) {
        return;
      }

      if (e.preventDefault) e.preventDefault();
      if (e.type === "keydown" || e.type === "mousedown") {
        this.keyDownPress(e, pressed);

        // Отжатие клавиши
      } else if (
        e.type === "keyup" ||
        e.type === "mouseup" ||
        e.type === "mouseleave"
      ) {
        this.keyUpPress(e, pressed);
      }
    }
  };

  keyDownPress = (e, pressed) => {
    pressed.button.classList.add("pressed");
    pressed.button.classList.add("on");

    if (this.isSoundOn) {
      this.addSound(e);
    }

    if (e.code === "MetaLeft") {
      this.isSoundOn = !this.isSoundOn;
      changeIcon(this.isSoundOn, this.allKeys);
    }

    if (e.code === "ShiftLeft") {
      this.isLeftShift = !this.isLeftShift;
      if (this.isLeftShift) {
        // Смена регистра
        this.changeRegister(e);
        pressed.button.classList.add("on");
      } else {
        pressed.button.classList.remove("on");
        this.changeRegister(e);
      }
    }

    if (e.code === "ShiftRight") {
      this.isRightShift = !this.isRightShift;
      if (this.isRightShift) {
        // Смена регистра
        this.changeRegister(e);
        pressed.button.classList.add("on");
      } else {
        pressed.button.classList.remove("on");
        this.changeRegister(e);
      }
    }

    if (e.code.match(/Alt/)) {
      if (e.repeat) {
        this.audio.pause();
      }
      this.isAlt = !this.isAlt;
    }

    if (e.code.match(/Caps/)) {
      this.capsLock = !this.capsLock;
      if (this.capsLock) {
        pressed.button.classList.add("on");
      } else {
        pressed.button.classList.remove("on");
      }
      this.changeRegister();
    }

    // Смена языка
    if (e.code.match(/Alt/) && (this.isLeftShift || this.isRightShift)) {
      this.changeLang();
      this.isLeftShift = this.isLeftShift
        ? !this.isLeftShift
        : this.isLeftShift;
      this.isRightShift = this.isRightShift
        ? !this.isRightShift
        : this.isRightShift;
      this.isAlt = false;
      this.changeRegister();
    }
    if ((this.isLeftShift || this.isRightShift) && this.isAlt) {
      this.changeLang();
      this.isLeftShift = this.isLeftShift
        ? !this.isLeftShift
        : this.isLeftShift;
      this.isRightShift = this.isRightShift
        ? !this.isRightShift
        : this.isRightShift;
      this.isAlt = false;
      this.changeRegister();
    }

    if (!this.capsLock) {
      this.printLetter(
        pressed,
        this.isLeftShift || this.isRightShift ? pressed.big : pressed.small
      );
    } else if (this.isLeftShift || this.isRightShift) {
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

    if ((this.isLeftShift || this.isRightShift) && e.code.match(/Arrow/)) {
      this.setSelection(e);
    }
  };

  keyUpPress = (e, pressed) => {
    if (e.type === "keyup") {
      if (
        e.code === "ShiftLeft" ||
        e.code === "ShiftRight" ||
        e.code === "AltLeft" ||
        e.code === "AltRight"
      ) {
        this.isLeftShift = false;
        this.isRightShift = false;
        this.isAlt = false;
        this.changeRegister();
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
      pressed.button.classList.remove("pressed");
    }

    this.allKeys.forEach((key) => {
      removeClass(key, "ShiftLeft", this.isLeftShift);
      removeClass(key, "ShiftRight", this.isRightShift);
      removeClass(key, "Alt", this.isAlt);
    });
    pressed.button.classList.remove("pressed");
  };

  setSelection(e) {
    let start = this.displayWrapper.display.selectionStart;
    let end = this.displayWrapper.display.selectionEnd;
    if (e.code === "ArrowRight") {
      start = this.displayWrapper.display.selectionStart;
      end += 1;
      this.displayWrapper.display.setSelectionRange(start, end);
    } else if (start > 0) {
      start -= 1;
      this.displayWrapper.display.setSelectionRange(start, end);
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

    this.allKeys.forEach((k) => {
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
        key.activeLetter.classList.remove("disable");
        key.activeLetter.classList.add("active");
        key.disableLetter.innerHTML = "";
      }
    });
  }

  changeRegister() {
    this.allKeys.forEach((k) => {
      const key = k;

      if (this.isLeftShift || this.isRightShift) {
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

      if (!this.isLeftShift && !this.isRightShift) {
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

      if (this.capsLock && !this.isLeftShift && !this.isRightShift) {
        if (key.big !== null && key.small.match(/^[a-zA-Zа-яА-ЯёЁ]/)) {
          key.activeLetter.innerHTML = key.big;
        }
      } else if (this.capsLock && (this.isLeftShift || this.isRightShift)) {
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
    let posCursor = this.displayWrapper.display.selectionStart;
    const firstPart = this.displayWrapper.display.value.slice(0, posCursor);
    const secondPart = this.displayWrapper.display.value.slice(posCursor);

    if (value.button.classList.contains("btn-func") || value.code === "Space") {
      let selection;
      if (
        this.displayWrapper.display.selectionStart ===
        this.displayWrapper.display.selectionEnd
      ) {
        selection = null;
      } else {
        selection = this.displayWrapper.display.value.slice(
          this.displayWrapper.display.selectionStart,
          this.displayWrapper.display.selectionEnd
        );
      }
      switch (value.code) {
        case "Tab":
          if (selection) {
            this.displayWrapper.display.setRangeText((selection = "\t"));
          } else {
            this.displayWrapper.display.value = `${firstPart}\t${secondPart}`;
          }
          posCursor += 1;
          break;

        case "Space":
          if (selection) {
            this.displayWrapper.display.setRangeText((selection = " "));
          } else {
            this.displayWrapper.display.value = `${firstPart} ${secondPart}`;
          }
          posCursor += 1;
          break;

        case "Backspace":
          if (selection) {
            this.displayWrapper.display.setRangeText((selection = ""));
          } else {
            this.displayWrapper.display.value =
              firstPart.slice(0, -1) + secondPart;
            posCursor -= 1;
          }
          break;

        case "Delete":
          if (selection) {
            this.displayWrapper.display.setRangeText((selection = ""));
          } else {
            this.displayWrapper.display.value = firstPart + secondPart.slice(1);
          }
          break;

        case "ArrowLeft":
          posCursor = posCursor - 1 >= 0 ? posCursor - 1 : 0;
          break;

        case "ArrowRight":
          posCursor += 1;
          break;

        case "ArrowUp":
          {
            const text = firstPart.split("\n");
            let row = text.length - 1;
            if (row >= 1) {
              posCursor -= text[row].length + 1;
              row -= 1;
            }
          }
          break;

        case "ArrowDown":
          {
            const text = secondPart.split("\n");
            const row = text.length - (text.length - 1);
            if (text[row]) {
              posCursor += text[row].length + 1;
            } else {
              return;
            }
          }
          break;

        case "Enter":
          this.displayWrapper.display.value = `${firstPart}\n${secondPart}`;
          posCursor += 1;
          break;
        default:
      }
    } else {
      posCursor += 1;
      this.displayWrapper.display.value = `${firstPart}${letter}${secondPart}`;
    }
    this.displayWrapper.display.focus();
    this.displayWrapper.display.setSelectionRange(posCursor, posCursor);
  }
}

export default Keyboard;
