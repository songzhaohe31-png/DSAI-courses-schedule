/**
 * Reviews Routes Module
 * 
 * Handles all review-related API endpoints including:
 * - Getting reviews for a course
 * - Adding new reviews
 * - Marking reviews as helpful
 * - Deleting reviews
 * 
 * @module routes/reviews
 */

const express = require('express');
const router = express.Router();
const {
  getReviewsByCourse,
  addReview,
  incrementHelpfulCount,
  deleteReview,
  getCourseById
} = require('../database');

/**
 * GET /api/reviews/:courseId
 * Get all reviews for a specific course
 * 
 * Parameters:
 *   - courseId: Course ID (e.g., COMP1080SEF)
 * 
 * Response: Array of review objects
 */
router.get('/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Validate course ID
    if (!courseId || typeof courseId !== 'string') {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Course ID is required'
      });
    }

    // Check if course exists
    const course = await getCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Course with ID '${courseId}' not found`
      });
    }

    const reviews = await getReviewsByCourse(courseId);

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    res.json({
      success: true,
      courseId,
      courseName: course.name,
      count: reviews.length,
      averageRating: parseFloat(averageRating),
      ratingDistribution,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reviews
 * Add a new review for a course
 * 
 * Request Body:
 *   - course_id: Course ID (required)
 *   - user_id: User ID (required)
 *   - author_name: Reviewer name (required)
 *   - author_year: Student year (optional)
 *   - semester: Semester taken (required)
 *   - rating: Rating 1-5 (required)
 *   - content: Review content (required, min 10 chars)
 *   - is_anonymous: Whether to show as anonymous (optional, default false)
 * 
 * Response: Created review object
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      course_id,
      user_id,
      author_name,
      author_year,
      semester,
      rating,
      content,
      is_anonymous
    } = req.body;

    // Validate required fields
    const requiredFields = ['course_id', 'user_id', 'author_name', 'semester', 'rating', 'content'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing Required Fields',
        message: `Missing required fields: ${missingFields.join(', ')}`
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

    // Validate rating
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        error: 'Invalid Rating',
        message: 'Rating must be a number between 1 and 5'
      });
    }

    // Validate content length
    if (content.length < 10) {
      return res.status(400).json({
        error: 'Invalid Content',
        message: 'Review content must be at least 10 characters long'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        error: 'Invalid Content',
        message: 'Review content must not exceed 2000 characters'
      });
    }

    // Validate semester format
    const semesterRegex = /^\d{4}\s+(Autumn|Spring|Summer)$/i;
    if (!semesterRegex.test(semester)) {
      return res.status(400).json({
        error: 'Invalid Semester Format',
        message: 'Semester must be in format "YYYY Season" (e.g., "2024 Autumn")'
      });
    }

    // Validate author_year if provided
    if (author_year !== undefined && author_year !== null) {
      const yearNum = parseInt(author_year, 10);
      if (isNaN(yearNum) || yearNum < 1 || yearNum > 4) {
        return res.status(400).json({
          error: 'Invalid Author Year',
          message: 'Author year must be a number between 1 and 4'
        });
      }
    }

    // Create review object
    const reviewData = {
      course_id,
      user_id,
      author_name: is_anonymous ? 'Anonymous' : author_name,
      author_year: author_year ? parseInt(author_year, 10) : null,
      semester,
      rating: ratingNum,
      content: content.trim(),
      is_anonymous: is_anonymous ? 1 : 0
    };

    const newReview = await addReview(reviewData);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: newReview
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/reviews/:id/helpful
 * Mark a review as helpful (increment helpful count)
 * 
 * Parameters:
 *   - id: Review ID
 * 
 * Response: Updated helpful count
 */
router.put('/:id/helpful', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Validate review ID
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Review ID must be a positive number'
      });
    }

    // Validate user_id
    if (!user_id) {
      return res.status(400).json({
        error: 'Missing Parameter',
        message: 'user_id is required in request body'
      });
    }

    // Increment helpful count
    const success = await incrementHelpfulCount(reviewId);

    if (!success) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Review with ID '${reviewId}' not found`
      });
    }

    res.json({
      success: true,
      message: 'Review marked as helpful',
      reviewId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete a review
 * 
 * Parameters:
 *   - id: Review ID
 * 
 * Query Parameters:
 *   - user_id: User ID (for authorization)
 * 
 * Response: Success message
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    // Validate review ID
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Review ID must be a positive number'
      });
    }

    // Validate user_id for authorization
    if (!user_id) {
      return res.status(400).json({
        error: 'Missing Parameter',
        message: 'user_id is required as query parameter'
      });
    }

    // Note: In a real application, you would verify that the user
    // owns the review or has admin privileges before deleting
    // For this demo, we just check if the review exists

    const success = await deleteReview(reviewId);

    if (!success) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Review with ID '${reviewId}' not found`
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
      reviewId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reviews/stats/:courseId
 * Get review statistics for a course
 * 
 * Parameters:
 *   - courseId: Course ID
 * 
 * Response: Review statistics
 */
router.get('/stats/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Validate course ID
    if (!courseId) {
      return res.status(400).json({
        error: 'Invalid Parameter',
        message: 'Course ID is required'
      });
    }

    const reviews = await getReviewsByCourse(courseId);

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2)
      : 0;

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    // Percentage distribution
    const percentageDistribution = {};
    for (let i = 1; i <= 5; i++) {
      percentageDistribution[i] = totalReviews > 0
        ? Math.round((distribution[i] / totalReviews) * 100)
        : 0;
    }

    res.json({
      success: true,
      courseId,
      totalReviews,
      averageRating: parseFloat(averageRating),
      distribution,
      percentageDistribution,
      totalHelpful: reviews.reduce((sum, r) => sum + r.helpful_count, 0)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
