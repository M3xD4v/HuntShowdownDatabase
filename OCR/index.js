const { createWorker } = require('tesseract.js');
const path = require('path');
const Jimp = require('jimp');
const fs = require('fs').promises;
let enable_OCR = true;
function transformWeaponData(input) {
  const output = {};

  for (const imageName in input) {
    if (input.hasOwnProperty(imageName)) {
      const values = input[imageName];
      const weaponName = values[0];
      
      const weaponStats = {
        "Capacity": values[1],
        "Damage": values[2],
        "Cycle Time": values[3],
        "Vertical Recoil": values[4],
        "Melee Damage": values[5],
        "Effective Range": values[6],
        "Spread": values[7],
        "Reload Speed": values[8],
        "Heavy Melee Damage": values[9],
        "Rate of Fire": values[10],
        "Sway": values[11],
        "Muzzle Velocity": values[12],
        "Stamina Consumption": values[13],
        "Price": values[14].toString()
      };

      // Remove 's', 'm', 'pm', and 'm/s' from string values before parsing


      output[weaponName] = weaponStats;
    }
  }

  return output;
}

async function processAllImages(inputFolder, outputFolder) {
  try {
      // Ensure the output folder exists
      await fs.mkdir(outputFolder, { recursive: true });

      // Read all files from the input folder
      const files = await fs.readdir(inputFolder);

      // Filter for image files (you can add more extensions if needed)
      const imageFiles = files.filter(file => 
          ['.png', '.jpg', '.jpeg', '.bmp', '.tiff'].includes(path.extname(file).toLowerCase())
      );

      // Process each image
      for (const file of imageFiles) {
          const inputPath = path.join(inputFolder, file);
          const outputPath = path.join(outputFolder, file);

          await imageProcess(inputPath, outputPath);
          console.log(`Processed: ${file}`);
      }

      console.log('All images processed successfully!');
  } catch (error) {
      console.error('Error processing images:', error);
  }
}

async function imageProcess(inputPath, outputPath) {
  try {
      const image = await Jimp.read(inputPath);
      image.grayscale();
      image.contrast(0.2);
      await image.writeAsync(outputPath);
  } catch (error) {
      console.error(`Error processing the image ${inputPath}:`, error);
  }
}

// Usage
const inputFolder = 'Original_Images';
const outputFolder = 'Processed_Images';
if (!enable_OCR) {
  processAllImages(inputFolder, outputFolder);
}

async function readAllFilesInFolder(folderPath) {
  try {
    // Read the directory contents
    const files = await fs.readdir(folderPath);

    // Loop through the files and process them
    const fileList = [];
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        fileList.push(file);
      }
    }
    return fileList;
  } catch (error) {
    console.error('Error reading files:', error);
    throw error;
  }
}
if (enable_OCR) {
(async () => {
  const worker = await createWorker('eng');
  const imageFolder = path.resolve(__dirname, outputFolder);
  const imageFiles = await readAllFilesInFolder(imageFolder); // Await the result here

  const rectangles = [
    {
      "left": 1346,
      "top": 321,
      "width": 487,
      "height": 43
    },
    {
      "left": 1444,
      "top": 601,
      "width": 89,
      "height": 33
    },
    {
      "left": 1365,
      "top": 659,
      "width": 50,
      "height": 19
    },
    {
      "left": 1364,
      "top": 708,
      "width": 54,
      "height": 19
    },
    {
      "left": 1366,
      "top": 756,
      "width": 46,
      "height": 21
    },
    {
      "left": 1363,
      "top": 805,
      "width": 42,
      "height": 20
    },
    {
      "left": 1539,
      "top": 658,
      "width": 48,
      "height": 21
    },
    {
      "left": 1538,
      "top": 707,
      "width": 32,
      "height": 21
    },
    {
      "left": 1539,
      "top": 756,
      "width": 39,
      "height": 20
    },
    {
      "left": 1538,
      "top": 806,
      "width": 39,
      "height": 19
    },
    {
      "left": 1712,
      "top": 657,
      "width": 51,
      "height": 22
    },
    {
      "left": 1711,
      "top": 708,
      "width": 44,
      "height": 20
    },
    {
      "left": 1712,
      "top": 757,
      "width": 57,
      "height": 19
    },
    {
      "left": 1711,
      "top": 805,
      "width": 45,
      "height": 20
    },
    {
      "left": 249,
      "top": 969,
      "width": 52,
      "height": 31
    }
  ];

  const results = {};

  for (const imageFile of imageFiles) {
    const imagePath = path.join(imageFolder, imageFile);
    const values = [];

    for (let i = 0; i < rectangles.length; i++) {
      const { data: { text } } = await worker.recognize(imagePath, { rectangle: rectangles[i] });
      values.push(text.trim());
      //console.log(text.trim())
    }
    console.log("Finished OCR Process")
    results[imageFile] = values;
  }

  fs.writeFile('output.json', JSON.stringify(transformWeaponData(results), null, 2), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
  
  await worker.terminate();
})();
}