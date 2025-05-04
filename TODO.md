TODO Things

# Commit changes to git before task completion
Prior to completing a task, ensure that all changes are committed to git and pushed to the origin
Create a git commit which includes all changes since last commit on this branch 
Generate a a summary of changes from the diff of all changed files and your context for the commit message
Ensure to include Development Cost Metrics. Don't use $ in API Cost, replace it with USD xx.yy
Disable the pager for all git commands while figuring out the diff
Use the latest API cost of this task for the API Cost metric.
Use time difference between now and the last commit timestamp for the development time metric


[X] Setup a new git repo for dollar-game, then push it up to GitHub in a public repo
[X] Configure a GitHub action to deploy the infrastructure on every commit to the master branch if any of it's files have changed
[X] Configure a GitHub action to deploy the app on every commit to the master branch if any of it's files have changed
[X] Verify that the github actions are working as expected by executing them locally
[X] Create an md file desribing the architecture of the github actions
[X] Create a git commit which includes all changes since last commit on this branch 
[X] Generate a a summary of changes from the diff of all changed files and the context here.
Ensure to include Development Cost Metrics. Don't use $ in API Cost, replace it with USD xx.yy
Disable the pager for all git commands while figuring out the diff
Use the latest API cost of this task for the API Cost metric.
Use time difference between now and the last commit timestamp for the development time metric
[X] Move the react app into a subdirectory called "app"
[X] The overlays are not disappearing properly after a choice has been made, investigate that using the browser
[X] Fix UI positioning issues with overlays and menus:
   - Ensure overlays clearly indicate where dollars are coming from and going to
   - Keep all overlays visible within the canvas
   - Keep menus visible within the canvas, even when vertices are near the edge
[X] Update the app so that there are separate sliders for the number of vertices and the number of edges and the total amount of money to be used in the game
[X] Generate a a summary of changes from the diff of all changed files and the context here and commit to git
[X] Read ./design/DollarGameProblem.pdf and implement the "Betti number" in the game but call it genus. Display a message on screen when the user changes the vertices, edges or money to determine if the game can be won
[] Update the game graphical resources and all text to be more appealing, in the style of the "l33tc0dzr, l4tt3 drinking, hippy trousers architect in an ivory tower."
   - Immortalize this style as the defacto standard for game and documentation throughout the project be embedding it in the readme and create a new style guide md file.
   - Commit changes to git before completion
[] Update the main README.md with all the latest information about the project