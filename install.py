import os
import shutil
import urllib.request
from pathlib import Path

_dir = Path(__file__).parent / "js"
_lib = _dir / "exif-reader.js"

def _delete():
    for item in _dir.glob('*'):
        if item != _dir:
            if item.is_file():
                item.unlink()
            else:
                shutil.rmtree(item)

def _download():
    if not _lib.exists():
        _delete()

        print(f"Downloading Fast PNG info requirement: \033[38;5;208mexif-reader.js\033[0m")
        _url = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/dist/exif-reader.js"
        with urllib.request.urlopen(_url) as response, open(_lib, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)

_download()
