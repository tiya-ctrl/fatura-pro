const COUNTRY_CODE = /^[A-Z]{2}$/;

function countryName(code) {
  if (!COUNTRY_CODE.test(code)) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || null;
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const code = String(req.headers["x-vercel-ip-country"] || "").trim().toUpperCase();
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({
    countryCode: COUNTRY_CODE.test(code) ? code : null,
    country: countryName(code),
  });
}
