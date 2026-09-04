const QRCode = require('qrcode');
const fs = require('fs');
const targets = {
  'qr-avis-google': 'https://g.page/r/CXqJtbaOg9FUEAE/review',
  'qr-instagram': 'https://www.instagram.com/salonmimi.marrakech',
  'qr-tiktok': 'https://www.tiktok.com/@mimicoiffure700',
};
(async () => {
  for (const [name, url] of Object.entries(targets)) {
    const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'H', margin: 1, color: { dark: '#2C1508', light: '#00000000' } });
    fs.writeFileSync(`assets/${name}.svg`, svg);
    const svgLight = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'H', margin: 1, color: { dark: '#F6EFE3', light: '#00000000' } });
    fs.writeFileSync(`assets/${name}-light.svg`, svgLight);
    console.log('wrote', name);
  }
})();
