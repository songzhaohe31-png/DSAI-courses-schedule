/**
 * Progress Routes Module
 * 
 * Handles all user progress-related API endpoints including:
 * - Getting user's course progress
 * - Updating course status
 * - Getting progress statistics
 * - Getting category breakdown
 * 
 * @module routes/progress
 */

const express = require('express');
const router = express.Router();
const {
  getUserProgress,
  updateCourseStatus,
  getProgressStats,
  getCategoryBreakdown,
  getCourseById,
  getAllCourses
} = require('../database');

/**
 * GET /api/progress/:userId
 * Get user's progress for all courses
 * 
 * Parameters:
 *   - userId: User ID
 * 
 * Response: Array of courses with user's status
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'User ID is required'
      });
    }

    const progress = await getUserProgress(userId);

    // Parse prerequisites for each course
    const formattedProgress = progress.map(course => {
      let prerequisites = [];
      try {
        prerequisites = JSON.parse(course.prerequisites || '[]');
      } catch (e) {
        prerequisites = [];
      }

      return {
        ...course,
        prerequisites,
        status: course.status || 'locked'
      };
    });

    // Group by year
    const byYear = formattedProgress.reduce((acc, course) => {
      if (!acc[course.year]) {
        acc[course.year] = [];
      }
      acc[course.year].push(course);
      return acc;
    }, {});

    // Group by category
    const byCategory = formattedProgress.reduce((acc, course) => {
      if (!acc[course.category]) {
        acc[course.category] = [];
      }
      acc[course.category].push(course);
      return acc;
    }, {});

    res.json({
      success: true,
      userId,
      totalCourses: progress.length,
      data: formattedProgress,
      byYear,
      byCategory
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/progress
 * Update course status for a user
 * 
 * Request Body:
 *   - user_id: User ID (required)
 *   - course_id: Course ID (required)
 *   - status: Status (completed, in_progress, available, locked) (required)
 * 
 * Response: Updated progress object
 */
