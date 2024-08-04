async function fastpnginfo_parse_image() {
  window.EnCrypt = '';
  window.EPwdSha = '';
  window.SfwNAI = '';
  window.SrcNAI = '';

  const txt_output_el = gradioApp().querySelector("#fastpnginfo_geninfo  > label > textarea");
  const fastpnginfoHTML = gradioApp().querySelector("#fastpnginfo_html");

  let img_el = gradioApp().querySelector("#fastpnginfo_image > div[data-testid='image'] > div > img");
  if (!img_el) {
    fastpnginfoHTML.innerHTML = plainTextToHTML('');
    return;
  }

  let response = await fetch(img_el.src);
  let img_blob = await response.blob();
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

      for(var i = pos; i < ar.length; i += 2) {
        var inDEX = ar[i];
        var nEXT = ar[i + 1];

        if(inDEX === 0 && nEXT === 32) {
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

  var box = document.querySelector("#fastpnginfo_panel");
  var sty = "display: block; margin-bottom: 2px;";
  var mTop = "margin-top: 16px;";

  var pro = `<b style="${sty}">Prompt</b>`;
  var neg = `<b style="${sty} ${mTop}">Negative Prompt</b>`;
  var prm = `<b style="${sty} ${mTop}">Params</b>`;
  var ciH = `<b style="${sty} ${mTop}">Civitai Hashes</b>`;

  var eNC = `<b style="${sty} ${mTop}">Encrypt</b>`;
  var pWD = `<b style="${sty} ${mTop}">EncryptPwdSha</b>`;
  
  var sFW = `<b style="${sty} ${mTop}">Software</b>`;
  var sRC = `<b style="${sty} ${mTop}">Source</b>`;

  var br = /\n/g;

  if (inputs === undefined || inputs === null || inputs.trim() === '') {
    box.style.opacity = '0';
  } else {
    if (inputs.includes("Nothing To See Here")) {
      pro = '';
    }

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
  }

  return `<div class="fastpnginfo_cont"style="padding: 2px; margin-bottom: -10px;">${pro}<p>${inputs}</p></div>`;
}