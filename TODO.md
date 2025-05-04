# TODO Things

## Commit changes to git before task completion
Prior to completing a task, ensure that all changes are committed to git and pushed to the origin
Create a git commit which includes all changes since last commit on this branch 
Generate a a summary of changes from the diff of all changed files and your context for the commit message
Ensure to include Development Cost Metrics. Don't use $ in API Cost, replace it with USD xx.yy
Disable the pager for all git commands while figuring out the diff
Use the latest API cost of this task for the API Cost metric.
Use time difference between now and the last commit timestamp for the development time metric


- [x] Setup a new git repo for dollar-game, then push it up to GitHub in a public repo
- [x] Configure a GitHub action to deploy the infrastructure on every commit to the master branch if any of it's files have changed
- [x] Configure a GitHub action to deploy the app on every commit to the master branch if any of it's files have changed
- [x] Verify that the github actions are working as expected by executing them locally
- [x] Create an md file desribing the architecture of the github actions
- [x] Create a git commit which includes all changes since last commit on this branch 
- [x] Generate a a summary of changes from the diff of all changed files and the context here.
Ensure to include Development Cost Metrics. Don't use $ in API Cost, replace it with USD xx.yy
Disable the pager for all git commands while figuring out the diff
Use the latest API cost of this task for the API Cost metric.
Use time difference between now and the last commit timestamp for the development time metric
- [x] Move the react app into a subdirectory called "app"
- [x] The overlays are not disappearing properly after a choice has been made, investigate that using the browser
- [x] Fix UI positioning issues with overlays and menus:
   - Ensure overlays clearly indicate where dollars are coming from and going to
   - Keep all overlays visible within the canvas
   - Keep menus visible within the canvas, even when vertices are near the edge
- [x] Update the app so that there are separate sliders for the number of vertices and the number of edges and the total amount of money to be used in the game
- [x] Generate a a summary of changes from the diff of all changed files and the context here and commit to git
- [x] Read ./design/DollarGameProblem.pdf and implement the "Betti number" in the game but call it genus. Display a message on screen when the user changes the vertices, edges or money to determine if the game can be won
- [x] Update the game graphical resources and all text to be more appealing, in the style of the "l33tc0dzr, l4tt3 drinking, hippy trousers architect in an ivory tower."
   - Immortalize this style as the defacto standard for game and documentation throughout the project be embedding it in the readme and create a new style guide md file.
   - Commit changes to git before completion
- [x] Update the main README.md with all the latest information about the project
- [x] App attribution enhancements
   - Ensure the game is aligned at the top center of the screen
   - Refer to https://www.youtube.com/watch?v=U33dsEcKgeQ as an inspiration for the game
   - Incdlude a link and summary of the video in README.md
- [x] Update the Buy Me a Coffee button to utilize the stylistics guidelines of https://buymeacoffee.com/
   - Implemented official Buy Me a Coffee button in the top right corner
   - Used the official button image from buymeacoffee.com
   - Added hover effects matching the buymeacoffee.com style
- [x] Generate a profile description for firemandecko as the architect of the game according to the stylistic rules
   - Created profile in l33tc0dzr architect style with leetspeak
   - Incorporated coffee culture references and bohemian themes
   - Added technical philosophy and digital journey sections
- [x] Update the game to include a header in the top left to "Buy Me a Coffee" with a link to https://buymeacoffee.com/firemandecko
   - Added header with coffee cup icon and "Buy Me a Coffee" text
   - Used dark background matching buymeacoffee.com brand style
   - Made header responsive for different screen sizes
- [x] Generate a logo for the game and add it to the app
  - Created a CLI tool for logo selection instead of a frontend page:
    - Generates 6 SVG logos using Claude AI
    - Displays them in a static HTML page
    - Allows selection via CLI
    - Updates the README.md with the selected logo
  - Tool is located in tools/logo-selection directory
  - Removed server dependency and backend components
  - Simplified the project structure
- [x] Update the app to support a dark mode theme based on the user's system settings
- [x] Validate the application is working as expected on the new infrastructure
   - Examined infrastructure files to understand the S3 static website hosting setup
   - Identified and fixed an issue with Content-Security-Policy meta tag that was causing browser issues
   - Successfully deployed the application to S3 using GitHub Actions workflow
   - Verified the application is accessible at http://dollar-game-firemandecko.s3-website-us-east-1.amazonaws.com/
