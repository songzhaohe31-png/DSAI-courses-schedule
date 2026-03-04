# HKMU Course Selection Guidance System - Backend API

A comprehensive RESTful API for the Hong Kong Metropolitan University (HKMU) Data Science Course Selection Guidance System.

## Features

- **Course Management**: Full CRUD operations for courses with filtering by year, category, and semester
- **Review System**: Student reviews with ratings, helpful votes, and moderation
- **Material Sharing**: File upload/download functionality with type validation
- **Progress Tracking**: User course progress tracking with statistics
- **SQLite Database**: Lightweight, file-based database with seed data

## Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.x
- **Database**: SQLite3
- **File Upload**: Multer
- **CORS**: Enabled for frontend integration

## Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start with nodemon (development)
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DB_PATH=./hkmu_courses.db
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API status |

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses (with optional filters) |
| GET | `/api/courses/:id` | Get single course details |
| GET | `/api/courses/year/:year` | Get courses by year (1-4) |
| GET | `/api/courses/category/:category` | Get courses by category |
| GET | `/api/courses/stats/summary` | Get course statistics |

**Query Parameters for `/api/courses`:**
- `year`: Filter by year (1-4)
- `category`: Filter by category (core, elective, project, english, general_ed, university_core)
- `semester`: Filter by semester (autumn, spring, summer)

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/:courseId` | Get reviews for a course |
| POST | `/api/reviews` | Add a new review |
| PUT | `/api/reviews/:id/helpful` | Mark review as helpful |
| DELETE | `/api/reviews/:id` | Delete a review |
| GET | `/api/reviews/stats/:courseId` | Get review statistics |

**Review Request Body:**
```json
{
  "course_id": "COMP1080SEF",
  "user_id": "user_001",
  "author_name": "John Doe",
  "author_year": 3,
  "semester": "2024 Autumn",
  "rating": 5,
  "content": "Great course! Highly recommended.",
  "is_anonymous": false
}
```

### Materials

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/materials/:courseId` | Get materials for a course |
| POST | `/api/materials` | Upload a new material |
| GET | `/api/materials/download/:id` | Download a material |
| GET | `/api/materials/info/:id` | Get material info |
| DELETE | `/api/materials/:id` | Delete a material |

**Upload Request (multipart/form-data):**
- `file`: File to upload (required, max 50MB)
- `course_id`: Course ID (required)
- `uploaded_by`: Uploader name (required)
- `uploader_id`: Uploader ID (required)
- `description`: Material description (optional)

**Allowed File Types:**
- PDF (.pdf)
- Word Documents (.doc, .docx)
- PowerPoint (.ppt, .pptx)
- ZIP Archives (.zip)

### Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/:userId` | Get user's course progress |
| POST | `/api/progress` | Update course status |
| GET | `/api/progress/stats/:userId` | Get progress statistics |
| GET | `/api/progress/category/:userId` | Get category breakdown |
| POST | `/api/progress/:userId/bulk` | Bulk update statuses |
| DELETE | `/api/progress/:userId/:courseId` | Reset course status |
| GET | `/api/progress/compare/:userId` | Compare with requirements |

**Progress Update Request Body:**
```json
{
  "user_id": "user_001",
  "course_id": "COMP1080SEF",
  "status": "completed"
}
```

**Valid Status Values:**
- `completed`: Course finished
- `in_progress`: Currently enrolled
- `available`: Prerequisites met
- `locked`: Prerequisites not met

## Data Structure

### Course Categories

| Category | Credits | Color |
|----------|---------|-------|
| Core Courses | 84 | Blue (#0066CC) |
| Elective Courses | 12 | Purple (#7C3AED) |
| Project Courses | 6 | Amber (#F59E0B) |
| English Enhancement | 6 | Emerald (#10B981) |
| General Education | 6 | Pink (#EC4899) |
| University Core | 9 | Indigo (#6366F1) |

### Course Data (Sample)

```json
{
  "id": "COMP1080SEF",
  "code": "COMP 1080SEF",
  "name": "Introduction to Computer Programming",
  "description": "Fundamental programming concepts using Python...",
  "credits": 3,
  "category": "core",
  "year": 1,
  "semester": "autumn",
  "prerequisites": [],
  "level": "undergraduate"
}
```

## Database Schema

### Tables

1. **courses**: Course information
2. **user_courses**: User course progress
3. **reviews**: Course reviews
4. **materials**: Study materials
5. **review_votes**: Review helpful votes

### Seed Data

The database is pre-populated with:
- 35+ courses from the HKMU Data Science program
- Sample reviews for demonstration
- Course categories and prerequisites

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `413`: Payload Too Large
- `500`: Internal Server Error

## Development

### Project Structure

```
backend/
├── server.js          # Main server file
├── database.js        # Database module
├── package.json       # Dependencies
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
├── README.md         # Documentation
├── routes/
│   ├── courses.js    # Course routes
│   ├── reviews.js    # Review routes
│   ├── materials.js  # Material routes
│   └── progress.js   # Progress routes
└── uploads/          # File upload directory
    └── .gitkeep
```

### Testing the API

```bash
# Health check
curl http://localhost:3001/api/health

# Get all courses
curl http://localhost:3001/api/courses

# Get courses by year
curl http://localhost:3001/api/courses/year/1

# Get course reviews
curl http://localhost:3001/api/reviews/COMP1080SEF

# Get user progress
curl http://localhost:3001/api/progress/user_001

# Get progress statistics
curl http://localhost:3001/api/progress/stats/user_001
```

### Adding a Review

```bash
curl -X POST http://localhost:3001/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "COMP1080SEF",
    "user_id": "user_test",
    "author_name": "Test Student",
    "author_year": 2,
    "semester": "2024 Autumn",
    "rating": 5,
    "content": "Excellent course! The professor explains concepts clearly."
  }'
```

### Uploading a File

```bash
curl -X POST http://localhost:3001/api/materials \
  -F "file=@notes.pdf" \
  -F "course_id=COMP1080SEF" \
  -F "uploaded_by=John Doe" \
  -F "uploader_id=user_001" \
  -F "description=Complete lecture notes"
```

## Security Considerations

1. **Input Validation**: All inputs are validated before processing
2. **File Upload Security**:
   - File type validation (whitelist approach)
   - File size limits (50MB max)
   - Unique filename generation (UUID)
3. **CORS**: Configured for specific frontend origin
4. **Error Handling**: Sanitized error messages in production

## Future Enhancements

- [ ] JWT authentication
- [ ] Rate limiting
- [ ] API key authentication
- [ ] Course prerequisite validation
- [ ] Review moderation
- [ ] File virus scanning
- [ ] Email notifications
- [ ] Export progress to PDF

## License

MIT License - HKMU Data Science Program

## Support

For support or questions, please contact the HKMU Data Science Program.
