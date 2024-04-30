fastpnginfo_loaded = false;
ExifReader = null;

async function load_fastpnginfo(txt_output_el) {
  if (ExifReader == null) {
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

function DecodeUserComment(input) {
  let result = "";

  if (typeof input === "number") {
    input = [input];
  }

  if (Array.isArray(input)) {
    input = new Uint8Array(input);
  }

  if (input instanceof Uint8Array) {
    const encoding = "utf-8";
    const decoder = new TextDecoder(encoding);
    result = decoder.decode(input);
    
  } else if (typeof input === "string") {
    result = input;
  }

  result = result.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]+/g, '').replace(/^[\x00-\x09\x0B-\x1F\x7F-\x9F]+|[\x00-\x09\x0B-\x1F\x7F-\x9F]+$/g, '');
  return result;
}


function round(value) {
  return Math.round(value * 10000) / 10000;
}

function convertNAI(input) {
  const re_attention = /\{|\[|\}|\]|[^\{\}\[\]]+/gmu;
  let text = input.replaceAll("(", "\(").replaceAll(")", "\)").replace(/\\{2,}(\(|\))/gim,'\$1');

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
  let txt_output_el = app.querySelector("#fastpnginfo_geninfo  > label > textarea");
  let submit_el = app.querySelector("#fastpnginfo_submit");

  if (img_input_el == null || txt_output_el == null) return;
  
  async function fastpnginfo_process_image() {
    let img_el = app.querySelector("#fastpnginfo_image > div[data-testid='image'] > div > img");

    while (img_el == null) {
      await new Promise((r) => setTimeout(r, 100));
      img_el = app.querySelector("#fastpnginfo_image > div[data-testid='image'] > div > img");
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  img_input_el.addEventListener("change", fastpnginfo_process_image);
  
  submit_el.addEventListener("click", async function (e) {
    await load_fastpnginfo(txt_output_el);

    let img_el = app.querySelector("#fastpnginfo_image > div[data-testid='image'] > div > img");

    try {
      let response = await fetch(img_el.src);
      let img_blob = await response.blob();
      let arrayBuffer = await img_blob.arrayBuffer();
      let tags = ExifReader.load(arrayBuffer);

      if (tags) {
        let output = "";

        if (tags.parameters) {
          console.log("Parameters");
          output = tags.parameters.description;

        } else if (tags.UserComment && tags.UserComment.value) {
          console.log("UserComment");
          const valueArray = tags.UserComment.value;

          if (Array.isArray(valueArray)) {
            const decodedValues = valueArray.map(number => {
              return DecodeUserComment(number);
            });
            
            output = decodedValues.join('').trim();
            output = output.replace(/^UNICODE[\x00-\x20]*/, "");
          }

        } else if (tags["Software"] && tags["Software"].description === "NovelAI"
            && tags.Comment && tags.Comment.description) {
          console.log("NovelAI");
          
          const nai = JSON.parse(tags.Comment.description);
          nai.sampler = "Euler";

          output = convertNAI(nai["prompt"])
            + "\nNegative prompt: " + convertNAI(nai["uc"])
            + "\nSteps: " + (nai["steps"])
            + ", Sampler: " + (nai["sampler"])
            + ", CFG scale: " + (parseFloat(nai["scale"]).toFixed(1))
            + ", Seed: " + (nai["seed"])
            + ", Size: " + (nai["width"]) + "x" + (nai["height"])
            + ", Clip skip: 2, ENSD: 31337";

        } else {
          output = "Nothing To See Here";
        }

        txt_output_el.value = output;
        let appEvent = new Event("input", { bubbles: true });
        txt_output_el.dispatchEvent(appEvent);
      }

      return tags;

    } finally {
      return app;
    }
  });
});