fastpnginfo_loaded = false;
exifr = null;

async function load_fastpnginfo(txt_output_el) {
  if (exifr == null) {
    let paths = gradioApp().querySelector("#fastpng_js_path");
    const scripts = paths.textContent.trim().split("\n");
    scripts.shift();
    const df = document.createDocumentFragment();

    for (let src of scripts) {
      const script = document.createElement("script");
      script.async = true;
      script.type = "module";
      script.src = `file=${src}`;
      df.appendChild(script);
    }

    txt_output_el.appendChild(df);
    await import(`/file=${scripts[0]}`);
    fastpnginfo_loaded = true;
  }
}

fastpngprocess = function () {};

function round(value) {
  return Math.round(value * 10000) / 10000;
}
function convert(input) {
  const re_attention = /\{|\[|\}|\]|[^\{\}\[\]]+/gmu;
  let text = input.replaceAll("(", "\\(").replaceAll(")", "\\)").replace(/\\{2,}(\(|\))/gim,'\\$1');

  let res = [];

  let curly_brackets = [];
  let square_brackets = [];

  const curly_bracket_multiplier = 1.05;
  const square_bracket_multiplier = 1 / 1.05;

  function multiply_range(start_position, multiplier) {
    for (let pos = start_position; pos < res.length; pos++) {
      res[pos][1] = round(res[pos][1] * multiplier);
    }
  }

  for (const match of text.matchAll(re_attention)) {
    let word = match[0];

    if (word == "{") {
      curly_brackets.push(res.length);
    } else if (word == "[") {
      square_brackets.push(res.length);
    } else if (word == "}" && curly_brackets.length > 0) {
      multiply_range(curly_brackets.pop(), curly_bracket_multiplier);
    } else if (word == "]" && square_brackets.length > 0) {
      multiply_range(square_brackets.pop(), square_bracket_multiplier);
    } else {
      res.push([word, 1.0]);
    }
  }

  for (const pos of curly_brackets) {
    multiply_range(pos, curly_bracket_multiplier);
  }

  for (const pos of square_brackets) {
    multiply_range(pos, square_bracket_multiplier);
  }

  if (res.length == 0) {
    res = [["", 1.0]];
  }

  let i = 0;
  while (i + 1 < res.length) {

    if (res[i][1] == res[i + 1][1]) {
      res[i][0] = res[i][0] + res[i + 1][0];

      res.splice(i + 1, 1);
    } else {
      i += 1;
    }
  }

  let result = "";
  for (let i = 0; i < res.length; i++) {
    if (res[i][1] == 1.0) {
      result += res[i][0];
    } else {
      result += "(" + res[i][0] + ":" + res[i][1].toString() + ")";
    }
  }
  return result;
}

onUiLoaded(function () {
  const app = gradioApp();

  if (!app || app === document) return;

  let img_input_el = app.querySelector("#fastpnginfo_image > div > div > input");
  let txt_output_el = gradioApp().querySelector("#fastpnginfo_geninfo  > label > textarea");
  let submit_el = gradioApp().querySelector("#fastpnginfo_submit");

  if (img_input_el == null || txt_output_el == null) return;
  
  async function fastpnginfo_process_image() {
    try {
      if (!fastpnginfo_loaded) {
        await load_fastpnginfo(txt_output_el);
      }

      txt_output_el.value = "";
      let event = new Event("input", { bubbles: true });
      txt_output_el.dispatchEvent(event);

      let img_el = gradioApp().querySelector("#fastpnginfo_image > div[data-testid='image'] > div > img");

      while (img_el == null) {
        await new Promise((r) => setTimeout(r, 100));
        img_el = gradioApp().querySelector("#fastpnginfo_image > div[data-testid='image'] > div > img");
      }

      await new Promise((r) => setTimeout(r, 100));
    } catch (error) {
      console.error("Error in fastpnginfo_process_image:", error);
      throw error;
    }
  }
  
  img_input_el.addEventListener("change", fastpnginfo_process_image);
  
  submit_el.addEventListener("click", async function (e) {
    
    if (!fastpnginfo_loaded) {
      await load_fastpnginfo(txt_output_el);
    }

    let img_el = document.querySelector("#fastpnginfo_image > div[data-testid='image'] > div > img");

    try {
      var exif = await exifr?.default.parse(img_el);

      if (exif && exif.Software === "NovelAI") {
        try {
          console.log("NovelAI detected");
          const nai = JSON.parse(exif.Comment);
          nai.sampler = "Euler a";
          txt_output_el.value =
            convert(exif["Description"]) +
            "\nNegative prompt: " +
            nai["uc"] +
            "\nSteps: " +
            nai["steps"] +
            ", Sampler: " +
            nai.sampler +
            ", CFG scale: " +
            nai["scale"] +
            ", Seed: " +
            nai["seed"] +
            ", Size: " +
            img_el.width +
            "x" +
            img_el.height +
            ", Clip skip: 2, ENSD: 31337";
          
          let appEvent = new Event("input", { bubbles: true });
          txt_output_el.dispatchEvent(appEvent);
          
          return appEvent;
        } catch (error) {
        }
      }

      if (exif && exif.parameters) {
        console.log("Parameters detected");
        txt_output_el.value = exif.parameters;
        
      } else {
        txt_output_el.value = "Nothing to See Here";
      }

      let appEvent = new Event("input", { bubbles: true });
      txt_output_el.dispatchEvent(appEvent);
      
      return appEvent;
    } catch (error) {
    }
  });
});
