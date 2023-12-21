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
    dummyexifr = await import(`/file=${scripts[0]}`);
    fastpnginfo_loaded = true;
    console.log("fastpnginfo loaded");
    console.log("exifr", exifr);
  }
}

fastpngprocess = function () {};

onUiLoaded(function () {
  const app = gradioApp();
  if (!app || app === document) return;

  let img_input_el = app.querySelector(
    "#fastpnginfo_image > div > div > input"
  );

  let txt_output_el = gradioApp().querySelector(
    "#fastpnginfo_generation_info  > label > textarea"
  );

  if (img_input_el == null || txt_output_el == null) return;

  async function fastpnginfo_process_image() {
    if (!fastpnginfo_loaded) {
      await load_fastpnginfo(txt_output_el);
    }

    txt_output_el.value = "";
    let event = new Event("input", { bubbles: true });
    txt_output_el.dispatchEvent(event);

    let img_el = gradioApp().querySelector(
      "#fastpnginfo_image > div[data-testid='image'] > div > img"
    );

    while (img_el == null) {
      await new Promise((r) => setTimeout(r, 100));
      img_el = gradioApp().querySelector(
        "#fastpnginfo_image > div[data-testid='image'] > div > img"
      );
    }

    await processImage(img_el, txt_output_el);
  }

  img_input_el.addEventListener("change", fastpnginfo_process_image);

});

async function processImage(img_el, txt_output_el) {
  var exif = await exifr?.default.parse(img_el);

  if (exif && exif.parameters) {
    txt_output_el.value = exif.parameters;
  } else {
    txt_output_el.value =
      exif
        ? "EXIF data found, but no parameters\n" + JSON.stringify(exif)
        : "No EXIF data found";
  }

  let event = new Event("input", { bubbles: true });
  txt_output_el.dispatchEvent(event);
}
