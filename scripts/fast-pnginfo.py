import gradio as gr
from modules import script_callbacks
import modules.generation_parameters_copypaste as parameters_copypaste
from modules import extensions
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
    with gr.Row():
      with gr.Column(scale=2):
        gr.HTML(value='\n'.join(js_), elem_id="fastpng_js_path", visible=False)
        gr.Markdown(
        f"""
        <center>
        
        <h3>Fast PNG Info ⚡</h3>
        <p>Steal 'em quick, by using <b>JavaScript</b> instead of Python.</br>Currently only supports PNG from webui. Param from NovelAI soon.</p>     
        
        </center>
        """)
    with gr.Row().style(equal_height=False):
      with gr.Column(variant='panel'):
        image = gr.Image(elem_id="fastpnginfo_image", label="Source", source="upload", interactive=True, type="pil")
        # image.change(lambda x: x, _js='(e)=>{console.log(e);fastpngprocess()}')

      with gr.Column(variant='panel'):
        fast_generation_info = gr.Textbox(label="Parameters", visible=True, elem_id="fastpnginfo_generation_info", interactive=False)
        with gr.Row():
          buttons = parameters_copypaste.create_buttons(["txt2img", "img2img", "inpaint", "extras"])

        for tabname, button in buttons.items():
          parameters_copypaste.register_paste_params_button(parameters_copypaste.ParamBinding(
              paste_button=button, tabname=tabname, source_text_component=fast_generation_info, source_image_component=image,
          ))
  return [(fast_pnginfo, "Fast PNG Info", "fast_pnginfo")];

script_callbacks.on_ui_tabs(on_ui_tabs)
