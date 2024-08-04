import shutil
import urllib.request
from pathlib import Path

req = (Path(__file__).parent / "javascript") / "exif-reader.js"

def _download():
    if not req.exists():
        print(f"Downloading Fast PNG info requirement: \033[38;5;208mexif-reader.js\033[0m")
        url = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/dist/exif-reader.js"
        with urllib.request.urlopen(url) as response, open(req, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)

_download()
