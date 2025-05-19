// Update all mongodb imports script
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Start from the API directory
const apiDir = path.join(__dirname, 'app', 'api');

// List of files to process
const filesToProcess = [];

// Recursive function to collect all .ts files
function collectTsFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      collectTsFiles(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      filesToProcess.push(filePath);
    }
  }
}

// Process all API files
collectTsFiles(path.join(__dirname, 'app'));

console.log(`Found ${filesToProcess.length} TypeScript files to process`);

// Update imports in a file
async function updateFileImports(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    
    // Check if the file imports the MongoDB connection
    if (content.includes("import { connectToDatabase } from \"@/app/lib/mongodb\"")) {
      console.log(`Updating imports in ${filePath}`);
      
      // Replace the import statement
      const updatedContent = content.replace(
        "import { connectToDatabase } from \"@/app/lib/mongodb\";",
        "import connectToDatabase from \"@/app/lib/mongodb\";"
      );
      
      // Write the updated content back to the file
      await writeFileAsync(filePath, updatedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Process all files
async function processAllFiles() {
  let updatedCount = 0;
  
  for (const filePath of filesToProcess) {
    const updated = await updateFileImports(filePath);
    if (updated) {
      updatedCount++;
    }
  }
  
  console.log(`\nUpdated ${updatedCount} files with the new import syntax.`);
}

// Run the script
processAllFiles();
