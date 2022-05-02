/* eslint-disable import/extensions */
import Keyboard from "./Keyboard.js";

const lang = JSON.parse(localStorage.getItem('lang')) || 'en'

const keyboard = new Keyboard()

keyboard.createKeyboardWrapper(lang)


