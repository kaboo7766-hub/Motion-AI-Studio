# Motion AI Studio — Free Local Motion Engine

## 100% free local mode

The application now runs without fal.ai, Kling, Replicate, paid APIs, API keys, access codes, subscriptions, or billing credentials. Image processing and video rendering happen in the user's browser using Canvas, a continuous 2D mesh deformation renderer, and the browser's MediaRecorder API.

## What the local renderer does

- Loads images locally in the browser; it does not upload them to a generation provider.
- Applies camera movement, subtle subject-area mesh deformation, breathing-like motion, walk-like sway, head/torso movement approximations, weather overlays, glow, fog, and particles.
- Exports a real video file locally (WebM on browsers that support it; MP4 only when the browser's MediaRecorder supports MP4).
- Keeps generation, preview, and download as separate steps.
- Includes 100 Arabic motion prompts, local project JSON export, and a scene queue.

## Honest limitations

This is a lightweight 2D animation and mesh-warping engine, not a generative AI video model. It cannot invent missing body parts, create genuinely new poses, or guarantee realistic human walking, facial expressions, or lip-sync. Results depend on the image, browser support, and device performance. Use a recent Chrome-based browser for the best chance of video export.

## Hosting

The static app can be hosted on GitHub Pages or Vercel's free static hosting. No server-side video generation endpoint or paid provider secret is required.
