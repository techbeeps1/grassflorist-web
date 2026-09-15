const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\30ffb136-a642-4f96-b46b-6665006fed29\\.user_uploaded\\media_1789385842349.png';

async function processImages() {
  const meta = await sharp(inputPath).metadata();
  console.log('Source dimension:', meta.width, meta.height);

  // 1. Extract the floral woman photo (right half from 511 to end)
  await sharp(inputPath)
    .extract({ left: 511, top: 0, width: 513, height: 345 })
    .resize(1200, 807, { kernel: 'lanczos3' })
    .webp({ quality: 95 })
    .toFile(path.join(__dirname, '../public/editorial-woman-bouquet.webp'));

  // 2. Full upscale of the banner for English
  await sharp(inputPath)
    .resize(2560, 862, { kernel: 'lanczos3' })
    .webp({ quality: 95 })
    .toFile(path.join(__dirname, '../public/editorial-story-banner.webp'));

  // 3. Extract the left background texture/line art (left half from 0 to 511)
  await sharp(inputPath)
    .extract({ left: 0, top: 0, width: 511, height: 345 })
    .resize(1200, 807, { kernel: 'lanczos3' })
    .webp({ quality: 95 })
    .toFile(path.join(__dirname, '../public/editorial-pattern-bg.webp'));

  console.log('Successfully generated editorial assets!');
}

processImages().catch(err => {
  console.error('Error:', err);
});
