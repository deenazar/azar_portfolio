# Azarudeen J — Portfolio (black & white halftone portrait)

Your photo is converted into ~18,000 halftone dots (Three.js points + custom shader). Move the mouse over it and the dots part;
click for a shock wave; scroll and the portrait shatters into shards that fly into a 3D tunnel (one ring per job), then
re-form as a skills sphere and finally as the portrait again.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ — drag the dist folder onto https://app.netlify.com/drop
```

- Content: `src/data.js` · Colours (3 themes): `src/theme.js` · Resume: `public/Azarudeen_J_Resume.pdf`
- Dots data: `src/portrait.json` (generated from the photo). To regenerate from a new photo, see `tools/make_halftone.py`.
- Keys: ← → jump chapters · P play / pause.

## Open on your phone (same Wi-Fi)
1. `npm run dev` (already uses `--host`). The terminal prints `Network: http://192.168.x.x:5173/`.
2. Open that exact address in the phone browser (http, same port as the laptop).
3. If it does not load: allow Node through the laptop firewall, make sure phone and laptop are on the same Wi-Fi (not guest / VPN), then retry.
