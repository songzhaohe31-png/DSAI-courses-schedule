# HKMU Data Science Course Selection Guidance System - Design Document

## 1. Project Overview

### 1.1 Purpose
The HKMU Data Science Course Selection Guidance System is a web-based application designed to help students of the Hong Kong Metropolitan University (HKMU) Data Science Bachelor's program track their degree progress, plan their course selections, and access valuable peer insights about courses.

### 1.2 Target Audience
- **Primary Users**: Current HKMU Data Science undergraduate students
- **Secondary Users**: Prospective students, academic advisors
- **User Characteristics**: Tech-savvy students aged 18-25, familiar with web applications, seeking clear academic planning tools

### 1.3 Project Scope
This system is **ONE of 7 features** in a larger HKMU student guidance platform. The scope is intentionally focused and streamlined to avoid unnecessary complexity.

### 1.4 Key Features
1. **Degree Progress Tracking** - Visual representation of 120-credit degree completion
2. **Course Status Management** - Clear indicators for completed, in-progress, available, and locked courses
3. **Course Pathway Visualization** - Computer Science core course prerequisite mapping
4. **Course Reviews & Comments** - Peer feedback system for course insights
5. **Study Material Sharing** - File upload functionality for course resources

---

## 2. Page Manifest

| Page ID | Page Name | Route | Priority | Description |
|---------|-----------|-------|----------|-------------|
| P001 | Degree Progress | /progress | High | Main dashboard showing overall degree completion status |
| P002 | Course Detail | /course/[id] | High | Individual course page with details, comments, and file uploads |

---

## 3. Global Design System

### 3.1 Color Palette

#### Primary Colors (HKMU Brand)
| Name | Hex | Usage |
|------|-----|-------|
| HKMU Blue | `#0066CC` | Primary buttons, links, headers, active states |
| HKMU Green | `#2E7D52` | Success states, completed indicators, accents |

#### Background Colors
| Name | Hex | Usage |
|------|-----|-------|
| Page Background | `#F5F7FA` | Main page background |
| Card Background | `#FFFFFF` | Cards, modals, content containers |
| Light Blue | `#E3F2FD` | Info sections, highlight backgrounds |
| Light Green | `#E8F5E9` | Success sections, completed course backgrounds |

#### Status Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success Green | `#4CAF50` | Completed courses, success messages |
| Warning Orange | `#FF9800` | In-progress courses, warnings |
| Info Blue | `#2196F3` | Available courses, information |
| Locked Gray | `#9E9E9E` | Locked courses, disabled states |

#### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#1A1A2E` | Headings, primary text |
| Text Secondary | `#6B7280` | Body text, descriptions |
| Text Muted | `#9CA3AF` | Placeholder text, hints |

#### Course Category Colors
| Category | Color |
|----------|-------|
| Core Courses | `#0066CC` (Blue) |
| Elective Courses | `#7C3AED` (Purple) |
| Project Courses | `#F59E0B` (Amber) |
| English Enhancement | `#10B981` (Emerald) |
| General Education | `#EC4899` (Pink) |
| University Core | `#6366F1` (Indigo) |

### 3.2 Typography

