const fs = require('fs');
const path = require('path');
const del = require('del');
const PNGlib = require('node-pnglib');
const Confirm = require('prompt-confirm');
const randomColor = require('random-color');
const faker = require('faker');

const TOTAL_ASSETS = 10000;
const ASSETS_FOLDER = path.resolve(__dirname, '..', 'assets');

function fileExists(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

function rand(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const createDummyAssets = async () => {
  if (await fileExists(path.join(ASSETS_FOLDER, '0.png'))) {
    const confirm = new Confirm('Do you want to recreate the assets?');
    const answer = await confirm.run();
    if (!answer) process.exit(0);
    await del([path.join(ASSETS_FOLDER, '*.png')]);
  }

  const promises = [];

  for (let x = 0; x < TOTAL_ASSETS; x++) {
    let png = new PNGlib(150, 150);

    const color = randomColor().hexString();
    const [min, max] = [rand(0, 74), rand(75, 150)];

    for (let i = min; i < max; i++) {
      for (let j = min; j < max; j++) {
        png.setPixel(i, j, color);
      }
    }

    const metadata = {
      name: faker.hacker.adjective(),
      description: faker.hacker.phrase(),
    };

    const assetPath = path.join(ASSETS_FOLDER, `${x}.png`);
    const metadataPath = path.join(ASSETS_FOLDER, `${x}.json`);

    promises.push(
      fs.promises.writeFile(assetPath, png.getBuffer()),
      fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
    );
  }

  await Promise.all(promises);
};

createDummyAssets()
  .then(() => console.log('Dummy assets has been created!'))
  .catch(console.error);
