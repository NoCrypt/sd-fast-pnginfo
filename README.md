# SD Fast PNG Info
SD Fast PNG Info is an extension for [Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)<br>
The extension uses a dynamically loaded JavaScript library module to extract image metadata locally.<br>
Eliminating the need to upload it to a server, resulting in Fast PNG Info.<br>
This is particularly noticeable when running the webui on online services, such as Google Colab, Kaggle, SageMaker Studio Lab, etc.<br>

Support:
- PNG Parameters
- JPEG and Avif UserComment
- Novel AI Parameters with brackets conversion

# Changelog
### 2024-04-30
- Displaying the output in HTML.
<br>

### 2024-04-29
- Migrating from [Exifr](https://github.com/MikeKovarik/exifr) to [ExifReader](https://github.com/mattiasw/ExifReader) JavaScript library.<br>
- Fixed convertNAI function.

<h1 align="center">Preview</h1>
<p align="center">
  <img src="https://github.com/gutris1/sd-fast-pnginfo/assets/132797949/55e70a0b-35e7-40d3-8397-398941f36fd9" width="800">
  <img src="https://github.com/gutris1/sd-fast-pnginfo/assets/132797949/02852cac-6517-42bb-ba4e-d54277bce894">
</p>