- [x] Scale the app down so it fits on a single page better
- [x] Convert TODO.md to a proper markdown format that can distinguish completed tasks from incomplete tasks
- [x] integrate google analytics into the app
- [x] Use the OpenAI API to generate a logo for the game in @/apps/logo-selection and save it in the public directory
   - Logo should be 800 x 450 pixels
   - Update the game to display the logo in place of the current header "The Dollar Game"
   - Update README.md with the new logo
   - Added VS Code launch configuration for easy debugging
- [X] When the game is won or not startable disable all interactivity with the app
   - Display a starburst animation on the canvas when the game is won
   - Make the animation like a fireworks show
- [X] Update the give & receive buttons to be bigger and ensure there is some padding between the buttons and the border
- [X] Fix the build error in https://github.com/declanshanaghy/dollar-game/actions/runs/14820365036/job/41606475816
- [X] Embed https://www.youtube.com/watch?v=mRJUrLD8w9Y in the README.md file as the girst generation of this app
- [X] Update the buy me a coffee button so it always floats in the bottom right corner
- [X] Update all the documentation, all .md files to ensure they all have the latest information
- [X] Create and push a git commit using the dev rules to construct the commit message
- [x] Ensure google analytics are working
- [x] Ensure the layout works on mobile devices
- [X] DNS Migration and SSL Setup:
  - [X] Create Route53 Hosted Zone for firemandecko.com
  - [X] Export DNS Records from Namecheap (A, CNAME, MX, TXT records)
  - [X] Create DNS Records in Route53 including CloudFront and ACM validation records
  - [X] Create infrastructure/route53.tf with hosted zone and DNS record configurations
  - [X] Update infrastructure/ssl.tf to integrate with Route53 for automatic validation
  - [X] Update infrastructure/variables.tf with new domain variables
  - [X] Update GitHub Actions workflow for DNS validation and propagation checks
  - [X] Update Nameservers at Namecheap to point to AWS Route53
  - [X] Verify DNS Propagation using dig, nslookup, or online DNS checkers
  - [X] Update CloudFront configuration to use the validated SSL certificate
  - [X] Verify SSL Certificate and HTTPS access to the website
- [x] Remove the Development Cost Metrics from the rules in @/.cursor/rules/dev_workflow.mdc
  - Development Cost Metrics are not to be used anymore
- [x] Move "🔒 DNS and SSL Implementation" from the main @README to it's own file and link from this new file to the detailed plans
- [x] Remove www.firemandecko.com from the opentofu infrastructure and exec 1 AWS CLI command to delete the record. Ensure all DNS documentation is up to date with this change
- [x] Simplify @README.md by doing the following:
   - Move 🎬 Inspiration further to the top of the page
   - Move 🌌 Cosmic Overview further down the page
   - Move 🧮 Mathematical Foundation further down the page
   - Move 🎨 Bohemian-Tech Aesthetic further down the page
   - Move 🔮 Future Vibrations further down the page
   - Move 🧘‍♂️ Concluding Thoughts to the bottom of the page
   - Suggest if any of the sections can be removed or combined or moved to their own pages
   - Generate a TOC.md for navigating around all the documentation
- [x] Commit all changes to git with a summarized commit message and push it
- [X] The Buy Me a Coffee button is off the bottom of the page on mobile, fix that.
- [X] Include a Buy Me a Coffee button in the header of the @README.md file
- [x] Add to @/.cursor/rules/dev_workflow.mdc that the user will run the dev server. Confirm that it's up yourself before running and if it's not ask the user to start it
- [x] IN @/README.md Move "The Dollar Game: A Graph Theory Odyssey ✨" and the quote into a 2 column table with an invisible border, Move the Buy me a coffee button into the right cell of the table.
   - Commit to git before finishing
- [x] Move the logo to the top of the page in @/README.md, in the left cell. Replace the text that's there with the logo on it's own.
- [x] Rewrite @dev_workflow.mdc anywhere that it mentions task-master, replace that with a logical equivalent of how we're managing tasks in TODO.md now.
- [x] When a person visits the game for the first time, give a short overlay introduction to the game witn interactive guidance on where to click and what it means.
- [] Replace the circles with stacks of cash and update the tutorial and README.md accordingly.
   - The cash icons are stored in @/apps/frontend/public/icons/cash_icons
   - each file is named according to the amount of cash it represents form -50 to +50
   - Modify the game to display the cash icons instead of the circles
   - The cash icons should be displayed where the circles were before with similar styling
   - Update the tutorial to reflect the new cash icons
   - Update the README.md to reflect the new cash icons
   - Commit to git before finishing
- [] Make the game header image float behind the entire game and the controls but dim it down so it doesn't obscure the layer aobve it.