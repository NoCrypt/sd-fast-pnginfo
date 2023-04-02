import gradio as gr
import inspect
import os
from modules import scripts, scripts_postprocessing
from modules.processing import process_images
from PIL import Image
import random

script_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
extension_dir = os.path.abspath(os.path.join(script_dir, "../"))

script_name = "SD Troll"
script_order = 100001

chance = 0


def ui(is_extra, is_img2img):
    args = {}
    with gr.Group():
        with gr.Accordion("Troll", open=False, visible=False):
          if not is_img2img:
            args["enable"] = gr.Checkbox(label="Enable", elem_id="troll_enable", value=True)
            audio = gr.Audio(interactive=False, value=os.path.join(extension_dir, "ping.mp3"), elem_id="ping_audio", visible=False)
          else:
            args["enable"] = gr.Checkbox(label="Enable2", elem_id="troll_enable_2", value=False)
    return args if is_extra else list(args.values())


def process(pp, enable):
    if not enable:
        return

    # 5% chance of generating rickroll
    if chance > 0.0 and chance <= 0.05:
      pp.image = Image.open(os.path.join(extension_dir, "rickroll.jpg"))
      print("[Happy April Fools] To disable the troll, press (ctrl + i) inside prompt box!")

    # 5% chance of flipping the result upside down
    if chance > 0.25 and chance <= 0.3:
      pp.image = pp.image.transpose(Image.FLIP_TOP_BOTTOM)
      print("[Happy April Fools] To disable the troll, press (ctrl + i) inside prompt box!")



def process_before(p, enable, *args, **kwargs):
    if not enable:
        return
    global chance
    chance = random.random()
    print("Hello")
    # 50% chance of generating hatsune miku
    if chance > 0.26 and chance <= 0.76:
      # loop through prompts
      for i, prompt in enumerate(kwargs["prompts"]):
          # add extra network keywords to prompt
          kwargs["prompts"][i] = prompt + ", BREAK, hatsune miku, cosplay as hatsune miku"
          # kwargs["prompts"][i] = prompt + ", BREAK, (shrek:1.2)"
      
      p.extra_generation_params.update({
          "SD TROLL": "You've been trolled! Happy April Fools!"
      })

      print("[Happy April Fools] To disable the troll, press (ctrl + i) inside prompt box!")


class Script(scripts.Script):
    def title(self):
        return script_name

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        return ui(False, is_img2img) 
    
    def before_process_batch(self, p, *args, **kwargs):
        return process_before(p, *args, **kwargs)

    def postprocess_image(self, p, pp, *args):
        return process(pp, *args)
