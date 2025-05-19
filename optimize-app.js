// TechNews Application Cleanup and Optimization Utility
// This script identifies and optionally removes unused files to optimize the codebase

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Application root directory
const rootDir = path.resolve(__dirname);

// Files and patterns to analyze for potential removal
const filesToAnalyze = {
  testScripts: {
    pattern: /^test-.*\.(js|ts|cjs|mjs)$/,
    description: 'Test scripts (test-*.js)',
    files: [],
    keep: [
      'test-all-features.ps1',
      'verify-all-links.js',
      'verify-article-slug-fix.js'
    ]
  },
  verificationScripts: {
    pattern: /^verify-.*\.(js|ts|cjs|mjs|ps1)$/,
    description: 'Verification scripts (verify-*.js/ps1)',
    files: [],
    keep: [
      'verify-all-links.js',
      'verify-article-slug-fix.js',
      'verify-fix.ps1'
    ]
  },
  setupScripts: {
    pattern: /^setup-.*\.(js|ts|cjs|mjs|ps1)$/,
    description: 'Setup scripts (setup-*.js/ps1)',
    files: [],
    keep: [
      'setup-mongodb.ps1'
    ]
  },
  markdownDocs: {
    pattern: /\.md$/,
    description: 'Markdown documentation files',
    files: [],
    keep: [
      'README.md',
      'feature-documentation.md',
      'docs/article-slug-fix.md'
    ]
  },
  temporaryFiles: {
    pattern: /\.(tmp|temp|log|old|bak)$/,
    description: 'Temporary and backup files',
    files: [],
    keep: []
  }
};

// Find all files matching the patterns
function findMatchingFiles() {
  console.log('Scanning for files that can be optimized...');
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // Skip node_modules and .git directories
      if (item.isDirectory()) {
        if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== '.next') {
          scanDirectory(fullPath);
        }
        continue;
      }
      
      // Check if file matches any pattern
      for (const category in filesToAnalyze) {
        if (filesToAnalyze[category].pattern.test(item.name)) {
          // Check if file is in the keep list
          const keepFile = filesToAnalyze[category].keep.includes(item.name);
          
          const relativePath = path.relative(rootDir, fullPath);
          filesToAnalyze[category].files.push({
            path: relativePath,
            name: item.name,
            keep: keepFile,
            size: fs.statSync(fullPath).size
          });
        }
      }
    }
  }
  
  scanDirectory(rootDir);
  
  // Print summary of found files
  console.log('\nFiles that can be optimized:');
  
  let totalSize = 0;
  let totalFiles = 0;
  let removableSize = 0;
  let removableFiles = 0;
  
  for (const category in filesToAnalyze) {
    const categoryFiles = filesToAnalyze[category].files;
    
    console.log(`\n${filesToAnalyze[category].description}:`);
    if (categoryFiles.length === 0) {
      console.log('  None found');
      continue;
    }
    
    let categorySize = 0;
    let categoryRemovableSize = 0;
    let categoryRemovableCount = 0;
    
    for (const file of categoryFiles) {
      const sizeInKB = (file.size / 1024).toFixed(2);
      categorySize += file.size;
      
      if (!file.keep) {
        console.log(`  ${file.path} (${sizeInKB} KB) - Recommended to remove`);
        categoryRemovableSize += file.size;
        categoryRemovableCount++;
      } else {
        console.log(`  ${file.path} (${sizeInKB} KB) - Recommended to keep`);
      }
    }
    
    totalFiles += categoryFiles.length;
    totalSize += categorySize;
    removableFiles += categoryRemovableCount;
    removableSize += categoryRemovableSize;
    
    const categoryTotalSizeKB = (categorySize / 1024).toFixed(2);
    const categoryRemovableSizeKB = (categoryRemovableSize / 1024).toFixed(2);
    
    console.log(`  Total: ${categoryFiles.length} files (${categoryTotalSizeKB} KB), ${categoryRemovableCount} can be removed (${categoryRemovableSizeKB} KB)`);
  }
  
  // Print overall summary
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  const removableSizeMB = (removableSize / (1024 * 1024)).toFixed(2);
  
  console.log(`\nOverall summary:`);
  console.log(`Total files analyzed: ${totalFiles} (${totalSizeMB} MB)`);
  console.log(`Files that can be removed: ${removableFiles} (${removableSizeMB} MB)`);
  
  return removableFiles > 0;
}

// Clean up the files
function cleanupFiles() {
  return new Promise((resolve) => {
    rl.question('\nWould you like to remove the recommended files? (yes/no): ', (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('\nRemoving files...');
        let removedCount = 0;
        
        for (const category in filesToAnalyze) {
          const categoryFiles = filesToAnalyze[category].files;
          
          for (const file of categoryFiles) {
            if (!file.keep) {
              try {
                fs.unlinkSync(path.join(rootDir, file.path));
                console.log(`✅ Removed: ${file.path}`);
                removedCount++;
              } catch (error) {
                console.error(`❌ Error removing ${file.path}: ${error.message}`);
              }
            }
          }
        }
        
        console.log(`\nCleanup complete: ${removedCount} files removed.`);
        resolve(true);
      } else {
        console.log('\nNo files were removed.');
        resolve(false);
      }
    });
  });
}

