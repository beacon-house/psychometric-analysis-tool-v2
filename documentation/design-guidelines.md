# Design Guidelines

## Core Principles

### Layout & Consistency
- **Fixed Containers**: Use fixed-height containers for question text to ensure interactive elements (buttons, scales) appear at consistent vertical positions across all questions
- **Single Responsibility**: Separate question display from response options into distinct containers
- **Responsive Design**: Mobile-first approach with appropriate breakpoints

## Color Palette

### Likert Scale Color Coding
- **Strongly Disagree (1)**: `#ffe5e5` background, `#c41e3a` text
- **Disagree (2)**: `#fff0e5` background, `#d97706` text
- **Neutral (3)**: `#f0f0f0` background, `#666` text
- **Agree (4)**: `#e5f5e5` background, `#059669` text
- **Strongly Agree (5)**: `#d0f0d0` background, `#047857` text

### Selected States
- Use darker, saturated versions of base colors
- White text on colored backgrounds for selected states

### Progress & Accents
- Progress bars: Linear gradient from `#3b82f6` (blue) to `#10b981` (green)

## Mobile Design Requirements

### Likert Scale on Mobile (≤640px)
- **Vertical Layout**: Stack buttons vertically instead of horizontal
- **Full-Width Buttons**: 56px height, left-aligned layout
- **Number + Label**: Number on left, label text on right (left-aligned)
- **Touch Targets**: 10px gap between buttons for easy tapping
- **Readable Text**: 20px for numbers, 15px for labels

### Question Containers
- **Desktop**: 150px min-height for question text container
- **Tablet**: 140px min-height
- **Mobile**: 120px min-height

## Typography
- Question text: 22px (desktop), 18px (mobile), font-weight 600
- Line height: 1.5 for readability
- Center-aligned question text
- Max-width 700px for optimal reading

## Spacing
- 32px gap between question container and response section (desktop)
- 24px gap on mobile
- Consistent padding across breakpoints

## Interaction Design
- Hover states: Subtle lift (`translateY(-2px)`) with shadow
- Selected states: Distinct color change with border
- Smooth transitions (0.2s ease)
- Clear visual feedback on all interactions
