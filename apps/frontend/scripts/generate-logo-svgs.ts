#!/usr/bin/env node

// Script to generate SVG logos using Anthropic API
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define interfaces
interface LogoPrompt {
  name: string;
  prompt: string;
  description: string;
  vibration: string;
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
 * Save the SVG content to a file
 * @param svgContent The SVG content to save
 * @param fileName The name of the file to save to
 */
async function saveSvgToFile(svgContent: string, fileName: string): Promise<void> {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const filePath = path.join(publicDir, fileName);
    
    // Ensure the public directory exists
    await fs.mkdir(publicDir, { recursive: true });
    
    // Write the SVG content to the file
    await fs.writeFile(filePath, svgContent);
    
    console.log(`SVG saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving SVG to file ${fileName}:`, error);
  }
}

/**
 * Main function to generate and save all logos
 */
async function generateAllLogos(): Promise<void> {
  try {
    console.log('Starting logo generation...');
    
    // Process each logo prompt
    for (let i = 0; i < LOGO_PROMPTS.length; i++) {
      const logo = LOGO_PROMPTS[i];
      const svgContent = await generateSvgWithAnthropic(logo.prompt, logo.name);
      await saveSvgToFile(svgContent, `logo-${i + 1}.svg`);
    }
    
    console.log('All logos generated successfully!');
  } catch (error) {
    console.error('Error generating logos:', error);
  }
}

// Run the main function
generateAllLogos();