// Check for duplicate components and unused imports
function analyzeCodeDuplication() {
  console.log('\nAnalyzing code for potential duplication and optimization...');
  
  // List of potential duplicate components to check
  const componentsToCheck = [
    { name: 'AdminWrapper', paths: ['app/components/dashboard/AdminWrapper.tsx', 'app/(admin)/layout.tsx'] },
    { name: 'DashboardSidebar', paths: ['app/components/dashboard/DashboardSidebar.tsx'] },
    { name: 'AdminHeader', paths: ['app/components/dashboard/AdminHeader.tsx'] }
  ];
  
  for (const component of componentsToCheck) {
    console.log(`\nChecking for duplicate implementations of ${component.name}:`);
    
    let foundPaths = [];
    for (const pathToCheck of component.paths) {
      const fullPath = path.join(rootDir, pathToCheck);
      
      if (fs.existsSync(fullPath)) {
        foundPaths.push(pathToCheck);
        
        // Check usage count with grep
        exec(`grep -r "import.*${component.name}" --include="*.tsx" --include="*.ts" .`, 
          { cwd: rootDir }, 
          (error, stdout, stderr) => {
            if (error) {
              console.log(`  Could not analyze usage: ${error.message}`);
              return;
            }
            
            const lines = stdout.split('\n').filter(line => line.trim() !== '');
            console.log(`  Found in: ${pathToCheck}`);
            console.log(`  Referenced in ${lines.length} file(s)`);
            
            if (lines.length > 0) {
              console.log('  Usage examples:');
              lines.slice(0, 3).forEach(line => {
                console.log(`    ${line}`);
              });
              
              if (lines.length > 3) {
                console.log(`    ... and ${lines.length - 3} more`);
              }
            }
          }
        );
      }
    }
    
    if (foundPaths.length > 1) {
      console.log(`  ⚠️ Potential duplicate implementations found in multiple files!`);
    } else if (foundPaths.length === 0) {
      console.log(`  Component not found in expected locations.`);
    }
  }
}

// Check for unused dependencies in package.json
function analyzeUnusedDependencies() {
  console.log('\nAnalyzing package.json for potentially unused dependencies...');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('  package.json not found');
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log(`  Found ${Object.keys(dependencies).length} dependencies in package.json`);
    
    // List some commonly unused or overlapping dependencies to check
    const depsToCheck = [
      { name: 'chalk', alternatives: 'Use console colors directly' },
      { name: 'moment', alternatives: 'Use date-fns (already included) instead' },
      { name: 'jquery', alternatives: 'Use native DOM methods instead' },
      { name: 'lodash', alternatives: 'Use native JavaScript methods when possible' },
      { name: 'puppeteer', alternatives: 'Move to devDependencies if only used for testing' }
    ];
    
    console.log('\n  Dependencies to consider removing or replacing:');
    
    for (const dep of depsToCheck) {
      if (dependencies[dep.name]) {
        console.log(`    - ${dep.name}: ${dependencies[dep.name]} (Suggestion: ${dep.alternatives})`);
      }
    }
    
    // Check for multiple testing frameworks
    const testingFrameworks = ['jest', 'mocha', 'jasmine', 'karma', 'ava'];
    const foundTestFrameworks = testingFrameworks.filter(fw => dependencies[fw]);
    
    if (foundTestFrameworks.length > 1) {
      console.log(`\n  ⚠️ Multiple testing frameworks detected: ${foundTestFrameworks.join(', ')}`);
      console.log('    Consider standardizing on one testing framework.');
    }
    
  } catch (error) {
    console.error(`  Error analyzing package.json: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log('='.repeat(70));
  console.log('TechNews Application Cleanup and Optimization Utility');
  console.log('='.repeat(70));
  console.log('\nThis utility will help optimize the TechNews application by:');
  console.log('1. Identifying and removing unused test and temporary files');
  console.log('2. Analyzing potential code duplication');
  console.log('3. Checking for unused dependencies');
  console.log('\nStarting optimization analysis...\n');
  
  const hasRemovableFiles = findMatchingFiles();
  
  if (hasRemovableFiles) {
    await cleanupFiles();
  }
  
  analyzeCodeDuplication();
  analyzeUnusedDependencies();
  
  console.log('\n='.repeat(70));
  console.log('Optimization suggestions:');
  console.log('='.repeat(70));
  console.log('\n1. Consolidate test files into a structured test directory');
  console.log('2. Remove duplicate admin layout components');
  console.log('3. Implement proper code splitting to reduce bundle size');
  console.log('4. Add proper caching headers for static assets');
  console.log('5. Convert client-side rendered pages to server components where appropriate');
  console.log('6. Use Next.js Image component consistently for all images');
  console.log('7. Implement a CI/CD pipeline for automated testing');
  
  console.log('\nOptimization analysis complete!');
  rl.close();
}

main();
