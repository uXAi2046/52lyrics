"""Extract source-PDF lines and coordinates for review, never promote OCR blindly."""
import json
from pathlib import Path
import pdfplumber

directory = Path('.cache/catalog/lehrer')
manifest = json.loads(Path('scripts/catalog/lehrer-review-manifest.json').read_text())
sources = json.loads(Path('src/data/imported/lehrer-sources.json').read_text())
regions_by_file = {}
for review in manifest:
    source = next(song for song in sources['songs'] if song['slug'] == review['sourceSlug'])
    filename = next(pdf['filename'] for pdf in source['pdfs'] if pdf['sha256'] == review['pdfSha256'])
    for selection in review['pages']:
        if 'bbox' in selection:
            regions_by_file.setdefault(filename, []).append(selection)

def extract_lines(page):
    return [{'text': line['text'], 'top': round(line['top'], 2), 'bottom': round(line['bottom'], 2), 'x0': round(line['x0'], 2)}
            for line in page.extract_text_lines(layout=False, strip=True, return_chars=False)]

records = []
for path in sorted(directory.glob('*.pdf')):
    pages = []
    with pdfplumber.open(path) as document:
        for page_index, page in enumerate(document.pages):
            regions = []
            for selection in regions_by_file.get(path.name, []):
                if selection['page'] == page_index:
                    # Explicit, visually reviewed rectangles preserve column reading order.
                    # within_bbox rejects boundary-crossing glyphs instead of duplicating them.
                    region = page.within_bbox(tuple(selection['bbox']))
                    regions.append({'bbox': selection['bbox'], 'lines': extract_lines(region)})
            pages.append({
                'width': page.width,
                'height': page.height,
                'lines': extract_lines(page), 'regions': regions,
            })
    records.append({'filename': path.name, 'pages': pages})
output = directory / 'extracted.json'
output.write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'pdfs': len(records), 'pages': sum(len(record['pages']) for record in records), 'output': str(output)}))
