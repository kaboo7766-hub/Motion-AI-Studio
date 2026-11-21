# Motion AI Studio — External Video Engine Edition

A standalone RTL Arabic image-to-video motion editor supporting both **External AI Video APIs** (`fal.ai`, `Replicate`, `Custom Webhook / Proxy`) and an instant **Local Browser Renderer** fallback.

## Run
1. Extract the ZIP archive and open `index.html` in Chrome or Edge.
2. Scroll down to **إعدادات ربط المحرك الخارجي (Image-to-Video API)** (or click **🔌 ربط محرك AI** in the top bar).
3. Choose your provider (`fal.ai`, `Replicate`, or `Custom`), paste your API Key, and click **💾 حفظ وتفعيل الربط**.
4. Upload an image, choose any of the **100 motion commands** (or write your own prompt), and click **🎬 تحويل إلى فيديو وتنزيله**.

## Optional Serverless Proxy (`api/video.js`)
If your browser blocks direct requests due to CORS or if you deploy this app publicly (e.g., on Vercel), deploy `api/video.js` as a serverless endpoint and paste its URL into the **رابط Proxy اختياري** field.
