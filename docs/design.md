# Design Brief: Portfolio CMS

## Product

Portfolio CMS for Shandy Shulton Shihab.

This CMS is an admin dashboard used to manage portfolio content, especially projects and multi-image project galleries. The public portfolio is a separate React/Vite website, while this CMS will manage data, images, and public API content.

## Design Goal

Create a clean, modern, practical CMS dashboard that feels professional and easy to use. The design should prioritize content management, fast scanning, and clear editing flows.

The interface should not feel like a marketing landing page. It should feel like a focused admin tool.

## Target User

Primary user:

- Shandy, the portfolio owner and admin.

Main tasks:

- Add a new project.
- Edit existing project details.
- Upload multiple screenshots for a project.
- Reorder project screenshots.
- Manage bilingual Indonesian and English content.
- Publish or unpublish projects.
- Preview what will appear on the portfolio website.

## Visual Direction

Style keywords:

- Clean
- Professional
- Minimal
- Developer portfolio
- Content-first
- Calm dashboard
- Modern but not overly decorative

Avoid:

- Large marketing hero sections
- Decorative gradient-heavy backgrounds
- Overly rounded card-heavy UI
- Playful SaaS mascot style
- Cluttered analytics dashboard feel

## Color Palette

Use a neutral dashboard base with warm portfolio-inspired accents.

Suggested colors:

```txt
Background: #F6F4F0
Surface: #FFFFFF
Surface Muted: #EFEAE3
Border: #DDD6CC
Text Primary: #171412
Text Muted: #6F675F
Accent: #C8522A
Accent Hover: #E8735A
Success: #2A9D62
Warning: #C98A1C
Danger: #C74343
Info: #2A7CC8
```

Dark mode is optional for MVP. If included, keep it subtle and readable.

## Typography

Use clean, readable dashboard typography.

Suggested:

- Headings: Syne or Inter SemiBold
- Body: Inter, Outfit, or system sans-serif
- Code/slug fields: DM Mono or monospace

Typography rules:

- Dashboard headings should be compact.
- Avoid oversized hero text.
- Form labels must be clear and readable.
- Use consistent text hierarchy.

## Layout

Use a classic admin layout:

- Left sidebar navigation
- Top bar with page title and admin actions
- Main content area
- Responsive layout for tablet/mobile

Sidebar items:

- Dashboard
- Projects
- Media
- Profile Content
- Settings

MVP can focus only on:

- Dashboard
- Projects
- Settings

Top bar:

- Current page title
- Search or quick action
- Admin profile menu
- Logout

## Main Pages

### 1. Login Page

Purpose:

Allow admin to securely access CMS.

Layout:

- Centered login form
- CMS name: "Portfolio CMS"
- Small subtitle: "Manage portfolio content and project galleries."
- Email input
- Password input
- Login button

Visual:

- Minimal
- No large illustration required
- Use a small accent line or subtle brand mark

### 2. Dashboard Overview

Purpose:

Give quick overview of portfolio content.

Sections:

- Total Projects
- Published Projects
- Draft Projects
- Total Uploaded Images
- Recently Updated Projects

Primary CTA:

- "New Project"

Dashboard should be useful but not analytics-heavy.

### 3. Project List

Purpose:

Scan, search, and manage projects.

Layout:

- Header row with title "Projects"
- Primary button: "New Project"
- Search input
- Filter: All / Published / Draft
- Sort control

Project list item/card:

- Thumbnail screenshot
- Project title
- Type
- Status badge
- Date
- Tech stack chips
- Last updated
- Quick actions: Edit, Preview, More

Recommended display:

- Desktop: table-like list with thumbnail
- Mobile: stacked compact cards

Status badges:

- Published: green
- Draft: gray
- Live on VPS: blue

### 4. Create/Edit Project

Purpose:

Manage all project content.

Layout:

- Page title: "Edit Project" or "New Project"
- Top actions: Save Draft, Publish, Preview
- Main form column
- Right side settings panel

Main form sections:

1. Basic Information
2. Bilingual Content
3. Tech Stack
4. Links
5. Highlights
6. Image Gallery

Basic Information fields:

- Slug
- Accent color
- Sort order
- Visibility

Bilingual Content:

Use tabs:

- Indonesia
- English

Fields per language:

- Title
- Type
- Role
- Date
- Status
- Summary
- Description

