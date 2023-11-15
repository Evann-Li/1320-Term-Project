const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description: Runs functions from IOhandler.js
 *
 * Created Date: Nov 5, 2023
 * Author:  Evann Li
 *
 */

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

IOhandler.unzip(zipFilePath, pathUnzipped)
  .then(() => {
    return IOhandler.readDir(pathUnzipped);
  })
  .then(pngFiles => {
    // Return PNG files in unzipped folder
    console.log('PNG Files:', pngFiles);

    const grayscalePromises = pngFiles.map(pngFile => {
      const outputFilePath = path.join(pathProcessed, `gray_${path.basename(pngFile)}`);
      return IOhandler.grayScale(pngFile, outputFilePath);
    });

    // Wait for all grayscale operations to complete
    return Promise.all(grayscalePromises);
  })
  .then(() => {
    console.log('All grayscale conversions complete'); // Return msg after all images have been filtered
  })
  .catch(error => {
    console.error('Error:', error);
  });
