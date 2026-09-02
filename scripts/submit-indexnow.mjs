const siteUrl = "https://faturapro.app";
const indexNowKey = "397960bef6bc4a55a8a87a0445a9264b";
const keyLocation = `${siteUrl}/${indexNowKey}.txt`;
const sitemapUrl = `${siteUrl}/sitemap.xml`;

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDeployment() {
  for (let attempt = 1; attempt <= 18; attempt += 1) {
    try {
      const response = await fetch(keyLocation, { cache: "no-store" });
      const body = response.ok ? (await response.text()).trim() : "";
      if (body === indexNowKey) return;
    } catch {
      // A deployment may still be propagating. Retry below.
    }

    if (attempt < 18) await sleep(10_000);
  }

  throw new Error(`IndexNow key file is not available at ${keyLocation}`);
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

async function readSitemapUrls() {
  const response = await fetch(sitemapUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not read sitemap (${response.status})`);
  }

  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()))
    .filter((url) => {
      try {
        return new URL(url).hostname === "faturapro.app";
      } catch {
        return false;
      }
    });

  if (urls.length === 0) throw new Error("The sitemap contains no valid URLs");
  return [...new Set(urls)].slice(0, 10_000);
}

await waitForDeployment();
const urlList = await readSitemapUrls();

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: "faturapro.app",
    key: indexNowKey,
    keyLocation,
    urlList,
  }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow rejected the submission (${response.status})`);
}

console.log(`IndexNow accepted ${urlList.length} URLs (${response.status}).`);
