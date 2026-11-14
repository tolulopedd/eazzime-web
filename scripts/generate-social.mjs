import sharp from "sharp";
import { readFileSync } from "node:fs";
const logo = await sharp(readFileSync("public/brand/logo-dark.png"))
  .resize(330)
  .png()
  .toBuffer();
const svg = Buffer.from(
  `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#0b203b"/><circle cx="1050" cy="330" r="330" fill="none" stroke="#174456"/><circle cx="1050" cy="330" r="250" fill="none" stroke="#174456"/><rect x="76" y="224" width="38" height="5" rx="2" fill="#16b7a7"/><text x="76" y="320" fill="white" font-family="Arial, sans-serif" font-size="64" font-weight="bold">Big ideas. Intelligent solutions.</text><text x="76" y="400" fill="#16b7a7" font-family="Arial, sans-serif" font-size="64" font-weight="bold">Real impact.</text><text x="78" y="515" fill="#b6c8d8" font-family="Arial, sans-serif" font-size="23">Technology to empower and digitally transform your business.</text></svg>`,
);
await sharp(svg)
  .composite([{ input: logo, top: 68, left: 76 }])
  .png()
  .toFile("public/social-share.png");
