# 明码本 Mingmaben — Naked Language

**V1.0 Text Public Beta** — an open-source deterministic experiment in structural language decoding.

## V1.0 scope
- Text input only (voice and OCR are deliberately postponed to V1.1)
- English and Chinese text analysis
- Chinese → frozen pinyin → A–Z
- `ü → V`, including restored hidden umlaut after j/q/x/y
- Frozen A–Z Layer 0 with uncertainty preserved
- Deterministic structural/state scoring
- English output first, Chinese second
- Quick / Deep modes
- Local browser feedback storage/export
- PWA shell for phone/desktop installation
- No online AI API required for normal analysis

## Run locally

```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080/`.

## Tests

```bash
npm test
```

## Important beta limitation
The deterministic engine intentionally does **not** pretend to reproduce all of ChatGPT's free-form whole-text interpretation. V1 reports only coded motifs and structural states the program can calculate reproducibly. That makes the public test auditable, but less nuanced than the research interpretation.

Chinese romanization uses a bundled browser-side transliteration table plus frozen Mingmaben normalization rules. Polyphonic characters can still be imperfect; this is a known V1 limitation.

## Privacy
Core text analysis runs in the browser. No account, database, or AI API is required.

## Next release
V1.1 is reserved for voice transcription and screenshot/chat OCR, with editable recognized text before analysis.

## License
AGPL-3.0. Theory/project authorship and software licensing are distinct.
