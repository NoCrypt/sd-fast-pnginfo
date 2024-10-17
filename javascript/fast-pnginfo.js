async function fastpnginfo_parse_image() {
  window.EnCrypt = '';
  window.EPwdSha = '';
  window.SfwNAI = '';
  window.SrcNAI = '';

  const txt_output_el = gradioApp().querySelector("#fastpnginfo_geninfo > label > textarea");
  const fastpnginfoHTML = gradioApp().querySelector("#fastpnginfo_html");
  const imageContainer = document.getElementById("fastpnginfo_image");

  let img_el = gradioApp().querySelector("#fastpnginfo_image > div[data-testid='image'] > div > img");

  if (img_el) {
    img_el.style.width = "auto";
    img_el.style.height = "auto";
    img_el.style.objectFit = "contain";

    img_el.onload = function() {
      const imgAspectRatio = img_el.naturalWidth / img_el.naturalHeight;
      const containerWidth = imageContainer.clientWidth; 
      const newHeight = containerWidth / imgAspectRatio;
      const fullSizeHeight = getComputedStyle(imageContainer).getPropertyValue('var(--size-full)').trim();
      const fullSizeHeightValue = parseFloat(fullSizeHeight);

      if (newHeight > fullSizeHeightValue) {
        imageContainer.style.height = `${newHeight}px`;
      } else {
        imageContainer.style.height = fullSizeHeight;
      }
    };
  } else {
    const fullSizeHeight = getComputedStyle(imageContainer).getPropertyValue('var(--size-full)').trim();
    imageContainer.style.height = fullSizeHeight;
    fastpnginfoHTML.innerHTML = plainTextToHTML('');
    return;
  }

  let response = await fetch(img_el.src);
  let img_blob = await response.blob();
  let blobUrl = URL.createObjectURL(img_blob);
  img_el.src = blobUrl;

  const openInNewTab = document.createElement('a');
  openInNewTab.href = blobUrl;
  openInNewTab.target = '_blank';
  openInNewTab.textContent = 'Open Image in New Tab';

  openInNewTab.addEventListener('click', () => {
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  });

  let arrayBuffer = await img_blob.arrayBuffer();
  let tags = ExifReader.load(arrayBuffer);
  let output = "";

  if (tags) {
    window.EnCrypt = tags.Encrypt ? tags.Encrypt.description : '';
    window.EPwdSha = tags.EncryptPwdSha ? tags.EncryptPwdSha.description : '';

    if (tags.parameters) {
      output = tags.parameters.description;

    } else if (tags.UserComment && tags.UserComment.value) {
      const ray = tags.UserComment.value;
      const result = [];
      var ar = ray;
      var pos = ar.indexOf(0) + 1;

      for (var i = pos; i < ar.length; i += 2) {
        var inDEX = ar[i];
        var nEXT = ar[i + 1];

        if (inDEX === 0 && nEXT === 32) {
          result.push(32);
          continue;
        }

        let vaLUE = inDEX * 256 + nEXT;
        result.push(vaLUE);
      }

      const userComment = new TextDecoder("utf-16").decode(new Uint16Array(result));
      output = userComment.trim().replace(/^UNICODE[\x00-\x20]*/, "");

    } else if (tags["Software"] && tags["Software"].description === "NovelAI" &&
               tags.Comment && tags.Comment.description) {

      window.SfwNAI = tags["Software"] ? tags["Software"].description : '';
      window.SrcNAI = tags["Source"] ? tags["Source"].description : '';

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

    if (output) {
      txt_output_el.value = output;
      updateInput(txt_output_el);
      fastpnginfoHTML.classList.add('prose');
      fastpnginfoHTML.innerHTML = plainTextToHTML(output);
    }
  }
  return tags;
}

function round(v) { return Math.round(v * 10000) / 10000 }

function convertNAI(input) {
  const re_attention = /\{|\[|\}|\]|[^\{\}\[\]]+/gmu;
  let text = input.replaceAll("(", "\(").replaceAll(")", "\)").replace(/\\{2,}(\(|\))/gim, '\$1');
  let res = [], curly_brackets = [], square_brackets = [];
  const curly_bracket_multiplier = 1.05, square_bracket_multiplier = 1 / 1.05;
  function multiply_range(start, multiplier) {
    for (let pos = start; pos < res.length; pos++) res[pos][1] = round(res[pos][1] * multiplier);
  }
  for (const match of text.matchAll(re_attention)) {
    let word = match[0];
    if (word == "{") curly_brackets.push(res.length);
    else if (word == "[") square_brackets.push(res.length);
    else if (word == "}" && curly_brackets.length > 0) multiply_range(curly_brackets.pop(), curly_bracket_multiplier);
    else if (word == "]" && square_brackets.length > 0) multiply_range(square_brackets.pop(), square_bracket_multiplier);
    else res.push([word, 1.0]);
  }
  for (const pos of curly_brackets) multiply_range(pos, curly_bracket_multiplier);
  for (const pos of square_brackets) multiply_range(pos, square_bracket_multiplier);
  if (res.length == 0) res = [["", 1.0]];
  let i = 0;
  while (i + 1 < res.length) {
    if (res[i][1] == res[i + 1][1]) {
      res[i][0] += res[i + 1][0];
      res.splice(i + 1, 1);
    } else i++;
  }
  
  let result = "";
  for (let i = 0; i < res.length; i++) {
    if (res[i][1] == 1.0) result += res[i][0];
    else result += `(${res[i][0]}:${res[i][1]})`;
  }
  return result;
}

function plainTextToHTML(inputs) {
  const EnCrypt = window.EnCrypt;
  const EPwdSha = window.EPwdSha;
  const SfwNAI = window.SfwNAI;
  const SrcNAI = window.SrcNAI;

  const box = document.querySelector("#fastpnginfo_panel");
  const sty = `display: block; margin-bottom: 2px; color: ${buttonColor};`;
  const mTop = "margin-top: 16px;";

  const bS = `
    color: ${buttonColor};
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    margin-top: -5px;
    margin-bottom: 2px;
    display: block;
    background-color: transparent;
    cursor: pointer;`;

  const pro = `
    <button id="promptButton"
    class="fastpnginfo_button"
    style="${bS}; 
    margin-top: 2px; 
    margin-bottom: 2px;">
    Prompt</button>`;

  const neg = `
    <button id="negativePromptButton"
    class="fastpnginfo_button"
    style="${bS} 
    ${mTop}">
    Negative Prompt</button>`;

  const prm = `
    <button id="paramsButton"
    class="fastpnginfo_button"
    style="${bS} 
    ${mTop}">
    Params</button>`;

  const ciH = `<b style="${sty} ${mTop}">Civitai Hashes</b>`;
  const eNC = `<b style="${sty} ${mTop}">Encrypt</b>`;
  const pWD = `<b style="${sty} ${mTop}">EncryptPwdSha</b>`;
  const sFW = `<b style="${sty} ${mTop}">Software</b>`;
  const sRC = `<b style="${sty} ${mTop}">Source</b>`;

  const br = /\n/g;
  
  if (inputs === undefined || inputs === null || inputs.trim() === '') {
    box.style.transition = 'none';
    box.style.opacity = '0';
    box.classList.remove('show');
  } else {
    if (inputs.includes("Nothing To See Here")) {
      pro = '';
    }

    box.classList.add('show');
    box.style.transition = '';
    box.style.opacity = '1';

    inputs = inputs.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(br, '<br>');
    inputs = inputs.replace(/Negative prompt:/, neg).replace(/Steps:/, match => prm + match);
    inputs = inputs.replace(/, Hashes:/, ciH);

    if (EnCrypt && EnCrypt.trim() !== '') {
      inputs += `<br>${eNC}${EnCrypt}`;
    }
    if (EPwdSha && EPwdSha.trim() !== '') {
      inputs += `<br>${pWD}${EPwdSha}`;
    }
    if (SfwNAI && SfwNAI.trim() !== '') {
      inputs += `<br>${sFW}${SfwNAI}`;
    }
    if (SrcNAI && SrcNAI.trim() !== '') {
      inputs += `<br>${sRC}${SrcNAI}`;
    }

    inputs = inputs.replace(/Seed:\s?(\d+),/g, function(match, seedNumber) {
      return `
        <button id="seedButton"
        class="fastpnginfo_button"
        style="color: ${buttonColor};
        margin-bottom: -5px;
        cursor: pointer;">Seed</button>: ${seedNumber},`;
    });
  }

  return `<div class="fastpnginfo_cont" style="padding: 2px; margin-bottom: -10px;">${pro}<p>${inputs}</p></div>`;
}

const buttonColor = "var(--button-secondary-text-color)";
const buttonHover = "var(--button-secondary-text-color-hover)";

document.addEventListener("click", function (event) {
  const txt_output_el = gradioApp().querySelector("#fastpnginfo_geninfo  > label > textarea");
  const fastpngButton = document.createElement("style");

  fastpngButton.type = "text/css";
  fastpngButton.innerText = `
    .fastpnginfo_button {
      transition: color 0.2s ease;
    }
    .fastpnginfo_button:hover {
      color: ${buttonHover} !important;
    }
    .fastpnginfo_pulse {
      animation: pulsePULSE 0.8s infinite alternate forwards;
    }
    @keyframes pulsePULSE {
      0% { color: ${buttonColor} !important; }
      20% { color: ${buttonHover} !important; }
      40% { color: ${buttonColor} !important; }
      60% { color: ${buttonHover} !important; }
      80% { color: ${buttonColor} !important; }
      100% { color: ${buttonHover} !important; }
    }`;
  document.head.appendChild(fastpngButton);

  function pulseButton(id) {
    var button = document.getElementById(id);
    button.classList.add('fastpnginfo_pulse');
    setTimeout(() => {
      button.classList.remove('fastpnginfo_pulse');
    }, 1500);
  }

  if (event.target && event.target.id === "promptButton") {
    pulseButton("promptButton");
    const text = txt_output_el.value;
    const negativePromptIndex = text.indexOf("Negative prompt:");
    let promptText;
    if (negativePromptIndex !== -1) {
      promptText = text.substring(0, negativePromptIndex).trim();
    } else {
      const stepsIndex = text.indexOf("Steps:");
      if (stepsIndex !== -1) {
        promptText = text.substring(0, stepsIndex).trim();
      } else {
        promptText = text.trim();
      }
    }
    navigator.clipboard.writeText(promptText);
  }

  if (event.target && event.target.id === "negativePromptButton") {
    pulseButton("negativePromptButton");
    const text = txt_output_el.value;
    const negativePromptStart = text.indexOf("Negative prompt:");
    const stepsStart = text.indexOf("Steps:");
    if (negativePromptStart !== -1 && stepsStart !== -1 && stepsStart > negativePromptStart) {
      const negativePromptText = text.slice(negativePromptStart + "Negative prompt:".length, stepsStart).trim();
      navigator.clipboard.writeText(negativePromptText);
    }
  }

  if (event.target && event.target.id === "paramsButton") {
    pulseButton("paramsButton");
    const text = txt_output_el.value;
    const stepsStart = text.indexOf("Steps:");
    if (stepsStart !== -1) {
      const paramsText = text.slice(stepsStart).trim();
      navigator.clipboard.writeText(paramsText);
    }
  }

  if (event.target && event.target.id === "seedButton") {
    pulseButton("seedButton");
    const text = txt_output_el.value;
    const seedMatch = text.match(/Seed:\s?(\d+),/);
    if (seedMatch && seedMatch[1]) {
      const seedText = seedMatch[1].trim();
      navigator.clipboard.writeText(seedText);
    }
  }
});
