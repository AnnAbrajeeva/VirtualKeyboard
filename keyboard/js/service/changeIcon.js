function changeIcon(sound, keys) {
  keys.forEach((key) => {
    if (key.code === "MetaLeft") {
      const btn = key;
      if (sound) {      
        btn.activeLetter.innerHTML =
          '<img src="./assets/img/volume.png" alt="volume" />';
      } else {
        btn.activeLetter.innerHTML =
          '<img src="./assets/img/mute.png" alt="volume" />';
      }
    }
  });
}

export default changeIcon;
