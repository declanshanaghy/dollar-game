#!/usr/bin/env node

// CLI tool to generate a static HTML page with logo options
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
dotenv.config();

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify exec
const execAsync = promisify(exec);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

// Define interfaces
interface LogoPrompt {
  name: string;
  prompt: string;
  description: string;
  vibration: string;
}

interface GeneratedLogo {
  id: string;
  name: string;
  description: string;
  svgContent: string;
  vibration: string;
  prompt: string;
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Logo prompts
const LOGO_PROMPTS: LogoPrompt[] = [
  {
    name: "C0sm1c D0ll4r",
    prompt: "A cosmic dollar sign floating in space with glowing edges, l33tc0dzr aesthetic, digital art style",
    description: "A transcendental representation of currency flowing through the quantum graph space",
    vibration: "High frequency with amethyst undertones"
  },
  {
    name: "D1g1t4l M4nd4l4",
    prompt: "A sacred geometry mandala made of dollar signs and graph vertices, l33tc0dzr meets hippy aesthetic",
    description: "A sacred geometry pattern that represents the interconnectedness of all vertices",
    vibration: "Balanced harmonic resonance"
  },
  {
    name: "Qu4ntum Tr33",
    prompt: "A fractal tree with dollar signs as leaves, l4tt3 stains visible, hippy trousers architect style",
    description: "A recursive fractal pattern symbolizing the growth of mathematical understanding",
    vibration: "Grounding with upward energy flow"
  },
  {
    name: "H1pst3r Gr4ph",
    prompt: "Hand-drawn graph with vintage-inspired vertices and edges, coffee stains, l33tc0dzr aesthetic",
    description: "A hand-drawn, artisanal graph with vintage-inspired vertices and edges",
    vibration: "Analog warmth with digital precision"
  },
  {
    name: "L4tt3 L4pl4c14n",
    prompt: "A mathematical diagram representing a Laplacian matrix with coffee stains, ivory tower aesthetic",
    description: "A coffee-stained mathematical diagram representing the Laplacian matrix of our graph",
    vibration: "Caffeinated consciousness expansion"
  },
  {
    name: "Qu4ntum D0ll4r",
    prompt: "A quantum dollar sign with wave-particle duality, surrounded by mathematical equations, l33tc0dzr aesthetic",
    description: "A quantum representation of currency existing in multiple states simultaneously",
    vibration: "Quantum fluctuations with harmonic overtones"
  }
];

/**
 * Generate an SVG using Anthropic's Claude API
 * @param prompt The prompt to generate the SVG from
 * @param name The name of the logo
 * @returns The generated SVG content
 */
async function generateSvgWithAnthropic(prompt: string, name: string): Promise<string> {
  try {
    console.log(`Generating SVG for ${name}...`);
    
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Create a simple SVG logo based on this description: "${prompt}". 
          The SVG should be clean, visually appealing, and suitable for a website logo.
          The SVG should be 300x300 pixels.
          Return ONLY the SVG code with no explanation or markdown formatting.`
        }
      ],
    });
    
    // Extract the SVG content from the response
    const svgContent = message.content[0].text;
    
    // Clean up the SVG content (remove any markdown formatting if present)
    const cleanSvg = svgContent.replace(/```svg|```/g, '').trim();
    
    return cleanSvg;
  } catch (error) {
    console.error(`Error generating SVG for ${name}:`, error);
    
    // Return a fallback SVG if generation fails
    return `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#3498db"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </svg>`;
  }
}

/**
 * Generate HTML page with logo options
 * @param logos Array of generated logos
 * @returns HTML content as a string
 */
function generateHtmlPage(logos: GeneratedLogo[]): string {
  const logoCards = logos.map((logo, index) => `
    <div class="logo-card" data-logo-id="${logo.id}">
      <h3>${logo.name}</h3>
      <div class="logo-image">
        ${logo.svgContent}
      </div>
      <p class="logo-description">${logo.description}</p>
      <p class="logo-vibration"><strong>Vibration:</strong> ${logo.vibration}</p>
      <div class="logo-number">Logo #${index + 1}</div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>L0g0 S3l3ct10n T00l ✨</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      background-color: #1e1e2e;
      color: #cdd6f4;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1, h2, h3 {
      color: #f5c2e7;
      text-align: center;
    }
    .cosmic-subtitle {
      text-align: center;
      color: #89dceb;
      margin-bottom: 30px;
    }
    .instructions {
      background-color: #313244;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    .logo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .logo-card {
      background-color: #313244;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
    }
    .logo-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }
    .logo-image {
      display: flex;
      justify-content: center;
      margin: 15px 0;
    }
    .logo-image svg {
      max-width: 100%;
      height: auto;
    }
    .logo-description {
      color: #a6adc8;
      font-style: italic;
    }
    .logo-vibration {
      color: #f9e2af;
    }
    .logo-number {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #cba6f7;
      color: #1e1e2e;
      padding: 5px 10px;
      border-radius: 5px;
      font-weight: bold;
    }
    .mindful-text {
      text-align: center;
      color: #a6adc8;
      font-size: 0.9em;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <h1>L0g0 S3l3ct10n T00l ✨</h1>
  <p class="cosmic-subtitle">Ch4nn3l th3 v1su4l 3n3rgy 0f y0ur ch01c3 🌌</p>
  
  <div class="instructions">
    <p>View the logo options below and note the number of your preferred logo.</p>
    <p>Return to the terminal and enter the number when prompted.</p>
  </div>
  
  <div class="logo-grid">
    ${logoCards}
  </div>
  
  <p class="mindful-text">
    Crafted with conscious code & single-origin coffee 🧘‍♂️ | A development tool for the Dollar Game
  </p>
</body>
</html>
  `;
}

/**
 * Save the HTML content to a file
 * @param htmlContent The HTML content to save
 * @param fileName The name of the file to save to
 */
async function saveHtmlToFile(htmlContent: string, fileName: string): Promise<string> {
  try {
    const outputDir = path.join(__dirname, '..', '..', '..', 'tools', 'logo-selection');
    const filePath = path.join(outputDir, fileName);
    
    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write the HTML content to the file
    await fs.writeFile(filePath, htmlContent);
    
    console.log(`HTML saved to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`Error saving HTML to file ${fileName}:`, error);
    throw error;
  }
}

/**
 * Save the selected logo to the frontend public directory
 * @param svgContent The SVG content to save
 * @param logoId The ID of the logo
 */
async function saveSelectedLogo(svgContent: string, logoId: string): Promise<void> {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const filePath = path.join(publicDir, `selected-logo.svg`);
    
    // Write the SVG content to the file
    await fs.writeFile(filePath, svgContent);
    
    console.log(`Selected logo saved to ${filePath}`);
    
    // Update the README.md with the selected logo
    await updateReadmeWithLogo(logoId);
  } catch (error) {
    console.error(`Error saving selected logo:`, error);
  }
}

/**
 * Update the README.md with the selected logo
 * @param logoId The ID of the selected logo
 */
async function updateReadmeWithLogo(logoId: string): Promise<void> {
  try {
    const readmePath = path.join(__dirname, '..', '..', '..', 'README.md');
    let readmeContent = await fs.readFile(readmePath, 'utf8');
    
    // Replace the placeholder image with the selected logo
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
    await fs.writeFile(readmePath, readmeContent, 'utf8');
    
    console.log('README.md updated with selected logo');
  } catch (error) {
    console.error('Error updating README:', error);
  }
}

/**
 * Create a readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Main function to generate logos and create HTML page
 */
async function main(): Promise<void> {
  try {
    console.log('✨ L0g0 S3l3ct10n T00l ✨');
    console.log('Generating logos and creating HTML page...');
    
    const generatedLogos: GeneratedLogo[] = [];
    
    // Generate SVGs for each logo prompt
    for (let i = 0; i < LOGO_PROMPTS.length; i++) {
      const logo = LOGO_PROMPTS[i];
      const svgContent = await generateSvgWithAnthropic(logo.prompt, logo.name);
      
      generatedLogos.push({
        id: `logo-${i + 1}`,
        name: logo.name,
        description: logo.description,
        svgContent: svgContent,
        vibration: logo.vibration,
        prompt: logo.prompt
      });
      
      // Save individual SVG files to the public directory
      const publicDir = path.join(__dirname, '..', 'public');
      const filePath = path.join(publicDir, `logo-${i + 1}.svg`);
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(filePath, svgContent);
    }
    
    // Generate HTML page with logo options
    const htmlContent = generateHtmlPage(generatedLogos);
    
    // Save HTML page
    const htmlPath = await saveHtmlToFile(htmlContent, 'index.html');
    
    console.log('\n✨ HTML page with logo options generated successfully! ✨');
    console.log(`Open ${htmlPath} in your browser to view the logo options.`);
    
    // Open the HTML file in the default browser
    const openCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    
    try {
      await execAsync(`${openCommand} ${htmlPath}`);
      console.log('Browser opened with logo options.');
    } catch (err) {
      console.error('Failed to open browser:', err);
      console.log(`Please open ${htmlPath} in your browser manually.`);
    }
    
    // Ask the user to select a logo
    console.log('\nAfter viewing the logos in your browser, please select one:');
    for (let i = 0; i < generatedLogos.length; i++) {
      console.log(`${i + 1}. ${generatedLogos[i].name}`);
    }
    
    const selection = await question('\nEnter the number of the logo you want to select (1-6): ');
    const logoIndex = parseInt(selection) - 1;
    
    if (logoIndex >= 0 && logoIndex < generatedLogos.length) {
      const selectedLogo = generatedLogos[logoIndex];
      console.log(`\nYou selected: ${selectedLogo.name}`);
      
      // Save the selected logo to the frontend public directory
      await saveSelectedLogo(selectedLogo.svgContent, selectedLogo.id);
      
      console.log('\n✨ Logo selection complete! ✨');
      console.log('The selected logo has been saved and the README.md has been updated.');
    } else {
      console.log('\nInvalid selection. Please run the tool again to make a valid selection.');
    }
    
    // Close the readline interface
    rl.close();
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main();