#### Font Families
```css
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Type Scale
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 | 2.5rem (40px) | 700 | 1.2 | -0.02em |
| H2 | 2rem (32px) | 600 | 1.3 | -0.01em |
| H3 | 1.5rem (24px) | 600 | 1.4 | 0 |
| H4 | 1.25rem (20px) | 600 | 1.5 | 0 |
| Body Large | 1.125rem (18px) | 400 | 1.6 | 0 |
| Body | 1rem (16px) | 400 | 1.6 | 0 |
| Body Small | 0.875rem (14px) | 400 | 1.5 | 0 |
| Caption | 0.75rem (12px) | 500 | 1.4 | 0.01em |
| Code | 0.875rem (14px) | 400 | 1.5 | 0 |

### 3.3 Spacing System

#### Base Unit: 4px
| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight spacing, icon gaps |
| space-2 | 8px | Inline elements, small gaps |
| space-3 | 12px | Card padding small |
| space-4 | 16px | Standard padding |
| space-5 | 20px | Section gaps |
| space-6 | 24px | Card padding, section margins |
| space-8 | 32px | Large section gaps |
| space-10 | 40px | Page section spacing |
| space-12 | 48px | Major section breaks |

#### Layout Spacing
- Page padding: 24px (mobile), 32px (tablet), 48px (desktop)
- Max container width: 1280px
- Card gap: 24px
- Section gap: 32px

### 3.4 Border & Shadows

#### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 6px | Small buttons, tags |
| radius-md | 8px | Input fields, small cards |
| radius-lg | 12px | Cards, containers |
| radius-xl | 16px | Large cards, modals |
| radius-full | 9999px | Pills, avatars |

#### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### 3.5 Animation Specifications

#### Page Load Animation
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Duration: 0.5s, Easing: cubic-bezier(0.4, 0, 0.2, 1) */
```

#### Card Hover Effect
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Progress Bar Animation
```css
@keyframes progressFill {
  from { width: 0%; }
  to { width: var(--progress); }
}
/* Duration: 1s, Easing: cubic-bezier(0.4, 0, 0.2, 1) */
```

#### In-Progress Pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
/* Duration: 2s, Iteration: infinite */
```

#### Stagger Animation for Cards
```css
/* Each card delays by 0.1s */
.card:nth-child(1) { animation-delay: 0s; }
.card:nth-child(2) { animation-delay: 0.1s; }
.card:nth-child(3) { animation-delay: 0.2s; }
/* ... and so on */
```

#### Button Hover
```css
.button {
  transition: all 0.2s ease-in-out;
}
.button:hover {
  transform: scale(1.02);
}
.button:active {
  transform: scale(0.98);
}
```

### 3.6 Status Indicators

#### Course Status Icons
| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| Completed | Check | `#4CAF50` | Course finished with passing grade |
| In Progress | Clock | `#FF9800` | Currently enrolled |
| Available | Circle | `#2196F3` | Prerequisites met, can enroll |
| Locked | Lock | `#9E9E9E` | Prerequisites not met |

#### Icon Specifications
- Size: 20px (default), 16px (compact)
- Stroke width: 2px
- Border radius for icon containers: 6px

---

## 4. Page Specifications

### 4.1 Page: Degree Progress (/progress)

#### Purpose
Main dashboard for students to view their overall degree completion status, track course progress across all categories, and visualize their academic journey.

#### Layout Structure
```
HEADER (HKMU Logo + Navigation)
PAGE TITLE: "Degree Progress"
  Subtitle: "Track your Data Science BSc journey"
OVERVIEW STATS CARDS (4 cards)
  [Total Credits] [Completed] [In Progress] [Remaining]
PROGRESS SECTION
  Overall Progress Bar (120 credits total)
CATEGORY BREAKDOWN (6 categories)
YEAR-BY-YEAR COURSE GRID (4 years)
ELECTIVE COURSES SECTION
LEGEND & FILTERS
```

#### Section 1: Header Stats Cards

**Layout**: 4-column grid on desktop, 2x2 on tablet, 1-column on mobile

**Cards**:
1. **Total Credits Required** - Value: "120", Icon: GraduationCap, Color: Primary Blue
2. **Credits Completed** - Dynamic value, Icon: CheckCircle, Color: Success Green
3. **Credits In Progress** - Dynamic value, Icon: Clock, Color: Warning Orange
4. **Credits Remaining** - Dynamic value, Icon: Target, Color: Info Blue

**Card Styling**:
- Background: White, Border radius: 12px, Padding: 24px, Shadow: shadow-md

#### Section 2: Overall Progress Bar

