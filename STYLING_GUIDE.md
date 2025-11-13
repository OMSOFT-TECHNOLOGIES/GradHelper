# Unified Component Styling Guide

This document outlines the standardized styling classes for consistent UI components across the GradHelper application.

## Overview

All components now use unified CSS classes defined in `src/styles/unified-components.css`. This ensures consistent look, feel, and behavior across the entire application.

## Form Elements

### Form Inputs
```tsx
// Standard text input
<input type="text" className="form-input" placeholder="Enter text..." />

// Input with icon
<div className="input-with-icon">
  <Search className="input-icon" />
  <input type="text" className="form-input" placeholder="Search..." />
</div>

// Error state
<div className="input-error">
  <input type="text" className="form-input" />
</div>
```

### Select Dropdowns
```tsx
// Standard select dropdown
<select className="form-select">
  <option value="">Choose option...</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>

// Select with custom width
<select className="form-select w-32">
  <option value="all">All</option>
  <option value="active">Active</option>
</select>
```

## Modals

### Basic Modal Structure
```tsx
<div className="modal-overlay">
  <div className="modal modal-md">
    <div className="modal-header">
      <div>
        <h3 className="modal-title">Modal Title</h3>
        <p className="modal-subtitle">Optional subtitle</p>
      </div>
      <button className="modal-close" onClick={onClose}>
        <X className="w-5 h-5" />
      </button>
    </div>
    
    <div className="modal-content">
      {/* Modal body content */}
    </div>
    
    <div className="modal-actions">
      <button className="btn btn-secondary" onClick={onClose}>
        Cancel
      </button>
      <button className="btn btn-primary" onClick={onSubmit}>
        Submit
      </button>
    </div>
  </div>
</div>
```

### Modal Sizes
- `modal-sm` - Small modal (max-width: 400px)
- `modal-md` - Medium modal (max-width: 500px) - Default
- `modal-lg` - Large modal (max-width: 600px)
- `modal-xl` - Extra large modal (max-width: 800px)

## Buttons

### Button Variants
```tsx
// Primary action button
<button className="btn btn-primary">Save</button>

// Secondary/cancel button
<button className="btn btn-secondary">Cancel</button>

// Danger/delete button
<button className="btn btn-danger">Delete</button>

// Success button
<button className="btn btn-success">Approve</button>

// Ghost button (minimal styling)
<button className="btn btn-ghost">Skip</button>
```

### Button Sizes
```tsx
// Small button
<button className="btn btn-primary btn-sm">Small</button>

// Default button
<button className="btn btn-primary">Default</button>

// Large button
<button className="btn btn-primary btn-lg">Large</button>
```

## Component States

### Form Error States
Add `input-error` class to wrapper div:
```tsx
<div className="input-error">
  <input type="text" className="form-input" />
</div>
```

### Disabled States
All form elements and buttons support disabled state:
```tsx
<input type="text" className="form-input" disabled />
<button className="btn btn-primary" disabled>Submit</button>
```

## Responsive Behavior

All components are responsive by default:

- **Mobile (< 768px)**: Modals become full-width with reduced padding
- **Small mobile (< 480px)**: Form elements have smaller padding and font sizes
- **Modal actions**: Stack vertically on mobile with full-width buttons

## Color System

The unified components use CSS custom properties from `globals.css`:

- `--primary`: Main brand color (blue)
- `--color-green`: Success states
- `--color-blue`: Primary actions
- Form states use semantic colors (red for errors, etc.)

## Migration Guide

### Updating Existing Components

1. **Replace old modal classes:**
   ```tsx
   // OLD
   <div className="feedback-modal-overlay">
     <div className="feedback-modal">
   
   // NEW
   <div className="modal-overlay">
     <div className="modal modal-md">
   ```

2. **Update form inputs:**
   ```tsx
   // Ensure selects use form-select
   <select className="form-select"> // Not form-input
   
   // Text inputs continue using form-input
   <input className="form-input">
   ```

3. **Update button classes:**
   ```tsx
   // OLD
   <button className="btn btn-outline">Cancel</button>
   
   // NEW
   <button className="btn btn-secondary">Cancel</button>
   ```

## Best Practices

1. **Always use unified classes** instead of custom styling
2. **Choose appropriate modal sizes** based on content
3. **Use semantic button variants** (primary for main actions, secondary for cancel, danger for destructive actions)
4. **Include proper error states** for form validation
5. **Test on mobile devices** to ensure responsive behavior works correctly

## Implementation Status

✅ **Completed Components:**
- Partnership FiltersSection
- MeetingsView modals (Create, Details)
- AdminDashboard modals
- Partnership modals (Reject, RequestDetail)
- All form inputs using unified classes

The unified styling system provides consistent, accessible, and responsive UI components across the entire application.