Highlights:

- Repeatable input list
- Add highlight button
- Drag handle for reorder

Tech Stack:

- Tag input
- Existing examples: React.js, Vite, Tailwind CSS, Laravel, MySQL, Golang

Links:

- GitHub URL
- Live Demo URL

Right side settings panel:

- Publish state
- Last updated
- Created date
- Preview URL
- Delete project button

### 5. Project Image Gallery

Purpose:

Upload and manage multiple screenshots for one project.

Gallery behavior:

- Upload area with drag and drop
- Grid of uploaded images
- First image is default preview
- Drag to reorder
- Edit label and alt text
- Delete image

Image card:

- Screenshot thumbnail
- Label ID
- Label EN
- Alt ID
- Alt EN
- Sort handle
- Delete icon button

Empty state:

- Icon
- Text: "No screenshots uploaded yet."
- Button: "Upload Screenshots"

Recommended image ratio:

- 16:10 or 16:9

### 6. Preview Mode

Purpose:

Let admin preview project before publishing.

Preview should show:

- Large browser-style project screenshot
- Thumbnail selector
- Project title
- Summary
- Description
- Highlights
- Stack chips
- GitHub / Live Demo buttons

This should resemble the public portfolio Projects page.

## Components

Use these components:

- Sidebar
- Top bar
- Button
- Icon button
- Input
- Textarea
- Select
- Tabs
- Badge
- Tag input
- Toggle
- Color picker
- Image upload zone
- Image gallery grid
- Modal
- Confirmation dialog
- Toast notification
- Empty state
- Loading skeleton

Button hierarchy:

- Primary: Save / Publish / New Project
- Secondary: Preview / Cancel
- Danger: Delete

Use icons for common actions:

- Plus for new
- Search for search
- Pencil for edit
- Eye for preview
- Trash for delete
- Upload for upload
- Grip/drag icon for reorder
- External link for live URL

## UX Rules

- Never lose unsaved work without warning.
- Show clear save/publish states.
- Validate required fields before publishing.
- Allow draft save even if content is incomplete.
- Use confirmation modal for delete.
- Show upload progress for images.
- Show clear error messages.
- Make bilingual content easy to switch and compare.

## Required States

Design these states:

- Loading project list
- Empty project list
- No screenshots uploaded
- Uploading image
- Upload failed
- Form validation error
- Unsaved changes
- Save success
- Publish success
- Delete confirmation

## Responsive Behavior

Desktop:

- Sidebar visible
- Project editor has main content + right settings panel

Tablet:

- Sidebar can collapse
- Editor settings panel can stack below form

Mobile:

- Sidebar becomes drawer
- Project list becomes stacked cards
- Form sections stack vertically
- Image gallery becomes 1 column or 2 columns depending width

## Content Examples

Use these project examples in the mockup:

### EasySaving

Type:

- ID: Pelacak Keuangan
- EN: Finance Tracker

Role:

- Front-End Developer

Status:

- ID: Live di VPS
- EN: Live on VPS

Live URL:

- https://easysaving.asia/

Stack:

- React.js
- Vite
- Tailwind CSS
- JavaScript

### IMOCA Company Profile Website

Type:

- Company Profile

Role:

- Full Stack Developer

Stack:

- React.js
- Tailwind CSS
- Golang
- MySQL

### Petly - Pet Care E-Commerce

Type:

- E-Commerce

Role:

- Front-End Developer

Stack:

- Tailwind CSS
- Laravel
- MySQL

### PlayStation Rental Management System

Type:

- Management System

Role:

- Full Stack Developer

Stack:

- Laravel
- MySQL
- Bootstrap

## Data Model Awareness

The design should support:

- One project has many images.
- One project has many highlights.
- Text fields are bilingual.
- Project can be draft or published.
- Project can have GitHub URL, Live URL, both, or neither.
- Images have bilingual label and alt text.

## Suggested Screen Set For Google Stitch

Please generate these screens:

1. Login page
2. Dashboard overview
3. Project list page
4. Empty project list state
5. Create/Edit project page
6. Project image gallery section
7. Project preview page/modal
8. Mobile project list
9. Mobile project editor

## Final Direction

The CMS should feel like a focused publishing workspace for a developer portfolio. It should be practical, fast, and visually aligned with the existing portfolio theme, while still being clean enough for daily content management.
