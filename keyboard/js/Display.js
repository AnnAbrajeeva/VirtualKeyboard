class Display {
  constructor() {
    this.display = document.createElement("textarea");
    this.display.classList.add("display__wrapper");
    this.display.setAttribute(
      "placeholder",
      "Виртуальная клавиатура под Windows.\nСмена раскладки - Shift + Alt"
    );
  }
}

export default Display;