- Height: 24px, Background: #E5E7EB
- Fill gradient: linear-gradient(90deg, #0066CC, #2E7D52)
- Animation: Width from 0% to target over 1s

#### Section 3: Category Breakdown

| Category | Total Credits | Color |
|----------|---------------|-------|
| Core Courses | 84 | Blue |
| Elective Courses | 12 | Purple |
| Project Courses | 6 | Amber |
| English Enhancement | 6 | Emerald |
| General Education | 6 | Pink |
| University Core | 9 | Indigo |

#### Section 4: Year-by-Year Course Grid

**Layout**: 4 columns for Years 1-4 on desktop, 2x2 grid on tablet, 1-column on mobile

**Semester Organization**: Autumn, Spring, Summer (Year 3 only)

**Course Card Styling**:
- Background: White (default), Light Green (completed), Light Blue (in-progress)
- Border radius: 12px, Padding: 16px
- Hover: translateY(-2px), shadow-lg

**Course Data Structure**:
```javascript
{
  id: "COMP1080SEF",
  code: "COMP 1080SEF",
  name: "Introduction to Computer Programming",
  credits: 3,
  category: "core",
  year: 1,
  semester: "autumn",
  status: "completed",
  prerequisites: [],
  description: "Fundamental programming concepts using Python..."
}
```

#### Section 5: Elective Courses

| Code | Name | Credits |
|------|------|---------|
| COMP 4630SEF | Distributed Systems and Parallel Computing | 3 |
| ELEC 3050SEF | Computer Networking | 3 |
| ELEC 3250SEF | Computer & Network Security | 3 |
| ELEC 4310SEF | Blockchain Technologies | 3 |
| ELEC 4710SEF | Digital Forensics | 3 |

#### Section 6: Legend & Filters

**Status Filter Buttons**: All, Completed, In Progress, Available, Locked
**Category Filter Buttons**: All, Core, Elective, Project, English, General Ed, University Core

#### Animations for /progress Page

1. Page Load: Fade in from bottom, 0.5s duration
2. Stats Cards: Stagger animation, 0.1s delay between each
3. Progress Bar: Animate width from 0 to target, 1s duration
4. Course Cards: Stagger load with 0.05s delay
5. Hover Effects: translateY(-4px), 0.3s transition

#### Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, stacked sections |
| Tablet | 640-1024px | 2-column grids |
| Desktop | > 1024px | Full 4-column year grid |

---

### 4.2 Page: Course Detail (/course/[id])

#### Purpose
Detailed view of a specific course including description, prerequisites, student reviews, and shared study materials.

#### Layout Structure
```
HEADER (HKMU Logo + Navigation + Back Button)
BREADCRUMBS: Progress > COMP 1080SEF
COURSE HEADER
  [STATUS BADGE] COMP 1080SEF
  Course Name
  [Core] [3 Credits] [Year 1, Autumn]
COURSE INFO CARD
  Description, Prerequisites, Category, Credits
STATUS UPDATE SECTION
  [Mark as Completed] [Mark as In Progress] [Reset]
TABS: [Reviews] [Study Materials]
TAB CONTENT AREA
```

#### Section 1: Course Header

**Status Badge Colors**:
| Status | Background | Text |
|--------|------------|------|
| Completed | #E8F5E9 | #2E7D52 |
| In Progress | #FFF3E0 | #E65100 |
| Available | #E3F2FD | #1565C0 |
| Locked | #F5F5F5 | #616161 |

#### Section 2: Course Info Card

**Content**:
- Description: Full course description (2-4 sentences)
- Prerequisites: List of required courses or "None"
- Category: Course category with color-coded badge
- Credits: Credit value
- Semester: When the course is typically offered

#### Section 3: Status Update

**Buttons**:
- "Mark as Completed" (Green, with check icon)
- "Mark as In Progress" (Orange, with clock icon)
- "Reset Status" (Gray, with refresh icon)

#### Section 4: Reviews Tab

**Review Card Elements**:
- Star rating (1-5)
- Author name and year
- Semester taken
- Review content
- Helpful count with thumbs up button

**Review Data Structure**:
```javascript
{
  id: "rev_001",
  courseId: "COMP1080SEF",
  author: "John Doe",
  authorYear: 3,
  semester: "2024 Spring",
  rating: 4,
  content: "Review text here...",
  helpfulCount: 12,
  createdAt: "2024-01-15T10:30:00Z",
  isAnonymous: false
}
```

**Review Modal Form**:
- Rating selector (1-5 stars, click to rate)
- Semester dropdown (e.g., "2024 Autumn")
- Review textarea (min 50 chars, max 1000)
- Anonymous checkbox
- Submit button

#### Section 5: Study Materials Tab

**Upload Specifications**:
- Max file size: 50MB
- Allowed types: .pdf, .doc, .docx, .ppt, .pptx, .zip
- Drag & drop zone with progress indicator

**Material Card Elements**:
- File type icon
- Filename
- Description
- Uploader name
- File size
- Download count
- Download button

**Material Data Structure**:
```javascript
{
  id: "mat_001",
  courseId: "COMP1080SEF",
  filename: "Lecture_Notes_Complete.pdf",
  originalName: "Lecture Notes Complete.pdf",
  fileSize: 2516582,
  fileType: "application/pdf",
  description: "Complete lecture notes for all weeks",
  uploadedBy: "Jane Smith",
  uploaderId: "user_123",
  downloadCount: 45,
  createdAt: "2024-01-20T14:22:00Z"
}
```

#### Section 6: Tabs Component

**Tab Styling**:
- Horizontal tabs at top of content area
- Active tab: Bottom border in primary color, bold text
- Inactive tab: No border, regular text
- Tab transition: 0.2s ease

#### Animations for /course/[id] Page

1. Page Load: Fade in content, 0.5s
2. Tab Switch: Fade transition, 0.15s
3. Review/Material Cards: Stagger load, 0.1s delay
4. Modal Open: Scale from 0.95 to 1, 0.2s
5. Modal Close: Scale to 0.95, fade out, 0.15s

---

## 5. Technical Requirements

### 5.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Document structure |
| Tailwind CSS | v4 (CDN) | Styling framework |
| Lucide Icons | Latest (CDN) | Icon library |
| Vanilla JavaScript | ES6+ | Interactivity |

### 5.2 CDN Resources

```html
<!-- Tailwind CSS v4 -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest"></script>

<!-- Google Fonts - Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 5.3 Backend Requirements

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| SQLite | Database |
| Multer | File upload handling |

### 5.4 Database Schema

```sql
-- Courses table
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  category TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester TEXT NOT NULL,
  prerequisites TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User course progress table
CREATE TABLE user_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE(user_id, course_id)
);

