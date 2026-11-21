const ALLOWED_MODELS = new Set([
  "kling/v4/image-to-video",
  "fal-ai/kling-video/v3/pro/image-to-video"
]);
const FAL_BASE = "https://queue.fal.run";
function send(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
function getModel(value) {
  return typeof value === "string" && ALLOWED_MODELS.has(value) ? value : null;
}
function validRequestId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9-]{8,100}$/.test(value);
}
async function falFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Key ${process.env.FAL_KEY}`, ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.detail || data.error || data.message || `fal.ai returned ${response.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.FAL_KEY) return send(res, 503, { error: "أضف FAL_KEY في Vercel Environment Variables لتفعيل المحرك الاحترافي." });
  try {
    if (req.method === "POST") {
      const body = req.body || {};
      if (body.action !== "submit") return send(res, 400, { error: "إجراء غير صالح." });
      const model = getModel(body.model);
      if (!model) return send(res, 400, { error: "موديل AI غير مسموح." });
      if (typeof body.imageDataUrl !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(body.imageDataUrl) || body.imageDataUrl.length > 8_000_000) {
        return send(res, 400, { error: "الصورة غير صالحة أو أكبر من الحد المسموح بعد الضغط." });
      }
      const prompt = String(body.prompt || "Natural realistic human movement. Preserve identity, face, body proportions and clothing.").slice(0, 2500);
      const duration = Math.max(3, Math.min(model === "kling/v4/image-to-video" ? 30 : 15, Number(body.duration) || 5));
      const input = {
        prompt,
        start_image_url: body.imageDataUrl,
        duration,
        ...(model === "kling/v4/image-to-video" ? { resolution: ["720p", "1080p", "4k"].includes(body.resolution) ? body.resolution : "1080p" } : { generate_audio: false })
      };
      const result = await falFetch(`${FAL_BASE}/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!result.request_id) return send(res, 502, { error: "لم يرجع مزود AI رقم الطلب." });
      return send(res, 202, { request_id: result.request_id, model });
    }
    if (req.method === "GET") {
      const model = getModel(req.query.model);
      const requestId = req.query.request_id;
      const action = req.query.action;
      if (!model || !validRequestId(requestId)) return send(res, 400, { error: "بيانات متابعة الطلب غير صالحة." });
      if (action === "status") {
        const status = await falFetch(`${FAL_BASE}/${model}/requests/${encodeURIComponent(requestId)}/status?logs=0`);
        return send(res, 200, { status: status.status, error: status.error || null });
      }
      if (action === "result") {
        const result = await falFetch(`${FAL_BASE}/${model}/requests/${encodeURIComponent(requestId)}`);
        return send(res, 200, result);
      }
      return send(res, 400, { error: "إجراء متابعة غير صالح." });
    }
    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { error: "Method not allowed." });
  } catch (error) {
    return send(res, 502, { error: error.message || "تعذر الاتصال بمزود AI." });
  }
};
