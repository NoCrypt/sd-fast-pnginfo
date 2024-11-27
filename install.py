import urllib.request, shutil
from pathlib import Path

req1 = Path(__file__).parent / "javascript/exif-reader.js"
req2 = Path(__file__).parent / "javascript/exif-reader-LICENSE"

url1 = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/dist/exif-reader.js"
url2 = "https://raw.githubusercontent.com/mattiasw/ExifReader/main/LICENSE"

if not req1.exists():
    with urllib.request.urlopen(url1) as r, open(req1, 'wb') as o:
        shutil.copyfileobj(r, o)

if not req2.exists():
    with urllib.request.urlopen(url2) as r, open(req2, 'wb') as o:
        shutil.copyfileobj(r, o)
