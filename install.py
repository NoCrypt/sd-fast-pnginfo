from pathlib import Path
import subprocess
import shutil

_dir = Path(__file__).parent / "js"
_lib = _dir / "exif-reader.js"

def _delete():
    for item in _dir.glob('*'):
        if item.is_file() or item.is_symlink():
            item.unlink()
        else:
            shutil.rmtree(item)

def _download():
    if not _lib.exists():
        _delete()
        
        print("Downloading Fast PNG info requirement: \033[38;5;173mexif-reader.js\033[0m")
        _url = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/dist/exif-reader.js"
        subprocess.run(["curl", "-L", "-o", _lib, _url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

_download()