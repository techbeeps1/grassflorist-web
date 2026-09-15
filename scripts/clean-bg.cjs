const sharp = require('sharp');

async function createCleanBg() {
  const { data, info } = await sharp('public/editorial-pattern-bg.webp')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rBg = 253, gBg = 247, bBg = 242;

  // Let's replace the center text area with the background color
  // The text is roughly in x: [280, 920], y: [180, 620]
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      // In the center box where text is
      if (x >= 280 && x <= 920 && y >= 180 && y <= 620) {
        // Calculate distance from center box border for soft edge blending if needed
        const idx = (y * info.width + x) * info.channels;
        data[idx] = rBg;
        data[idx + 1] = gBg;
        data[idx + 2] = bBg;
      }
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
  .webp({ quality: 95 })
  .toFile('public/editorial-pattern-clean.webp');

  console.log('Clean background created successfully!');
}

createCleanBg().catch(console.error);
