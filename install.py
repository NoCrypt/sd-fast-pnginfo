from pathlib import Path
import subprocess

_dir = Path(__file__).parent / "js"
_lib = _dir / "exif-reader.js"

def _delete():
    for item in _dir.glob('*'):
        if item != _dir:
            subprocess.run(['rm', '-rf', str(item)], check=True)

def _download():
    if not _lib.exists():
        _delete()

        print(f"Downloading Fast PNG info requirement: \033[38;5;208mexif-reader.js\033[0m")
        _url = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/dist/exif-reader.js"
        subprocess.run(["curl", "-L", "-o", _lib, _url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

_download()