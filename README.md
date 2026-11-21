# Motion AI Studio — Prototype

A standalone RTL Arabic image-motion editor prototype.

## Run
Open `index.html` in a modern browser. No install/build required.

## Included
- Image upload (file picker or drag & drop)
- Motion prompt textarea and quick prompt presets
- Interactive library of 100 motion commands across 10 categories with search & filtering
- Daily production workflow supporting up to 100 videos/day (quota bar, batch queue, auto-fill from 100 commands, batch processing, and localStorage persistence)
- Camera motion preview using CSS (zoom, zoom out, pan, tilt, orbit-style approximation)
- Duration, speed and intensity selectors
- Preview playback and scrubber
- Basic keyframe markers
- Download project settings and daily batch logs as JSON

## Important limitation
This prototype does not generate real AI videos or export MP4. Its preview applies browser CSS transforms to the uploaded image. Real image-to-video generation requires a video AI API/provider, backend, API credentials and an export pipeline.
