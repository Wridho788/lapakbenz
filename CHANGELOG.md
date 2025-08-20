# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-21

### Added
- **Component CSS Architecture**: Separated component styles into individual CSS files
  - `AppbarHomepage.css` - Complete styling with gradient, animations, notification badge
  - `AppbarDefault.css` - Consistent styling with Material Design back button
  - `FAB.css` - Enhanced styling with entrance animations and glass effects
  - `BottomNav.css` - Advanced responsive design with multiple breakpoints

### Enhanced
- **BottomNav Component**: 
  - Advanced responsive design with 3 breakpoints
  - Centered layout for tablet devices (430px-690px)
  - Full width on mobile (<430px) and desktop (>690px)
  - Improved gradient backgrounds and backdrop filters
  - Enhanced hover effects and active state indicators
  - Added entrance animations and accessibility improvements

- **AppbarHomepage Component**:
  - Added `hasNotification` prop for notification badge functionality
  - Implemented gradient backgrounds and glass morphism effects
  - Enhanced hover interactions and micro-animations
  - Improved accessibility with proper ARIA labels

- **AppbarDefault Component**:
  - Conditional back button rendering
  - Material Design icons integration
  - Consistent styling with other appbar components
  - Enhanced responsive design

- **FAB Component**:
  - Added entrance animations
  - Enhanced accessibility with customizable aria-label
  - Improved glass morphism effects
  - Better positioning relative to bottom navigation

### Changed
- **CSS Architecture**: Migrated from inline Tailwind classes to dedicated CSS files
- **Responsive Strategy**: Implemented mobile-first design with progressive enhancement
- **Design System**: Unified gradient colors and consistent spacing across components

### Removed
- **App.css Cleanup**: 
  - Removed duplicate bottom navigation styles
  - Removed unused appbar styles
  - Cleaned up conflicting media queries

### Fixed
- **Media Query Conflicts**: Resolved overlapping and conflicting responsive rules
- **Z-index Issues**: Proper layering with consistent z-index values
- **Transform Conflicts**: Fixed transform property conflicts in responsive design

### Technical Details
- **Breakpoints**:
  - Mobile: `max-width: 430px` - Full width, no rounded corners
  - Tablet: `min-width: 430px and max-width: 690px` - Centered, max-width 430px
  - Desktop: `min-width: 691px` - Full width, top rounded corners
- **Performance**: Implemented React.memo for BottomNav component
- **Accessibility**: Enhanced ARIA labels and keyboard navigation support
- **Browser Support**: Added reduced motion and dark mode preferences

## [1.0.0] - 2025-08-21

### Added
- Initial project setup with Vite + React + TypeScript
- PWA configuration with service worker and manifest
- React Router DOM for client-side routing
- Component architecture with reusable components
- Mobile-first responsive design
- Material Design icons integration

### Components
- `MainLayout` - Central layout wrapper
- `BottomNav` - Fixed bottom navigation
- `AppbarHomepage` - Homepage header with user info
- `AppbarDefault` - Default header with back navigation
- `FAB` - Floating Action Button
- `SectionWrapper` - Content section wrapper
- `Dashboard` - Main homepage
- `Event` - Events page
- `Profile` - User profile page
