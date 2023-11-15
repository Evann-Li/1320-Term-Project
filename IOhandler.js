/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date: Nov 5, 2023
 * Author: Evann Li
 *
 */

const unzipper = require("unzipper"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(pathIn);

    // Define the extraction directory based on whether pathOut already contains 'unzipped'
    let extractionDirectory = pathOut.endsWith('unzipped') ? pathOut : path.join(pathOut, 'unzipped');

    fs.mkdir(extractionDirectory, { recursive: true }, (err) => {
      if (err) {
        console.error(`Error creating directory: ${err.message}`);
        reject(err);
        return;
      }

      stream.pipe(unzipper.Extract({ path: extractionDirectory }));

      // Use the 'finish' event to know when the extraction is complete
      stream.on('end', () => {
        console.log('Extraction operation complete');
        resolve();
      });
    });
  });
};


/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const pngFiles = files
          .filter(file => path.extname(file).toLowerCase() === '.png')
          .map(file => path.join(dir, file));

        resolve(pngFiles);
      }
    });
  });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    // Read the PNG image from pathIn
    const inputStream = fs.createReadStream(pathIn);
    const png = new PNG();

    inputStream
      .pipe(png)
      .on('parsed', function () {
        // Loop through the pixel array and apply grayscale filter
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2; // RGBA values

            // Calculate grayscale value
            const gray = Math.round(0.2126 * this.data[idx] + 0.7152 * this.data[idx + 1] + 0.0722 * this.data[idx + 2]);

            // Set RGB values to grayscale
            this.data[idx] = gray; // Red
            this.data[idx + 1] = gray; // Green
            this.data[idx + 2] = gray; // Blue
            // Alpha channel remains unchanged
          }
        }

        // Write the modified pixel array to a new PNG image at pathOut
        const outputStream = fs.createWriteStream(pathOut);
        this.pack().pipe(outputStream);

        outputStream.on('finish', () => {
          resolve();
        });

        outputStream.on('error', (error) => {
          console.error(`Error writing grayscale image: ${error.message}`);
          reject(error);
        });
      });
  });
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
