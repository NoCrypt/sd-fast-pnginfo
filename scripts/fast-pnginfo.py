import modules.generation_parameters_copypaste as parameters_copypaste  # noqa: generation_parameters_copypaste is the ailes to infotext_utils
from modules.ui_components import FormRow, FormColumn
from modules import script_callbacks, scripts
from pathlib import Path
import gradio as gr


def on_ui_tabs():
    with gr.Blocks(analytics_enabled=False) as fast_pnginfo:
        gr.Button(elem_id="fastpnginfo_submit", label="submit", interactive=True, visible=False)
        geninfo = gr.Textbox(elem_id="fastpnginfo_geninfo", visible=False)

        with FormRow(equal_height=False):
            with FormColumn(variant='panel'):
                image = gr.Image(elem_id="fastpnginfo_image", source="upload", interactive=True, type="pil", show_label=False)

                with FormRow(variant='compact'):
                    buttons = parameters_copypaste.create_buttons(["txt2img", "img2img", "inpaint", "extras"])

            with gr.Column(variant='panel', scale=2, elem_id="fastpnginfo_html"):
                display = gr.HTML()

            for tabname, button in buttons.items():
                parameters_copypaste.register_paste_params_button(parameters_copypaste.ParamBinding(
                    paste_button=button, tabname=tabname, source_text_component=geninfo, source_image_component=image))

        image.change(fn=None, inputs=[image], outputs=[geninfo], _js="""
        (e) => {
            fastpngprocess(e);
            document.querySelector("#fastpnginfo_submit").click();
            document.querySelector("#fastpnginfo_geninfo").style.visibility = "visible";
        }
        """)

        geninfo.change(fn=None, inputs=[geninfo], outputs=[display], _js="""
        function plaintext_to_html(inputs) {
            var box = document.querySelector("#fastpnginfo_html");

            var pr = '<b style="display: block; margin-bottom: 4px;">Prompt</b>\\n\\n';
            var np = `<br><b style="display: block; margin-top: 15px; margin-bottom: 4px;">Negative Prompt</b>`;
            var st = `<b style="display: block; margin-top: 15px; margin-bottom: 4px;">Settings</b>`;

            if (inputs === undefined || inputs === null || inputs.trim() === '') {
                box.style.opacity = "0";

            } else {
                if (inputs.includes("Nothing To See Here")) {
                    pr = '';
                }

                box.style.opacity = "1";
                inputs = inputs.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                inputs = inputs.replace(/\\n/g, '<br>');
                inputs = inputs.replace(/<br>Negative prompt:/, np);
                inputs = inputs.replace(/Steps:/, match => st + match);                                    
            }

            return `<div style="padding: 5px;">${pr}<p>${inputs}</p></div>`;
        }
        """)

    return [(fast_pnginfo, "Fast PNG Info", "fast_pnginfo")]


script_callbacks.on_ui_tabs(on_ui_tabs)


def download_exif_reader():
    exif_reader = Path(scripts.basedir()) / 'javascript' / 'exif-reader.js'
    if not exif_reader.exists():
        from urllib.request import urlopen
        import shutil
        exif_reader.parent.mkdir(parents=True, exist_ok=True)
        print(f"Downloading Fast PNG info requirement: \033[38;5;208mexif-reader.js\033[0m")
        url = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/dist/exif-reader.js"
        with urlopen(url) as response, open(exif_reader, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)


download_exif_reader()
