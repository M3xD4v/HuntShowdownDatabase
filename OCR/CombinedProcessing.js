const fs = require('fs');

let rawdata = fs.readFileSync('output.json');
let data = JSON.parse(rawdata);

function convertToNumbers(weaponsObj) {
    const convertedWeapons = {};
  
    for (const [weapon, stats] of Object.entries(weaponsObj)) {
      convertedWeapons[weapon] = {};
  
      for (const [stat, value] of Object.entries(stats)) {
        // Try to convert the value to a number
        const numValue = Number(value);
        
        // If it's a valid number (not NaN), use the number. Otherwise, keep the original value.
        convertedWeapons[weapon][stat] = isNaN(numValue) ? value : numValue;
      }
    }
  
    return convertedWeapons;
  }


function cleanWeaponStats(weaponsObj) {
    const cleanedWeapons = {};
  
    for (const [weapon, stats] of Object.entries(weaponsObj)) {
      cleanedWeapons[weapon] = {};
  
      for (const [stat, value] of Object.entries(stats)) {
        let cleanedValue = value;
  
        if (stat === "Rate of Fire") {
          cleanedValue = value.replace("rpm", "");
        } else if (stat === "Reload Speed" || stat === "Cycle Time") {
          cleanedValue = value.replace("s", "");
        } else if (stat === "Effective Range") {
          cleanedValue = value.replace("m", "");
        }else if (stat === "Cycle Time") {
          cleanedValue = value.replace("m", "");
        }else if (stat === "Muzzle Velocity") {
          cleanedValue = value.replace("m/s", "");
        }
  
        cleanedWeapons[weapon][stat] = cleanedValue;
      }
    }
  
    return cleanedWeapons;
  }
  
  function addSlotEntry(a) {
    for (const weapon in a) {
      if (a.hasOwnProperty(weapon)) {
        a[weapon]["Slot"] = "medium";
      }
    }
    return a;
  }

let removedUnits = cleanWeaponStats(data);
let convertedNumbers = convertToNumbers(removedUnits);
let final = addSlotEntry(convertedNumbers)


fs.writeFile('output2.json', JSON.stringify(final, null, 2), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
  
