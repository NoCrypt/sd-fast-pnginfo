import modules.generation_parameters_copypaste as tempe # type: ignore
from modules.ui_components import FormRow, FormColumn
from modules import script_callbacks
import gradio as gr

def on_ui_tabs():
    with gr.Blocks(analytics_enabled=False) as fast_pnginfo:
        gr.Button(
            elem_id="fastpnginfo_submit", visible=False
        )

        with FormRow(equal_height=False):
            with FormColumn(variant='panel'):
                image = gr.Image(
                    elem_id="fastpnginfo_image",
                    source="upload",
                    interactive=True,
                    type="pil",
                    show_label=False
                )

                with FormRow(variant='compact'):
                    buttons = tempe.create_buttons(
                        ["txt2img", "img2img", "inpaint", "extras"]
                    )

            with gr.Column(
                variant='panel', scale=2, elem_id="fastpnginfo_panel"
            ):
                geninfo = gr.Textbox(
                    elem_id="fastpnginfo_geninfo", visible=False
                )

                display = gr.HTML()

            for tabname, button in buttons.items():
                tempe.register_paste_params_button(
                    tempe.ParamBinding(
                        paste_button=button,
                        tabname=tabname,
                        source_text_component=geninfo,
                        source_image_component=image
                    )
                )

        image.change(
            fn=None,
            inputs=[image],
            outputs=[geninfo],
            _js="fastPNGProcess"
        )

        geninfo.change(
            fn=None,
            inputs=[geninfo],
            outputs=[display],
            _js="plainTextToHTML"
        )

    return [(fast_pnginfo, "Fast PNG Info", "fast_pnginfo")]

script_callbacks.on_ui_tabs(on_ui_tabs)
print("\033[38;5;208m▶\033[0m Fast PNG Info")
