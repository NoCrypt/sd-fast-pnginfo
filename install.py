from urllib.request import urlopen
from pathlib import Path
import shutil


js_lib = Path(__file__).parent / "js"
exif_reader = js_lib / "exif-reader.js"


def download_requirement():
    if not exif_reader.exists():
        js_lib.mkdir(parents=True, exist_ok=True)
        print(f"Downloading Fast PNG info requirement: \033[38;5;208mexif-reader.js\033[0m")
        url = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/dist/exif-reader.js"
        with urlopen(url) as response, open(exif_reader, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)


download_requirement()
