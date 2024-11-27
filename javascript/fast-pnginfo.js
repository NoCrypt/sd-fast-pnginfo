async function fastpnginfo_parse_image() {
  window.EnCrypt = '';
  window.PWSha = '';
  window.sourceNAI = '';
  window.softWare = '';

  const fastpngRawOutput = gradioApp().querySelector("#fastpngGenInfo > label > textarea");
  const fastpngHTML = gradioApp().querySelector("#fastpngHTML");
  const fastpngImage = document.getElementById("fastpngImage");

  let imgEL = fastpngImage.querySelector('img');
  let closeButton = fastpngImage.querySelector('button.svelte-1030q2h[aria-label="Clear"]');

  if (closeButton) {
    closeButton.style.cssText += `
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
  
  if (imgEL) {
    imgEL.style.width = "auto";
    imgEL.style.height = "auto";
    imgEL.style.objectFit = "contain";

    imgEL.onload = function() {
      const imgAspectRatio = imgEL.naturalWidth / imgEL.naturalHeight;
      const containerWidth = fastpngImage.clientWidth;
      const newHeight = containerWidth / imgAspectRatio;
      const fullSizeHeight = getComputedStyle(fastpngImage).getPropertyValue('var(--size-full)').trim();
      const fullSizeHeightValue = parseFloat(fullSizeHeight);

      if (newHeight > fullSizeHeightValue) {
        fastpngImage.style.height = `${newHeight}px`;
      } else {
        fastpngImage.style.height = fullSizeHeight;
      }
    };
  } else {
    const fullSizeHeight = getComputedStyle(fastpngImage).getPropertyValue('var(--size-full)').trim();
    fastpngImage.style.height = fullSizeHeight;
    fastpngHTML.innerHTML = plainTextToHTML('');
    return;
  }

  let response = await fetch(imgEL.src);
  let img_blob = await response.blob();
  let blobUrl = URL.createObjectURL(img_blob);
  imgEL.src = blobUrl;

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

  imgEL.addEventListener('click', async () => {
    if (ZoomeD) return;
    const ExZdiv = document.querySelector('.fastpngZoom');
    if (ExZdiv) {
      ExZdiv.remove();
    }
    const Zdiv = document.createElement('div');
    Zdiv.classList.add('fastpngZoom');
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
      overflow: 'hidden',
      backdropFilter: 'blur(10px)'
    });

    const Zimg = imgEL.cloneNode();

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

      offsetX = e.clientX - ((e.clientX - imgCenterX) / lastScale) * scale - centerX;
      offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * scale - centerY;

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
    window.PWSha = tags.EncryptPwdSha ? tags.EncryptPwdSha.description : '';

    if (tags.parameters && tags.parameters.description) {
      if (tags.parameters.description.includes("sui_image_params")) {
        const parSing = JSON.parse(tags.parameters.description);
        const Sui = parSing["sui_image_params"];
        output = convertSwarmUI(Sui, {});
      } else {
        output = tags.parameters.description;
      }

    } else if (tags.UserComment && tags.UserComment.value) {
      const array = tags.UserComment.value;
      const UserComments = UserCommentDecoder(array);
      if (UserComments.includes("sui_image_params")) {
        const rippin = UserComments.trim().replace(/[\x00-\x1F\x7F]/g, '');
        const parSing = JSON.parse(rippin);
        if (parSing["sui_image_params"]) {
          const Sui = parSing["sui_image_params"];
          const SuiExtra = parSing["sui_extra_data"] || {};
          output = convertSwarmUI(Sui, SuiExtra);
        }
      } else {
        output = UserComments;
      }

    } else if (tags["Software"] && tags["Software"].description === "NovelAI" &&
               tags.Comment && tags.Comment.description) {

      window.softWare = tags["Software"] ? tags["Software"].description : '';
      window.sourceNAI = tags["Source"] ? tags["Source"].description : '';

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
      fastpngRawOutput.value = output;
      updateInput(fastpngRawOutput);
      fastpngHTML.classList.add('prose');
      fastpngHTML.innerHTML = plainTextToHTML(output);
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

function convertSwarmUI(Sui, extraData = {}) {
  let output = "";

  if (Sui.prompt) output += `${Sui.prompt}\n`;
  if (Sui.negativeprompt) output += `Negative prompt: ${Sui.negativeprompt}\n`;
  if (Sui.steps) output += `Steps: ${Sui.steps}, `;
  if (Sui.sampler) {
    Sui.sampler = Sui.sampler.replace(/\beuler\b|\beuler(-\w+)?/gi, (match) => {
      return match.replace(/euler/i, "Euler");
    });
    output += `Sampler: ${Sui.sampler}, `;
  }
  if (Sui.scheduler) output += `Schedule type: ${Sui.scheduler}, `;
  if (Sui.cfgscale) output += `CFG scale: ${Sui.cfgscale}, `;
  if (Sui.seed) output += `Seed: ${Sui.seed}, `;
  if (Sui.width && Sui.height) 
    output += `Size: ${Sui.width}x${Sui.height}, `;
  if (Sui.model) output += `Model: ${Sui.model}, `;
  if (Sui.vae) {
    const vaeParts = Sui.vae.split('/');
    output += `VAE: ${vaeParts[vaeParts.length - 1]}, `;
  }

  window.softWare = Sui?.swarm_version ? `SwarmUI ${Sui.swarm_version}` : '';

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
        "vae", 
        "swarm_version"
      ].includes(key);
    })
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  let extraParams = Object.entries(extraData)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  if (otherParams || extraParams) {
    output += (output ? ", " : "") + [otherParams, extraParams].filter(Boolean).join(", ");
  }

  return output.trim();
}

function UserCommentDecoder(array) {
  const result = [];
  let pos = 7;

  if (array[8] === 123) {
    for (let i = pos; i < array.length; i+=2) {
      const inDEX = array[i];
      const nEXT = array[i + 1];
      if (inDEX === 0 && nEXT === 32) {
        result.push(32);
        continue;
      }
      const vaLUE = inDEX * 256 + nEXT;
      result.push(vaLUE);
    }
  } else {
    for (let i = pos; i < array.length; i++) {
      if (i === 7 && array[i] === 0) {
        continue;
      }
      if (array[i] === 0) {
        if (i + 1 < array.length && array[i + 1] === 0) {
          i++;
          continue;
        }
      }
      if (i + 1 < array.length) {
        const inDEX = array[i];
        const nEXT = array[i + 1];

        if (inDEX === 0 && nEXT === 32) {
          result.push(32);
          i++;
          continue;
        }
        const vaLUE = inDEX * 256 + nEXT;
        result.push(vaLUE);
        i++;
      }
    }
  }
  const output = new TextDecoder("utf-16").decode(new Uint16Array(result)).trim();
  return output.replace(/^UNICODE[\x00-\x20]*/, "");
}

function plainTextToHTML(inputs) {
  const EnCrypt = window.EnCrypt;
  const PWSha = window.PWSha;
  const sourceNAI = window.sourceNAI;
  const softWare = window.softWare;

  const buttonColor = 'var(--primary-400)';
  const buttonHover = 'var(--primary-600)';

  var fastpngSendButton = document.querySelector("#fastpngSendButton");
  fastpngSendButton.style.setProperty('border-radius', '0.5rem', 'important');

  var fastpngOutputPanel = document.querySelector("#fastpngOutputPanel");
  var sty = `display: block; margin-bottom: 2px; color: ${buttonColor};`;
  var mTop = "margin-top: 16px;";

  var buttonStyle = `
    color: ${buttonColor};
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 2px;
    display: block;
    background-color: transparent;
    cursor: pointer;`;

  var titlePrompt = `
    <button id="promptButton"
      class="fastpngButtons"
      style="${buttonStyle}; padding-top: 0px; margin-bottom: 2px;"
      title="Copy Prompt">
      Prompt
    </button>`;

  var titleNegativePrompt = `
    <button id="negativePromptButton"
      class="fastpngButtons"
      style="${buttonStyle}"
      title="Copy Negative Prompt">
      Negative Prompt
    </button>`;

  var titleParams = `
    <button id="paramsButton"
      class="fastpngButtons"
      style="${buttonStyle}"
      title="Copy Parameter Settings">
      Params
    </button>`;

  const titleCivitaiHashes = `<b style="${sty};">Civitai Hashes</b>`;
  const titleEncrypt = `<b style="${sty};">Encrypt</b>`;
  const titleSha = `<b style="${sty};">EncryptPwdSha</b>`;
  const titleSoftware = `<b style="${sty};">Software</b>`;
  const titleSource = `<b style="${sty};">Source</b>`;

  const br = /\n/g;

  let outputHTML = '';
  let promptText = '';
  let negativePromptText = '';
  let paramsText = '';
  let hashesText = '';
  
  function fastOutput(title, content) {
    return `<div class="fastpngOutputSection"<p>${title}${content}</p></div>`;
  }

  if (inputs === undefined || inputs === null || inputs.trim() === '') {
    fastpngOutputPanel.style.transition = 'none';
    fastpngOutputPanel.style.opacity = '0';
    fastpngOutputPanel.classList.remove('show');
    fastpngSendButton.style.display = 'none';
  } else {
    fastpngOutputPanel.classList.add('show');
    fastpngOutputPanel.style.transition = '';
    fastpngOutputPanel.style.opacity = '1';

    if (inputs.trim().includes("Nothing To See Here")) {
      titlePrompt = '';
      fastpngSendButton.style.display = 'none'; 
      outputHTML = fastOutput('', inputs);
    } else {
      fastpngSendButton.style.display = 'flex';

      inputs = inputs.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(br, '<br>');
      inputs = inputs.replace(/Seed:\s?(\d+),/gi, function(match, seedNumber) {
        return `
          <button id="seedButton"
            class="fastpngButtons"
            style="color: ${buttonColor}; margin-bottom: -5px; cursor: pointer;"
            title="Copy Seed Value">
            Seed
          </button>: ${seedNumber},`;
      });

      const negativePromptIndex = inputs.indexOf("Negative prompt:");
      const stepsIndex = inputs.indexOf("Steps:");
      const hashesIndex = inputs.indexOf("Hashes:");

      if (negativePromptIndex !== -1) {
        promptText = inputs.substring(0, negativePromptIndex).trim();
      } else if (stepsIndex !== -1) {
        promptText = inputs.substring(0, stepsIndex).trim();
      } else {
        promptText = inputs.trim();
      }

      if (negativePromptIndex !== -1 && stepsIndex !== -1 && stepsIndex > negativePromptIndex) {
        negativePromptText = inputs.slice(negativePromptIndex + "Negative prompt:".length, stepsIndex).trim();
      }

      if (stepsIndex !== -1) {
        paramsText = inputs.slice(stepsIndex).trim();
        if (hashesIndex !== -1 && hashesIndex > stepsIndex) {
          hashesText = inputs.slice(hashesIndex + "Hashes:".length).trim();
          paramsText = paramsText.slice(0, hashesIndex - stepsIndex).trim();
        }
      } else {
        paramsText = inputs.trim();
      }

      const sections = [
        { title: titlePrompt, content: promptText },
        { title: titleNegativePrompt, content: negativePromptText },
        { title: titleParams, content: paramsText },
        { title: titleCivitaiHashes, content: hashesText },
        { title: titleSoftware, content: softWare },
        { title: titleEncrypt, content: EnCrypt },
        { title: titleSha, content: PWSha },
        { title: titleSource, content: sourceNAI }
      ];

      sections.forEach(section => {
        if (section.content && section.content.trim() !== '') {
          outputHTML += fastOutput(section.title, section.content);
        }
      });
    }
  }

  const fastpngRawOutput = gradioApp().querySelector("#fastpngGenInfo > label > textarea");
  const OutputRaw = fastpngRawOutput.value;

  const fastpngButton = document.createElement("style");
  fastpngButton.type = "text/css";
  fastpngButton.innerText = `
    .fastpngButtons {
      transition: color 0.3s ease;
    }

    .fastpngButtonsHover {
      color: ${buttonHover} !important;
    }

    .fastpngBorderPulse {
      animation: pulseBorder 1s infinite alternate forwards;
    }

    @keyframes pulseBorder {
      0% {border-color: transparent;}
      50% {border-color: var(--primary-400);}
      100% {border-color: transparent;}
    }

    .fadeOutBorder {
      animation: fadeOutBorderColor 1s alternate forwards;
    }

    @keyframes fadeOutBorderColor {
      0% {border-color: var(--primary-400);}
      100% {border-color: transparent;}
    }
  `;

  document.head.appendChild(fastpngButton);

  document.addEventListener("click", function (event) {
    function pulseBorderSection(button) {
      var section = button.closest('.fastpngOutputSection');
      section.classList.add('fastpngBorderPulse');
      setTimeout(() => {
        section.classList.remove('fastpngBorderPulse');
        section.classList.add('fadeOutBorder');
        setTimeout(() => {
          section.classList.remove('fadeOutBorder');
        }, 1000);
      }, 1500);
    }

    const fastpngNotify = {
      create: function(msg) {
        const Notify = document.createElement('div');
        Notify.className = 'copy-NoTify';
        Notify.innerText = msg;
        Object.assign(Notify.style, {
          position: 'fixed',
          top: '-50px',
          right: '20px',
          padding: '5px 5px',
          fontSize: '30px',
          fontWeight: 'bold',
          zIndex: '9999',
          opacity: '0',
          transition: 'opacity 0.5s, transform 0.5s'
        });
        document.body.appendChild(Notify);
        setTimeout(() => {
          Notify.style.opacity = '1';
          Notify.style.transform = 'translateY(70px)';
        }, 100);
        setTimeout(() => {
          Notify.style.opacity = '0';
          Notify.style.transform = 'translateX(100rem)';
          setTimeout(() => {
            document.body.removeChild(Notify);
          }, 500);
        }, 1000);
      }
    };

    function fastpngCopy(CopyCopy, whichBorder) {
      navigator.clipboard.writeText(CopyCopy);
      pulseBorderSection(whichBorder);
      fastpngNotify.create("📋");
    }

    if (event.target && event.target.id === "promptButton") {
      const negativePromptIndex = OutputRaw.indexOf("Negative prompt:");
      let promptText;
      if (negativePromptIndex !== -1) {
        promptText = OutputRaw.substring(0, negativePromptIndex).trim();
      } else {
        const stepsIndex = OutputRaw.indexOf("Steps:");
        if (stepsIndex !== -1) {
          promptText = OutputRaw.substring(0, stepsIndex).trim();
        } else {
          promptText = OutputRaw.trim();
        }
      }
      fastpngCopy(promptText, event.target);
    }

    if (event.target && event.target.id === "negativePromptButton") {
      const negativePromptStart = OutputRaw.indexOf("Negative prompt:");
      const stepsStart = OutputRaw.indexOf("Steps:");
      if (negativePromptStart !== -1 && stepsStart !== -1 && stepsStart > negativePromptStart) {
        const negativePromptText = OutputRaw.slice(negativePromptStart + "Negative prompt:".length, stepsStart).trim();
        fastpngCopy(negativePromptText, event.target);
      }
    }

    if (event.target && event.target.id === "paramsButton") {
      const stepsStart = OutputRaw.indexOf("Steps:");
      if (stepsStart !== -1) {
        const paramsText = OutputRaw.slice(stepsStart).trim();
        fastpngCopy(paramsText, event.target);
      }
    }

    if (event.target && event.target.id === "seedButton") {
      const seedMatch = OutputRaw.match(/Seed:\s?(\d+),/i);
      if (seedMatch && seedMatch[1]) {
        const seedText = seedMatch[1].trim();
        fastpngCopy(seedText, event.target);
      }
    }
  });

  function fastpngHoverButtons(button) {
    button.addEventListener('mouseenter', function () {
      button.classList.add('fastpngButtonsHover');
    });

    button.addEventListener('mouseleave', function () {
      button.classList.remove('fastpngButtonsHover');
    });
  }

  setTimeout(() => {
    const buttons = document.querySelectorAll('.fastpngButtons');
    buttons.forEach(button => fastpngHoverButtons(button));
  }, 0);

  return `<div class="fastpngHTMLOutput" style="margin-bottom: -8px;">${outputHTML}</div>`;
}
