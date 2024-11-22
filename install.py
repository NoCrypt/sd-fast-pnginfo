import urllib.request, shutil
from pathlib import Path

req = Path(__file__).parent / "javascript/exif-reader.js"
url = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/dist/exif-reader.js"

if not req.exists():
    with urllib.request.urlopen(url) as r, open(req, 'wb') as o:
        shutil.copyfileobj(r, o)
