import modules.generation_parameters_copypaste as parameters_copypaste
from modules.ui_components import FormRow, FormColumn
from modules import script_callbacks
from modules import extensions
import gradio as gr
import os

def get_self_extension():
    if '__file__' in globals():
        filepath = __file__
    else:
        import inspect
        filepath = inspect.getfile(lambda: None)
    for ext in extensions.active():
        if ext.path in filepath:
            return ext

def on_ui_tabs():
    ext = get_self_extension()
    if ext is None:
        return []
    
    js_ = [f'{x.path}?{os.path.getmtime(x.path)}' for x in ext.list_files('js', '.js')]
    js_.insert(0, ext.path)
    
    with gr.Blocks(analytics_enabled=False) as fast_pnginfo:
        gr.HTML(elem_id="fastpng_js_path", value='\n'.join(js_), visible=False)
        submit = gr.Button(elem_id="fastpnginfo_submit", label="submit", interactive=True, visible=False)
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
print(f"\033[38;5;173m▶\033[0m Fast PNG Info")