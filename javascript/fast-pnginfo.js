async function fastpnginfo_parse_image() {
  window.EnCrypt = '';
  window.EPwdSha = '';
  window.SfwNAI = '';
  window.SrcNAI = '';

  const txt_output_el = gradioApp().querySelector("#fastpnginfo_geninfo > label > textarea");
  const fastpnginfoHTML = gradioApp().querySelector("#fastpnginfo_html");
  const imageContainer = document.getElementById("fastpnginfo_image");

  let img_el = imageContainer.querySelector('img');
  let cB = imageContainer.querySelector('button.svelte-1030q2h[aria-label="Clear"]');

  if (cB) {
    cB.style.cssText += `
      transform: scale(2) !important;
      margin: 0 !important;
      padding: 0 !important;
      gap: 0 !important;
      border-radius: 50% !important;
      box-sizing: border-box;
      border: 0 !important;
      color: var(--primary-400) !important;
    `;
  }
  
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

  let ZoomeD = false;

  img_el.addEventListener('click', async () => {
    if (ZoomeD) return;
    const ExZdiv = document.querySelector('.fastpnginfo-zoom');
    if (ExZdiv) {
      ExZdiv.remove();
    }
    const Zdiv = document.createElement('div');
    Zdiv.classList.add('fastpnginfo-zoom');
    document.body.style.overflow = 'hidden';

    Object.assign(Zdiv.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '9999',
      cursor: 'zoom-out',
      overflow: 'hidden'
    });

    const Zimg = img_el.cloneNode();

    Object.assign(Zimg.style, {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      cursor: 'grab',
      transition: 'transform 0.3s ease'
    });

    Zdiv.appendChild(Zimg);
    document.body.appendChild(Zdiv);

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let lastX = 0;
    let lastY = 0;
    let Groping = false;
    let GropinTime = null;
    let Groped = false;

    Zimg.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();

      Zimg.style.transition = 'transform 0.3s ease';
      const centerX = Zdiv.offsetWidth / 2;
      const centerY = Zdiv.offsetHeight / 2;

      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
      const zoomStep = 0.1;
      const zoom = 1 + delta * zoomStep;
      const lastScale = scale;
      scale *= zoom;
      scale = Math.max(0.1, scale);

      const imgCenterX = offsetX + centerX;
      const imgCenterY = offsetY + centerY;

      offsetX = e.clientX - 
        ((e.clientX - imgCenterX) / lastScale) * scale - 
        centerX;
      offsetY = e.clientY - 
        ((e.clientY - imgCenterY) / lastScale) * scale - 
        centerY;

      Zimg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    });

    Zimg.addEventListener('mousedown', (e) => {
      e.preventDefault();

      GropinTime = setTimeout(() => {
        Groped = true;
        Zimg.style.cursor = 'grab';
      }, 100);

      lastX = e.clientX - offsetX;
      lastY = e.clientY - offsetY;
    });

    Zdiv.addEventListener('mousemove', (e) => {
      if (!Groped) return;

      e.preventDefault();
      Groping = true;

      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;

      offsetX = deltaX;
      offsetY = deltaY;

      Zimg.style.transition = '';
      Zimg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
    });

    ['mouseup', 'mouseleave'].forEach(eventType => {
      Zdiv.addEventListener(eventType, () => {
        clearTimeout(GropinTime);

        if (!Groped) {
          Zdiv.remove();
          document.body.style.overflow = 'auto';
          ZoomeD = false;
          return;
        }

        Groping = false;
        Groped = false;
        Zimg.style.cursor = 'grab';
      });
    });

    Zdiv.addEventListener('click', (e) => {
      if (e.target === Zdiv) {
        Zdiv.remove();
        document.body.style.overflow = 'auto';
        ZoomeD = false;
      }
    });

    ZoomeD = true;
  });

  let arrayBuffer = await img_blob.arrayBuffer();
  let tags = ExifReader.load(arrayBuffer);
  let output = "";

  if (tags) {
    window.EnCrypt = tags.Encrypt ? tags.Encrypt.description : '';
    window.EPwdSha = tags.EncryptPwdSha ? tags.EncryptPwdSha.description : '';

    if (tags.parameters && tags.parameters.description) {
      if (tags.parameters.description.includes("sui_image_params")) {
        const parseDesc = JSON.parse(tags.parameters.description);
        const Sui = parseDesc["sui_image_params"];
        output = convertSwarmUI(Sui);
      } else {
        output = tags.parameters.description;
      }

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

      output = convertNAI(nai["prompt"]) +
        "\nNegative prompt: " + convertNAI(nai["uc"]) +
        "\nSteps: " + nai["steps"] +
        ", Sampler: " + nai["sampler"] +
        ", CFG scale: " + parseFloat(nai["scale"]).toFixed(1) +
        ", Seed: " + nai["seed"] +
        ", Size: " + nai["width"] + "x" + nai["height"] +
        ", Clip skip: 2, ENSD: 31337";

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

function convertSwarmUI(Sui) {
  let output = "";
  if (Sui.prompt) output += `${Sui.prompt}\n`;
  if (Sui.negativeprompt) output += `Negative prompt: ${Sui.negativeprompt}\n`;
  if (Sui.steps) output += `Steps: ${Sui.steps}, `;
  if (Sui.sampler) output += `Sampler: ${Sui.sampler}, `;
  if (Sui.scheduler) output += `Schedule type: ${Sui.scheduler}, `;
  if (Sui.cfgscale) output += `CFG scale: ${Sui.cfgscale}, `;
  if (Sui.seed) output += `Seed: ${Sui.seed}, `;
  if (Sui.width && Sui.height) 
    output += `Size: ${Sui.width}x${Sui.height}, `;
  if (Sui.model) output += `Model: ${Sui.model}, `;
  if (Sui.vae) output += `VAE: ${Sui.vae}, `;
  output = output.trim().replace(/,$/, "");
  let otherParams = Object.entries(Sui)
    .filter(([key]) => {
      return ![
        "prompt", 
        "negativeprompt", 
        "steps", 
        "sampler", 
        "scheduler", 
        "cfgscale", 
        "seed", 
        "width", 
        "height", 
        "model", 
        "vae"
      ].includes(key);
    })
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
  if (otherParams) {
    output += (output ? ", " : "") + otherParams;
  }
  return output.trim();
}

function plainTextToHTML(inputs) {
  const EnCrypt = window.EnCrypt;
  const EPwdSha = window.EPwdSha;
  const SfwNAI = window.SfwNAI;
  const SrcNAI = window.SrcNAI;

  const buttonColor = 'var(--primary-400)';
  const buttonHover = 'var(--primary-600)';

  var SendButton = document.querySelector("#fastpngSendButton");
  var box = document.querySelector("#fastpnginfo_panel");
  var sty = `display: block; margin-bottom: 2px; color: ${buttonColor};`;
  var mTop = "margin-top: 16px;";

  var bS = `
    color: ${buttonColor};
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    margin-top: -5px;
    margin-bottom: 2px;
    display: block;
    background-color: transparent;
    cursor: pointer;`;

  var pro = `
    <button id="promptButton"
      class="fastpnginfo_button"
      style="${bS}; margin-top: 2px; margin-bottom: 2px;"
      title="Copy Prompt">
      Prompt
    </button>`;

  var neg = `
    <button id="negativePromptButton"
      class="fastpnginfo_button"
      style="${bS} ${mTop}"
      title="Copy Negative Prompt">
      Negative Prompt
    </button>`;

  var prm = `
    <button id="paramsButton"
      class="fastpnginfo_button"
      style="${bS} ${mTop}"
      title="Copy Parameter Settings">
      Params
    </button>`;

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
    SendButton.style.display = 'none';
  } else {
    if (inputs.trim().includes("Nothing To See Here")) {
      pro = '';
      SendButton.style.display = 'none';
    } else {
      SendButton.style.display = 'flex';
    }

    box.classList.add('show');
    box.style.transition = '';
    box.style.opacity = '1';

    inputs = inputs.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(br, '<br>');
    inputs = inputs.replace(/Negative prompt:/, neg).replace(/(Steps:|model:)/, match => prm + match);
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

    inputs = inputs.replace(/Seed:\s?(\d+),/gi, function(match, seedNumber) {
      return `
        <button id="seedButton"
          class="fastpnginfo_button"
          style="color: ${buttonColor};
                 margin-bottom: -5px;
                 cursor: pointer;"
          title="Copy Seed Value">
          Seed
        </button>: ${seedNumber},`;
    });
  }

  const txt_output_el = gradioApp().querySelector("#fastpnginfo_geninfo > label > textarea");

  const fastpngButton = document.createElement("style");
  fastpngButton.type = "text/css";
  fastpngButton.innerText = `
    .fastpnginfo_button {
      transition: color 0.3s ease;
    }
    .fastpnginfo_hover {
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

  document.addEventListener("click", function (event) {
    function pulseButton(id) {
      var button = document.getElementById(id);
      button.classList.remove('fastpnginfo_hover');
      button.style.cursor = 'auto';
      button.classList.add('fastpnginfo_pulse');

      setTimeout(() => {
        button.classList.remove('fastpnginfo_pulse');
        button.style.cursor = 'pointer';
      }, 1500);
    }

    function fastpngNotify(msg) {
      const NoTify = document.createElement('div');
      NoTify.className = 'copy-NoTify';
      NoTify.innerText = msg;

      NoTify.style.position = 'fixed';
      NoTify.style.top = '-50px';
      NoTify.style.right = '20px';
      NoTify.style.padding = '5px 5px';
      NoTify.style.fontSize = '30px';
      NoTify.style.fontWeight = 'bold';
      NoTify.style.zIndex = '9999';
      NoTify.style.opacity = '0';
      NoTify.style.transition = 'opacity 0.5s, transform 0.5s';

      document.body.appendChild(NoTify);
      setTimeout(() => {
        NoTify.style.opacity = '1';
        NoTify.style.transform = 'translateY(70px)';
      }, 100);
      setTimeout(() => {
        NoTify.style.opacity = '0';
        NoTify.style.transform = 'translateX(100rem)';
        setTimeout(() => {
          document.body.removeChild(NoTify);
        }, 500);
      }, 1000);
    }

    function fastpngCopy(CopyCopy) {
      navigator.clipboard.writeText(CopyCopy);
      fastpngNotify("📋");
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
      fastpngCopy(promptText);
    }

    if (event.target && event.target.id === "negativePromptButton") {
      pulseButton("negativePromptButton");
      const text = txt_output_el.value;
      const negativePromptStart = text.indexOf("Negative prompt:");
      const stepsStart = text.indexOf("Steps:");
      if (negativePromptStart !== -1 && stepsStart !== -1 && stepsStart > negativePromptStart) {
        const negativePromptText = text.slice(negativePromptStart + "Negative prompt:".length, stepsStart).trim();
        fastpngCopy(negativePromptText);
      }
    }

    if (event.target && event.target.id === "paramsButton") {
      pulseButton("paramsButton");
      const text = txt_output_el.value;
      const stepsStart = text.indexOf("Steps:");
      if (stepsStart !== -1) {
        const paramsText = text.slice(stepsStart).trim();
        fastpngCopy(paramsText);
      }
    }

    if (event.target && event.target.id === "seedButton") {
      pulseButton("seedButton");
      const text = txt_output_el.value;
      const seedMatch = text.match(/Seed:\s?(\d+),/i);
      if (seedMatch && seedMatch[1]) {
        const seedText = seedMatch[1].trim();
        fastpngCopy(seedText);
      }
    }
  });

  function fastpnginfoHover(button) {
    button.addEventListener('mouseenter', function () {
      button.classList.add('fastpnginfo_hover');
    });

    button.addEventListener('mouseleave', function () {
      button.classList.remove('fastpnginfo_hover');
    });
  }

  setTimeout(() => {
    const buttons = document.querySelectorAll('.fastpnginfo_button');
    buttons.forEach(button => fastpnginfoHover(button));
  }, 0);

  return `
    <div class="fastpnginfo_cont"
      style="padding: 2px; margin-bottom: -10px;">
      ${pro}<p>${inputs}</p>
    </div>
  `;
}
