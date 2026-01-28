const fs = require('fs');
const path = require('path');

// Simple SVG icon template - a checkmark in a rounded square
const createSvgIcon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <path
    d="M${size * 0.25} ${size * 0.5} L${size * 0.42} ${size * 0.67} L${size * 0.75} ${size * 0.33}"
    stroke="white"
    stroke-width="${size * 0.08}"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons (can be converted to PNG later)
sizes.forEach(size => {
  const svg = createSvgIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg.trim());
  console.log(`Created ${filename}`);
});

// Create a favicon.ico placeholder (SVG)
const faviconSvg = createSvgIcon(32);
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSvg.trim());
console.log('Created favicon.svg');

console.log('\\nIcons generated! For production, convert SVGs to PNGs using:');
console.log('- https://cloudconvert.com/svg-to-png');
console.log('- Or use sharp/canvas npm packages');