-- Reviews table
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_year INTEGER,
  semester TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Study materials table
CREATE TABLE materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  uploaded_by TEXT NOT NULL,
  uploader_id TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Review helpful votes table
CREATE TABLE review_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id),
  UNIQUE(review_id, user_id)
);
```

### 5.5 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses | Get all courses |
| GET | /api/courses/:id | Get course details |
| GET | /api/user/progress | Get user's degree progress |
| POST | /api/user/courses/:id/status | Update course status |
| GET | /api/courses/:id/reviews | Get course reviews |
| POST | /api/courses/:id/reviews | Add review |
| POST | /api/reviews/:id/helpful | Mark review as helpful |
| GET | /api/courses/:id/materials | Get course materials |
| POST | /api/courses/:id/materials | Upload material |
| GET | /api/materials/:id/download | Download material |
| DELETE | /api/materials/:id | Delete material (owner only) |

### 5.6 File Upload Specifications

| Setting | Value |
|---------|-------|
| Max file size | 50MB |
| Allowed types | .pdf, .doc, .docx, .ppt, .pptx, .zip |
| Storage | Local filesystem /uploads directory |
| Naming | UUID + original extension |

### 5.7 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 6. Image Requirements

### 6.1 Logo Assets

| Asset | Format | Size | Background | Description |
|-------|--------|------|------------|-------------|
| HKMU Logo | SVG | Scalable | Transparent | Official university logo |
| HKMU Logo (favicon) | PNG/ICO | 32x32, 16x16 | Transparent | Browser tab icon |

### 6.2 UI Icons

All icons sourced from **Lucide Icons** library:

| Icon Name | Usage |
|-----------|-------|
| graduation-cap | Degree/stats header |
| check-circle | Completed status |
| clock | In-progress status |
| circle | Available status |
| lock | Locked status |
| target | Remaining credits |
| book-open | Course category |
| file-text | Documents |
| upload | File upload |
| download | File download |
| message-square | Comments/reviews |
| star | Rating |
| thumbs-up | Helpful vote |
| arrow-left | Back navigation |
| filter | Filter button |
| search | Search |
| plus | Add new |
| trash-2 | Delete |
| more-vertical | Options menu |
| calendar | Semester/date |
| user | Profile/author |

### 6.3 Image Generation Requirements

No custom image generation required for this project. All visual elements will use:
- Lucide Icons (vector icons)
- CSS-generated graphics (progress bars, badges)
- HKMU official logo (provided)

---

## 7. Navigation Structure

### 7.1 Main Navigation

```
[HKMU LOGO]    Data Science Course Guide        [Menu]
```

**Navigation Items**:
| Label | Route | Icon | Active State |
|-------|-------|------|--------------|
| Degree Progress | /progress | bar-chart-2 | Bold, blue underline |
| Course Detail | /course/[id] | book-open | (Dynamic based on course) |

### 7.2 Breadcrumbs

**Pattern**: Home > Progress > [Course Code]

**Styling**:
- Separator: Chevron right icon with muted color
- Current page: Bold, no link
- Previous pages: Link with hover underline

### 7.3 Mobile Navigation

**Hamburger Menu**:
- Icon: Menu (3 lines)
- Opens slide-out drawer from right
- Contains same links as desktop nav
- Close button (X) at top

### 7.4 Footer (Optional)

```
(c) 2024 HKMU Data Science Program
[Privacy Policy] [Terms of Use] [Contact]
```

---

## 8. Course Data Reference

### 8.1 Credit Summary

| Category | Credits |
|----------|---------|
| Core Courses | 84 |
| Elective Courses | 12 |
| Project Courses | 6 |
| English Enhancement | 6 |
| General Education | 6 |
| University Core | 9 |
| **Total** | **120** |

### 8.2 Complete Course Catalog

#### Year 1 - Autumn
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| COMP 1080SEF | Introduction to Computer Programming | 3 | Core | None |
| IT 1020SEF | Computing Fundamentals | 3 | Core | None |
| MATH 1410SEF | Algebra and Calculus | 3 | Core | None |
| GENE 1000 | General Education Course | 3 | General Ed | None |
| ENGL 1101AEF | University English: Reading and Writing | 3 | English | None |

#### Year 1 - Spring
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| COMP 2090SEF | Data Structures, Algorithms & Problem Solving | 3 | Core | COMP 1080SEF |
| IT 1030SEF | Introduction to Internet Application Development | 3 | Core | IT 1020SEF |
| STAT 1510SEF | Probability & Distributions | 3 | Core | MATH 1410SEF |
| STAT 2610SEF | Data Analytics with Applications | 3 | Core | None |
| GENE 1001 | General Education Course | 3 | General Ed | None |
| ENGL 1202EEF | University English: Listening and Speaking | 3 | English | None |

#### Year 2 - Autumn
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| COMP 2020SEF | Java Programming Fundamentals | 3 | Core | COMP 1080SEF |
| COMP 2640SEF | Discrete Mathematics | 3 | Core | MATH 1410SEF |
| MATH 2150SEF | Linear Algebra | 3 | Core | MATH 1410SEF |
| STAT 2510SEF | Statistical Data Analysis | 3 | Core | STAT 1510SEF |

#### Year 2 - Spring
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| COMP 2030SEF | Intermediate Java Programming & UI Design | 3 | Core | COMP 2020SEF |
| IT 2900SEF | Human Computer Interaction & UX Design | 3 | Core | IT 1030SEF |
| STAT 2520SEF | Applied Statistical Methods | 3 | Core | STAT 2510SEF |
| STAT 2630SEF | Big Data Analytics with Applications | 3 | Core | STAT 2610SEF |

#### Year 3 - Autumn
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| COMP 3130SEF | Mobile Application Programming | 3 | Core | COMP 2030SEF |
| COMP 3200SEF | Database Management | 3 | Core | COMP 2090SEF |
| COMP 3500SEF | Software Engineering | 3 | Core | COMP 2030SEF |

#### Year 3 - Spring
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| COMP 3510SEF | Software Project Management | 3 | Core | COMP 3500SEF |
| COMP 3810SEF | Server-side Technologies and Cloud Computing | 3 | Core | COMP 3200SEF |
| COMP 3920SEF | Machine Learning | 3 | Core | STAT 2520SEF, MATH 2150SEF |
| STAT 3110SEF | Time Series Analysis & Forecasting | 3 | Core | STAT 2520SEF |
| STAT 3660SEF | SAS Programming | 3 | Core | STAT 2510SEF |

#### Year 3 - Summer
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| MATH 4950SEF | Professional Placement | 3 | Elective | Year 3 standing |

#### Year 4 - Autumn
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| COMP 4330SEF | Advanced Programming & AI Algorithms | 3 | Core | COMP 3920SEF |
| COMP 4610SEF | Data Science Project | 6 | Project | Final year standing |
| COMP 4930SEF | Deep Learning | 3 | Core | COMP 3920SEF |
| ELEC XXXX | Elective Course | 3 | Elective | Varies |

#### Year 4 - Spring
| Code | Name | Credits | Category | Prerequisites |
|------|------|---------|----------|---------------|
| COMP 4210SEF | Advanced Database & Data Warehousing | 3 | Core | COMP 3200SEF |
| COMP 4600SEF | Advanced Topics in Data Mining | 3 | Core | COMP 3920SEF |
| ELEC XXXX | Elective Course | 3 | Elective | Varies |
| ELEC XXXX | Elective Course | 3 | Elective | Varies |

### 8.3 Elective Courses

| Code | Name | Credits | Prerequisites |
|------|------|---------|---------------|
| COMP 4630SEF | Distributed Systems and Parallel Computing | 3 | COMP 2030SEF |
| ELEC 3050SEF | Computer Networking | 3 | None |
| ELEC 3250SEF | Computer & Network Security | 3 | ELEC 3050SEF |
| ELEC 4310SEF | Blockchain Technologies | 3 | COMP 2020SEF |
| ELEC 4710SEF | Digital Forensics | 3 | None |

### 8.4 English Enhancement

| Code | Name | Credits |
|------|------|---------|
| ENGL 1101AEF | University English: Reading and Writing | 3 |
| ENGL 1202EEF | University English: Listening and Speaking | 3 |

### 8.5 University Core Courses

| Code | Name | Credits |
|------|------|---------|
| UCOR 1001 | Social Responsibilities | 1 |
| UCOR 1002 | University Core Values | 2 |
| UCOR 2003 | The Effective Communication & Teamwork | 3 |
| UCOR 3003 | Entrepreneurial Mindset & Leadership for Sustainability | 3 |

---

## 9. Accessibility Requirements

### 9.1 WCAG 2.1 Level AA Compliance

- All interactive elements must be keyboard accessible
- Color contrast ratio minimum 4.5:1 for text
- Focus indicators visible on all interactive elements
- Alt text for all images
- ARIA labels for icon-only buttons
- Screen reader friendly status announcements

### 9.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate between interactive elements |
| Enter/Space | Activate buttons and links |
| Escape | Close modals and dropdowns |
| Arrow keys | Navigate within lists and tabs |

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |

---

*Document Version: 1.0*
*Last Updated: 2024*
*Project: HKMU Data Science Course Selection Guidance System*
