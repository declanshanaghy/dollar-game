# Buy Me a Coffee Features Implementation

This document outlines the Buy Me a Coffee features that have been implemented for the Dollar Game project.

## Features Implemented

### 1. Buy Me a Coffee Button

The official Buy Me a Coffee button has been added to the top right corner of the game interface. This button:
- Uses the official Buy Me a Coffee button image from buymeacoffee.com
- Links to https://buymeacoffee.com/firemandecko
- Has hover effects that match the buymeacoffee.com style
- Is responsive and properly positioned on all screen sizes

### 2. Buy Me a Coffee Header

A header has been added to the top left of the game with:
- A dark background matching the buymeacoffee.com brand style
- "Buy Me a Coffee" text with a coffee cup icon
- Links to https://buymeacoffee.com/firemandecko
- Responsive design that adapts to different screen sizes

### 3. Firemandecko Profile Description

A profile description for firemandecko has been created according to the l33tc0dzr architect style from the style guide. This profile:
- Uses leetspeak for certain words and phrases
- Incorporates coffee culture references
- Includes bohemian and mindfulness themes
- Follows the technical precision and free-spirited energy described in the style guide

The profile description is available in: `apps/frontend/public/firemandecko-profile.md`

### 4. Profile Image Description

A detailed description for creating firemandecko's profile image has been provided. This description:
- Follows the style guide's color palette and aesthetic
- Incorporates elements of the l33tc0dzr, coffee-drinking, hippy architect persona
- Includes symbolic elements related to graph theory and coding
- Provides guidance on the visual style and mood

The profile image description is available in: `apps/frontend/public/firemandecko-profile-image-description.md`

## How to Update Your Buy Me a Coffee Profile

To update your profile on buymeacoffee.com:

1. Log in to your Buy Me a Coffee account at https://buymeacoffee.com
2. Go to your profile settings
3. Copy the content from `apps/frontend/public/firemandecko-profile.md`
4. Paste and format it in the "About" section of your Buy Me a Coffee profile
5. Use the description in `apps/frontend/public/firemandecko-profile-image-description.md` to create a profile image that matches the l33tc0dzr architect style
6. Upload the created image as your profile picture

## Testing the Implementation

To test the implementation:
1. Run the application with `cd apps/frontend && pnpm run dev`
2. Open http://localhost:5173 in your browser
3. Verify that the Buy Me a Coffee button and header are displayed correctly
4. Click on the button or header link to ensure they navigate to https://buymeacoffee.com/firemandecko
5. Test on different screen sizes to ensure responsive design works properly

## Additional Notes

- The styling for the Buy Me a Coffee features is defined in `apps/frontend/src/App.css`
- The HTML structure is defined in `apps/frontend/src/pages/HomePage.tsx`
- All features maintain the existing visual style of the game while incorporating the buymeacoffee.com brand guidelines