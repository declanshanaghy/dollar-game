# L0g0 S3l3ct10n T00l ✨

A CLI tool for generating and selecting logos for the Dollar Game project.

## Overview

This tool generates 6 SVG logos and displays them in a static HTML page. You can view the logos in your browser and select one to be incorporated into the main game.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- An Anthropic API key (for Claude AI logo generation)

## Setup

1. Navigate to the tool directory:
   ```
   cd tools/logo-selection
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create a `.env` file with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Usage

1. Run the tool:
   ```
   pnpm start
   ```

2. The tool will:
   - Generate 6 SVG logos using Claude AI
   - Create a static HTML page with the logos
   - Open the page in your default browser
   - Prompt you to select a logo in the terminal

3. After viewing the logos in your browser, return to the terminal and enter the number of your preferred logo when prompted.

4. The selected logo will be:
   - Saved to the frontend's public directory as `selected-logo.svg`
   - Added to the README.md file of the project

## How It Works

The tool uses Anthropic's Claude AI to generate SVG logos based on predefined prompts. The logos are displayed in a static HTML page for easy viewing and selection. The CLI interface handles the selection process and updates the necessary files.

## Customization

You can customize the logo prompts by editing the `LOGO_PROMPTS` array in the `logo-selection-cli.ts` file.

## Troubleshooting

If the browser doesn't open automatically, you can manually open the HTML file located at `tools/logo-selection/index.html`.

---

Crafted with conscious code & single-origin coffee 🧘‍♂️ | A development tool for the Dollar Game