router.post('/', async (req, res, next) => {
  try {
    const { user_id, course_id, status } = req.body;

    // Validate required fields
    const requiredFields = ['user_id', 'course_id', 'status'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing Required Fields',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate status value
    const validStatuses = ['completed', 'in_progress', 'available', 'locked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid Status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Validate course exists
    const course = await getCourseById(course_id);
    if (!course) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Course with ID '${course_id}' not found`
      });
    }

    // Update course status
    const updatedProgress = await updateCourseStatus(user_id, course_id, status);

    res.json({
      success: true,
      message: 'Course status updated successfully',
      data: updatedProgress
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/progress/stats/:userId
 * Get progress statistics for a user
 * 
 * Parameters:
 *   - userId: User ID
 * 
 * Response: Progress statistics object
 */
router.get('/stats/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'User ID is required'
      });
    }

    const stats = await getProgressStats(userId);
    const categoryBreakdown = await getCategoryBreakdown(userId);

    // Define required credits per category
    const requiredCredits = {
      core: 84,
      elective: 12,
      project: 6,
      english: 6,
      general_ed: 6,
      university_core: 9
    };

    // Add required credits and calculate remaining for each category
    const categoryStats = categoryBreakdown.map(cat => ({
      category: cat.category,
      totalCredits: cat.total_credits,
      completedCredits: cat.completed_credits || 0,
      requiredCredits: requiredCredits[cat.category] || cat.total_credits,
      remainingCredits: Math.max(0, (requiredCredits[cat.category] || cat.total_credits) - (cat.completed_credits || 0)),
      totalCourses: cat.total_courses,
      completedCourses: cat.completed_courses || 0,
      completionPercentage: cat.total_credits > 0 
        ? Math.round(((cat.completed_credits || 0) / (requiredCredits[cat.category] || cat.total_credits)) * 100)
        : 0
    }));

    res.json({
      success: true,
      userId,
      overall: {
        ...stats,
        remaining_credits: 120 - stats.completed_credits
      },
      byCategory: categoryStats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/progress/category/:userId
 * Get category breakdown for a user
 * 
 * Parameters:
 *   - userId: User ID
 * 
 * Response: Category breakdown array
 */
router.get('/category/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'User ID is required'
      });
    }

    const categoryBreakdown = await getCategoryBreakdown(userId);

    // Category display names
    const categoryNames = {
      core: 'Core Courses',
      elective: 'Elective Courses',
      project: 'Project Courses',
      english: 'English Enhancement',
      general_ed: 'General Education',
      university_core: 'University Core'
    };

    // Category colors
    const categoryColors = {
      core: '#0066CC',
      elective: '#7C3AED',
      project: '#F59E0B',
      english: '#10B981',
      general_ed: '#EC4899',
      university_core: '#6366F1'
    };

    const formattedBreakdown = categoryBreakdown.map(cat => ({
      category: cat.category,
      displayName: categoryNames[cat.category] || cat.category,
      color: categoryColors[cat.category] || '#9CA3AF',
      totalCredits: cat.total_credits,
      completedCredits: cat.completed_credits || 0,
      totalCourses: cat.total_courses,
      completedCourses: cat.completed_courses || 0
    }));

    res.json({
      success: true,
      userId,
      data: formattedBreakdown
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/progress/:userId/bulk
 * Bulk update course statuses for a user
 * 
 * Parameters:
 *   - userId: User ID
 * 
 * Request Body:
 *   - updates: Array of { course_id, status } objects
 * 
 * Response: Array of updated progress objects
 */
router.post('/:userId/bulk', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { updates } = req.body;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'User ID is required'
      });
    }

    // Validate updates array
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        error: 'Invalid Updates',
        message: 'Updates must be a non-empty array'
      });
    }

    const validStatuses = ['completed', 'in_progress', 'available', 'locked'];
    const results = [];
    const errors = [];

    // Process each update
    for (const update of updates) {
      const { course_id, status } = update;

      // Validate update
      if (!course_id || !status) {
        errors.push({ course_id, error: 'Missing course_id or status' });
        continue;
      }

      if (!validStatuses.includes(status)) {
        errors.push({ course_id, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        continue;
      }

      // Check if course exists
      const course = await getCourseById(course_id);
      if (!course) {
        errors.push({ course_id, error: 'Course not found' });
        continue;
      }

      try {
        const result = await updateCourseStatus(userId, course_id, status);
        results.push(result);
      } catch (err) {
        errors.push({ course_id, error: err.message });
      }
    }

    res.json({
      success: true,
      userId,
      updated: results.length,
      failed: errors.length,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/progress/:userId/:courseId
 * Reset course status for a user
 * 
 * Parameters:
 *   - userId: User ID
 *   - courseId: Course ID
 * 
 * Response: Success message
 */
router.delete('/:userId/:courseId', async (req, res, next) => {
  try {
    const { userId, courseId } = req.params;

    // Validate parameters
    if (!userId || !courseId) {
      return res.status(400).json({
        error: 'Invalid Parameters',
        message: 'User ID and Course ID are required'
      });
    }

    // Delete the user course record (reset to default locked status)
    const { db } = require('../database');
    
    db.run(
      'DELETE FROM user_courses WHERE user_id = ? AND course_id = ?',
      [userId, courseId],
      function(err) {
        if (err) {
          return next(err);
        }

        if (this.changes === 0) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'No progress record found for this user and course'
          });
        }

        res.json({
          success: true,
          message: 'Course status reset successfully',
          userId,
          courseId
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/progress/compare/:userId
 * Compare user's progress with program requirements
 * 
 * Parameters:
 *   - userId: User ID
 * 
 * Response: Comparison data
 */
router.get('/compare/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'User ID is required'
      });
    }

    const stats = await getProgressStats(userId);
    const allCourses = await getAllCourses();

    // Program requirements
    const requirements = {
      totalCredits: 120,
      coreCredits: 84,
      electiveCredits: 12,
      projectCredits: 6,
      englishCredits: 6,
      generalEdCredits: 6,
      universityCoreCredits: 9
    };

    // Calculate remaining requirements
    const categoryBreakdown = await getCategoryBreakdown(userId);
    const categoryMap = {};
    categoryBreakdown.forEach(cat => {
      categoryMap[cat.category] = cat.completed_credits || 0;
    });

    const comparison = {
      overall: {
        required: requirements.totalCredits,
        completed: stats.completed_credits,
        remaining: Math.max(0, requirements.totalCredits - stats.completed_credits),
        percentage: Math.round((stats.completed_credits / requirements.totalCredits) * 100)
      },
      categories: {
        core: {
          required: requirements.coreCredits,
          completed: categoryMap.core || 0,
          remaining: Math.max(0, requirements.coreCredits - (categoryMap.core || 0))
        },
        elective: {
          required: requirements.electiveCredits,
          completed: categoryMap.elective || 0,
          remaining: Math.max(0, requirements.electiveCredits - (categoryMap.elective || 0))
        },
        project: {
          required: requirements.projectCredits,
          completed: categoryMap.project || 0,
          remaining: Math.max(0, requirements.projectCredits - (categoryMap.project || 0))
        },
        english: {
          required: requirements.englishCredits,
          completed: categoryMap.english || 0,
          remaining: Math.max(0, requirements.englishCredits - (categoryMap.english || 0))
        },
        general_ed: {
          required: requirements.generalEdCredits,
          completed: categoryMap.general_ed || 0,
          remaining: Math.max(0, requirements.generalEdCredits - (categoryMap.general_ed || 0))
        },
        university_core: {
          required: requirements.universityCoreCredits,
          completed: categoryMap.university_core || 0,
          remaining: Math.max(0, requirements.universityCoreCredits - (categoryMap.university_core || 0))
        }
      }
    };

    // Identify remaining required courses
    const userProgress = await getUserProgress(userId);
    const incompleteCourses = userProgress.filter(c => c.status !== 'completed');

    res.json({
      success: true,
      userId,
      comparison,
      remainingCourses: {
        count: incompleteCourses.length,
        credits: incompleteCourses.reduce((sum, c) => sum + c.credits, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
