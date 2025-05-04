#!/usr/bin/env node

// A simplified script to select a logo without requiring interactive input
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the logo number from command line arguments
const logoNumber = process.argv[2] || '1';
const logoIndex = parseInt(logoNumber) - 1;

console.log(`Selecting logo #${logoNumber}: C0sm1c D0ll4r`);

// Define paths
const publicDir = path.join(__dirname, '../../apps/frontend/public');
const selectedLogoPath = path.join(publicDir, 'selected-logo.svg');
const sourceSvgPath = path.join(publicDir, `logo-${logoNumber}.svg`);
const readmePath = path.join(__dirname, '../../README.md');

// Copy the selected logo
try {
  // Check if source SVG exists
  if (fs.existsSync(sourceSvgPath)) {
    // Copy the file
    fs.copyFileSync(sourceSvgPath, selectedLogoPath);
    console.log(`Selected logo saved to ${selectedLogoPath}`);
    
    // Update README.md
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    const logoUrl = `./apps/frontend/public/selected-logo.svg`;
    const logoAltText = `Dollar Game Logo`;
    
    // Look for the existing image line in the README
    const imagePlaceholderRegex = /!\[Dollar Game Screenshot\]\(.*\)/;
    
    if (imagePlaceholderRegex.test(readmeContent)) {
      // Replace the existing image line
      readmeContent = readmeContent.replace(
        imagePlaceholderRegex,
        `![${logoAltText}](${logoUrl})`
      );
    } else {
      // If the image line doesn't exist, add it after the first heading
      const firstHeadingRegex = /# .*\n/;
      readmeContent = readmeContent.replace(
        firstHeadingRegex,
        (match) => `${match}\n![${logoAltText}](${logoUrl})\n`
      );
    }
    
    // Write the updated README.md
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
    console.log('README.md updated with selected logo');
    
    console.log('\n✨ Logo selection complete! ✨');
    console.log('The selected logo has been saved and the README.md has been updated.');
  } else {
    console.error(`Error: Logo file ${sourceSvgPath} does not exist.`);
    process.exit(1);
  }
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}