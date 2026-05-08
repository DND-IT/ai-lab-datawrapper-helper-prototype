# System Toggle — Open Propositions

Items deferred from the Tamedia/FuW toggle work. The toggle itself, theme switch, folder routing, brand color, persistence, and header indicator are already implemented.

## 1. AI system prompt still says "Tamedia"

- File: [src/App.tsx:357](src/App.tsx#L357) — `You are a chart expert for Tamedia. ...`
- File: [src/App.tsx:359](src/App.tsx#L359) — `GUIDELINES & TAMEDIA STANDARDS:`
- Effect: Gemini may bias FuW outputs toward Tamedia editorial conventions.
- Option: branch the `systemInstruction` string on `system` (e.g. swap `Tamedia` → `Finanz und Wirtschaft` and adjust the standards reference).

## 2. User-facing sidebar copy still mentions Tamedia

- File: [src/App.tsx:59](src/App.tsx#L59) — FR `quickGuideText`: "...respectant les standards Tamedia."
- File: [src/App.tsx:100](src/App.tsx#L100) — DE `quickGuideText`: "...nach Tamedia-Standards."
- Effect: Visible in the right-sidebar QuickGuide regardless of which system is active.
- Option: split each translation into `quickGuideText.tamedia` / `quickGuideText.fuw`, or keep one neutral string ("...respectant les standards éditoriaux").

## 3. Locator-map main-marker highlight is hardcoded red

- File: [src/App.tsx:407-408](src/App.tsx#L407-L408) — main location uses inline HTML with `background:#d3343f`, plus `markerColor: "#D3343F"` and `connectorLine` red.
- Effect: FuW locator maps still show a red pennant/connector.
- Option: parameterize the color in the prompt based on `system` (e.g. `${systemCfg.primary}`), or move highlight color into a runtime token resolved server-side.

## 4. Datawrapper base-color is the same for both systems

- File: [server/index.js:106-108](server/index.js#L106-L108) — `"base-color": "#378EBD"` (Tamedia blue) for both.
- Effect: FuW charts default to Tamedia's blue series color.
- Option: extend `SYSTEM_PRESETS` with a `baseColor` field and use `preset.baseColor` in the create + patch bodies.

## 5. Verify both DW themes exist on the configured token

- Themes used: `tagesanzeiger` (Tamedia) and `datawrapper` (FuW).
- Risk: if `tagesanzeiger` is not enabled on the DW account/token, chart creation 4xx's.
- Action: hit `GET https://api.datawrapper.de/v3/themes` (or attempt a sandbox create) once with the production token to confirm both keys resolve.

## 6. "Edit in Datawrapper" link is red regardless of system

- File: [src/App.tsx:917](src/App.tsx#L917) — `text-red-600`.
- Choice we made: left red because Datawrapper's own brand is red.
- Option: switch to `text-brand-primary` for full system theming.

## 7. App identity is hardcoded as Tamedia

- File: [metadata.json:2](metadata.json#L2) — `"name": "Infographic Buddy v.0.4.5(Tamedia)"`.
- Effect: not user-facing inside the running app, but appears in the manifest / window title source.
- Option: rename to a system-neutral identifier (e.g. `Infographic Buddy v.0.4.5`) since the system is now selectable at runtime.

## 8. FuW accent color is a placeholder

- Current FuW primary: `#0E4F7B` / dark `#072B43` in [src/App.tsx](src/App.tsx) (`SYSTEM_CONFIG.fuw`).
- Action: replace with the official FuW brand color when confirmed.
