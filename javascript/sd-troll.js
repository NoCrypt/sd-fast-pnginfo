let audioTroll = true;

let callbackAudioTroll;

onUiLoaded(function () {
  const audio = gradioApp().querySelector("#ping_audio > audio");
  const prompt_box = gradioApp().querySelector("#txt2img_prompt > label > textarea");
  const checkbox = gradioApp().querySelector(
    '#troll_enable > label > input[type="checkbox"]'
  );

  if (gradioApp() == null) return;
  if (window.innerWidth < 600) {
    checkbox.checked = false;
    let event = new Event("input", { bubbles: true });
    checkbox.dispatchEvent(event);
    let event2 = new Event("change", { bubbles: true });
    checkbox.dispatchEvent(event2);
    return
  }

  console.log("sd-troll: onuiloaded");

  function playTroll() {
    if (audioTroll == false) return;
    audio.currentTime = 0;
    audio
      .play()
      .then(() => {
        console.log("ping");
        if (Math.random() < 0.5) {
          // 50% chance to play recursively 
          setTimeout(playTroll, 450 + 100 * Math.random()) 
        }
      })
      .catch((error) => {});
  }

  callbackAudioTroll = playTroll

  setTimeout(function () {
      console.log("ok3-50 recursively");
      setInterval(playTroll, 1000 * 3 + 1000 * Math.random() * 50); //3s - 50s (let's make it big)
  }, 15000); 


  // Pressing ctrl+i will toggle a checkbox that will enable/disable the troll
  document.addEventListener("keydown", function (e) {
    if (e.key == "i" && e.ctrlKey) {
      console.log("g");
      if (checkbox == null) return;
      checkbox.checked = !checkbox.checked;
      checkbox.checked ? alert("Troll Activated") : alert("Troll Deactivated");
      let event = new Event("input", { bubbles: true });
      checkbox.dispatchEvent(event);
      let event2 = new Event("change", { bubbles: true });
      checkbox.dispatchEvent(event2);
      chance = Math.random();
      if (chance < 0.4) 
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
      else if (chance < 0.6)
        window.open("https://youtu.be/gkTb9GP9lVI?t=24", "_blank");
    }

    if (e.key == "l" && e.ctrlKey) {
      audioTroll = !audioTroll
      audioTroll ? alert("Audio Troll Activated") : alert("Audio Troll Deactivated");
    }

  });
})