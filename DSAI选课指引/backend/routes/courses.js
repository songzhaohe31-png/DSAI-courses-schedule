/**
 * Courses Routes Module
 * 
 * Handles all course-related API endpoints including:
 * - Listing all courses
 * - Getting single course details
 * - Filtering courses by year or category
 * 
 * @module routes/courses
 */

const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  getCoursesByYear,
  getCoursesByCategory
} = require('../database');

/**
 * GET /api/courses
 * Get all courses with optional filtering
 * 
 * Query Parameters:
 *   - year: Filter by year (1-4)
 *   - category: Filter by category (core, elective, project, english, general_ed, university_core)
 *   - semester: Filter by semester (autumn, spring, summer)
 * 
 * Response: Array of course objects
 */
router.get('/', async (req, res, next) => {
  try {
    const { year, category, semester } = req.query;
    let courses;

    // Apply filters based on query parameters
    if (year) {
      // Validate year parameter
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
        return res.status(400).json({
          error: 'Invalid Parameter',
          message: 'Year must be a number between 1 and 4'
        });
      }
      courses = await getCoursesByYear(yearNum);
    } else if (category) {
      // Validate category parameter
      const validCategories = ['core', 'elective', 'project', 'english', 'general_ed', 'university_core'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          error: 'Invalid Parameter',
          message: `Category must be one of: ${validCategories.join(', ')}`
        });
      }
      courses = await getCoursesByCategory(category);
    } else {
      courses = await getAllCourses();
    }

    // Filter by semester if specified
    if (semester) {
      const validSemesters = ['autumn', 'spring', 'summer'];
      if (!validSemesters.includes(semester)) {
        return res.status(400).json({
          error: 'Invalid Parameter',
          message: `Semester must be one of: ${validSemesters.join(', ')}`
        });
      }
      courses = courses.filter(course => course.semester === semester);
    }

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:id
 * Get a single course by ID
 * 
 * Parameters:
 *   - id: Course ID (e.g., COMP1080SEF)
 * 
 * Response: Course object with details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate course ID format
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Course ID is required'
      });
    }

    const course = await getCourseById(id);

    if (!course) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Course with ID '${id}' not found`
      });
    }

    // Parse prerequisites JSON string
    let prerequisites = [];
    try {
      prerequisites = JSON.parse(course.prerequisites || '[]');
    } catch (e) {
      prerequisites = [];
    }

    res.json({
      success: true,
      data: {
        ...course,
        prerequisites
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/year/:year
 * Get courses by year
 * 
 * Parameters:
 *   - year: Year number (1-4)
 * 
 * Response: Array of course objects for the specified year
 */
router.get('/year/:year', async (req, res, next) => {
  try {
    const { year } = req.params;
    const yearNum = parseInt(year, 10);

    // Validate year parameter
    if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Year must be a number between 1 and 4'
      });
    }

    const courses = await getCoursesByYear(yearNum);

    // Group courses by semester
    const grouped = courses.reduce((acc, course) => {
      if (!acc[course.semester]) {
        acc[course.semester] = [];
      }
      acc[course.semester].push(course);
      return acc;
    }, {});

    res.json({
      success: true,
      year: yearNum,
      count: courses.length,
      data: courses,
      groupedBySemester: grouped
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/category/:category
 * Get courses by category
 * 
 * Parameters:
 *   - category: Category name (core, elective, project, english, general_ed, university_core)
 * 
 * Response: Array of course objects for the specified category
 */
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;

    // Validate category parameter
    const validCategories = ['core', 'elective', 'project', 'english', 'general_ed', 'university_core'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const courses = await getCoursesByCategory(category);

    // Calculate total credits for the category
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

    res.json({
      success: true,
      category,
      count: courses.length,
      totalCredits,
      data: courses
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/stats/summary
 * Get course statistics summary
 * 
 * Response: Statistics about all courses
 */
router.get('/stats/summary', async (req, res, next) => {
  try {
    const courses = await getAllCourses();

    // Calculate statistics
    const stats = {
      totalCourses: courses.length,
      totalCredits: courses.reduce((sum, course) => sum + course.credits, 0),
      byCategory: {},
      byYear: {},
      bySemester: {}
    };

    // Group by category
    courses.forEach(course => {
      // By category
      if (!stats.byCategory[course.category]) {
        stats.byCategory[course.category] = { count: 0, credits: 0 };
      }
      stats.byCategory[course.category].count++;
      stats.byCategory[course.category].credits += course.credits;

      // By year
      if (!stats.byYear[course.year]) {
        stats.byYear[course.year] = { count: 0, credits: 0 };
      }
      stats.byYear[course.year].count++;
      stats.byYear[course.year].credits += course.credits;

      // By semester
      if (!stats.bySemester[course.semester]) {
        stats.bySemester[course.semester] = { count: 0, credits: 0 };
      }
      stats.bySemester[course.semester].count++;
      stats.bySemester[course.semester].credits += course.credits;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
