import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/hledani", "/profil", "/oblibene", "/moje-knihovna", "/prihlasit"],
      },
    ],
    sitemap: "https://eknihyzdarma.cz/sitemap.xml",
    host: "https://eknihyzdarma.cz",
  };
}
