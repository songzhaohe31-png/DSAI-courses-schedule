/**
 * Database Module for HKMU Course Selection Guidance System
 * 
 * This module handles all database operations using SQLite3.
 * It includes table creation, seed data insertion, and helper functions
 * for common database queries.
 * 
 * @module database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'hkmu_courses.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database tables
 * Creates all required tables if they don't exist
 */
function initializeTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Courses table
      db.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          credits INTEGER NOT NULL,
          category TEXT NOT NULL,
          year INTEGER NOT NULL,
          semester TEXT NOT NULL,
          prerequisites TEXT,
          level TEXT DEFAULT 'undergraduate',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating courses table:', err);
      });

      // User course progress table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          course_id TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('completed', 'in_progress', 'available', 'locked')),
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id),
          UNIQUE(user_id, course_id)
        )
      `, (err) => {
        if (err) console.error('Error creating user_courses table:', err);
      });

      // Reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
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
        )
      `, (err) => {
        if (err) console.error('Error creating reviews table:', err);
      });

      // Study materials table
      db.run(`
        CREATE TABLE IF NOT EXISTS materials (
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
        )
      `, (err) => {
        if (err) console.error('Error creating materials table:', err);
      });

      // Review helpful votes table
      db.run(`
        CREATE TABLE IF NOT EXISTS review_votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          review_id INTEGER NOT NULL,
          user_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (review_id) REFERENCES reviews(id),
          UNIQUE(review_id, user_id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating review_votes table:', err);
          reject(err);
        } else {
          console.log('All tables initialized successfully');
          resolve();
        }
      });
    });
  });
}

/**
 * Seed courses data
 * Inserts all courses from the HKMU Data Science program
 */
function seedCourses() {
  const courses = [
    // ==================== YEAR 1 - AUTUMN ====================
    {
      id: 'COMP1080SEF',
      code: 'COMP 1080SEF',
      name: 'Introduction to Computer Programming',
      description: 'Fundamental programming concepts using Python. Covers variables, data types, control structures, functions, and basic object-oriented programming principles.',
      credits: 3,
      category: 'core',
      year: 1,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'IT1020SEF',
      code: 'IT 1020SEF',
      name: 'Computing Fundamentals',
      description: 'Introduction to computer systems, hardware, software, and basic IT concepts. Covers computer architecture, operating systems, and networking fundamentals.',
      credits: 3,
      category: 'core',
      year: 1,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'MATH1410SEF',
      code: 'MATH 1410SEF',
      name: 'Algebra and Calculus',
      description: 'Mathematical foundations for data science including linear algebra, calculus, and mathematical reasoning. Essential for understanding machine learning algorithms.',
      credits: 3,
      category: 'core',
      year: 1,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'GENE1000',
      code: 'GENE 1000',
      name: 'General Education Course',
      description: 'Broad-based education course covering humanities, social sciences, or arts to develop well-rounded graduates with critical thinking skills.',
      credits: 3,
      category: 'general_ed',
      year: 1,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'ENGL1101AEF',
      code: 'ENGL 1101AEF',
      name: 'University English: Reading and Writing',
      description: 'Develops academic reading and writing skills. Focuses on essay writing, critical reading, and effective communication in academic contexts.',
      credits: 3,
      category: 'english',
      year: 1,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },

    // ==================== YEAR 1 - SPRING ====================
    {
      id: 'COMP2090SEF',
      code: 'COMP 2090SEF',
      name: 'Data Structures, Algorithms & Problem Solving',
      description: 'Advanced programming concepts focusing on data structures (arrays, lists, trees, graphs) and algorithm design and analysis.',
      credits: 3,
      category: 'core',
      year: 1,
      semester: 'spring',
      prerequisites: '["COMP1080SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'IT1030SEF',
      code: 'IT 1030SEF',
      name: 'Introduction to Internet Application Development',
      description: 'Web development fundamentals including HTML, CSS, JavaScript, and server-side scripting. Students build complete web applications.',
      credits: 3,
      category: 'core',
      year: 1,
      semester: 'spring',
      prerequisites: '["IT1020SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'STAT1510SEF',
      code: 'STAT 1510SEF',
      name: 'Probability & Distributions',
      description: 'Introduction to probability theory, random variables, probability distributions, and statistical inference foundations.',
      credits: 3,
      category: 'core',
      year: 1,
      semester: 'spring',
      prerequisites: '["MATH1410SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'STAT2610SEF',
      code: 'STAT 2610SEF',
      name: 'Data Analytics with Applications',
      description: 'Introduction to data analysis techniques using statistical software. Covers data cleaning, visualization, and basic statistical modeling.',
      credits: 3,
      category: 'core',
      year: 1,
      semester: 'spring',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'GENE1001',
      code: 'GENE 1001',
      name: 'General Education Course',
      description: 'Second general education course covering different domain from GENE 1000 to ensure breadth of knowledge.',
      credits: 3,
      category: 'general_ed',
      year: 1,
      semester: 'spring',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'ENGL1202EEF',
      code: 'ENGL 1202EEF',
      name: 'University English: Listening and Speaking',
      description: 'Develops oral communication skills including presentations, group discussions, and academic listening comprehension.',
      credits: 3,
      category: 'english',
      year: 1,
      semester: 'spring',
      prerequisites: '[]',
      level: 'undergraduate'
    },

    // ==================== YEAR 2 - AUTUMN ====================
    {
      id: 'COMP2020SEF',
      code: 'COMP 2020SEF',
      name: 'Java Programming Fundamentals',
      description: 'Introduction to Java programming language covering object-oriented concepts, classes, inheritance, and polymorphism.',
      credits: 3,
      category: 'core',
      year: 2,
      semester: 'autumn',
      prerequisites: '["COMP1080SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'COMP2640SEF',
      code: 'COMP 2640SEF',
      name: 'Discrete Mathematics',
      description: 'Mathematical structures for computer science including logic, set theory, combinatorics, graph theory, and number theory.',
      credits: 3,
      category: 'core',
      year: 2,
      semester: 'autumn',
      prerequisites: '["MATH1410SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'MATH2150SEF',
      code: 'MATH 2150SEF',
      name: 'Linear Algebra',
      description: 'Vector spaces, matrices, linear transformations, eigenvalues, and eigenvectors. Essential for machine learning and data analysis.',
      credits: 3,
      category: 'core',
      year: 2,
      semester: 'autumn',
      prerequisites: '["MATH1410SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'STAT2510SEF',
      code: 'STAT 2510SEF',
      name: 'Statistical Data Analysis',
      description: 'Statistical methods for data analysis including hypothesis testing, regression analysis, and experimental design.',
      credits: 3,
      category: 'core',
      year: 2,
      semester: 'autumn',
      prerequisites: '["STAT1510SEF"]',
      level: 'undergraduate'
    },

    // ==================== YEAR 2 - SPRING ====================
    {
      id: 'COMP2030SEF',
      code: 'COMP 2030SEF',
      name: 'Intermediate Java Programming & UI Design',
      description: 'Advanced Java programming with focus on GUI development, event handling, and design patterns for user interfaces.',
      credits: 3,
      category: 'core',
      year: 2,
      semester: 'spring',
      prerequisites: '["COMP2020SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'IT2900SEF',
      code: 'IT 2900SEF',
      name: 'Human Computer Interaction & UX Design',
      description: 'Principles of user-centered design, usability testing, and creating effective user experiences for software applications.',
      credits: 3,
      category: 'core',
      year: 2,
      semester: 'spring',
      prerequisites: '["IT1030SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'STAT2520SEF',
      code: 'STAT 2520SEF',
      name: 'Applied Statistical Methods',
      description: 'Practical statistical techniques for real-world data analysis including ANOVA, non-parametric methods, and multivariate analysis.',
      credits: 3,
      category: 'core',
      year: 2,
      semester: 'spring',
      prerequisites: '["STAT2510SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'STAT2630SEF',
      code: 'STAT 2630SEF',
      name: 'Big Data Analytics with Applications',
      description: 'Techniques for analyzing large-scale datasets using distributed computing frameworks and big data tools.',
      credits: 3,
      category: 'core',
      year: 2,
      semester: 'spring',
      prerequisites: '["STAT2610SEF"]',
      level: 'undergraduate'
    },

    // ==================== YEAR 3 - AUTUMN ====================
    {
      id: 'COMP3130SEF',
      code: 'COMP 3130SEF',
      name: 'Mobile Application Programming',
      description: 'Development of mobile applications for iOS and Android platforms using native and cross-platform frameworks.',
      credits: 3,
      category: 'core',
      year: 3,
      semester: 'autumn',
      prerequisites: '["COMP2030SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'COMP3200SEF',
      code: 'COMP 3200SEF',
      name: 'Database Management',
      description: 'Database design, SQL, normalization, transaction management, and database administration principles.',
      credits: 3,
      category: 'core',
      year: 3,
      semester: 'autumn',
      prerequisites: '["COMP2090SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'COMP3500SEF',
      code: 'COMP 3500SEF',
      name: 'Software Engineering',
      description: 'Software development lifecycle, requirements analysis, design patterns, testing, and project management methodologies.',
      credits: 3,
      category: 'core',
      year: 3,
      semester: 'autumn',
      prerequisites: '["COMP2030SEF"]',
      level: 'undergraduate'
    },

    // ==================== YEAR 3 - SPRING ====================
    {
      id: 'COMP3510SEF',
      code: 'COMP 3510SEF',
      name: 'Software Project Management',
      description: 'Project planning, estimation, risk management, and agile methodologies for software development projects.',
      credits: 3,
      category: 'core',
      year: 3,
      semester: 'spring',
      prerequisites: '["COMP3500SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'COMP3810SEF',
      code: 'COMP 3810SEF',
      name: 'Server-side Technologies and Cloud Computing',
      description: 'Server-side programming, web services, REST APIs, and deployment on cloud platforms like AWS and Azure.',
      credits: 3,
      category: 'core',
      year: 3,
      semester: 'spring',
      prerequisites: '["COMP3200SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'COMP3920SEF',
      code: 'COMP 3920SEF',
      name: 'Machine Learning',
      description: 'Fundamental machine learning algorithms including supervised and unsupervised learning, neural networks, and model evaluation.',
      credits: 3,
      category: 'core',
      year: 3,
      semester: 'spring',
      prerequisites: '["STAT2520SEF", "MATH2150SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'STAT3110SEF',
      code: 'STAT 3110SEF',
      name: 'Time Series Analysis & Forecasting',
      description: 'Analysis of temporal data, forecasting methods, ARIMA models, and applications in finance and economics.',
      credits: 3,
      category: 'core',
      year: 3,
      semester: 'spring',
      prerequisites: '["STAT2520SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'STAT3660SEF',
      code: 'STAT 3660SEF',
      name: 'SAS Programming',
      description: 'Data analysis using SAS software including data manipulation, statistical procedures, and report generation.',
      credits: 3,
      category: 'core',
      year: 3,
      semester: 'spring',
      prerequisites: '["STAT2510SEF"]',
      level: 'undergraduate'
    },

    // ==================== YEAR 3 - SUMMER ====================
    {
      id: 'MATH4950SEF',
      code: 'MATH 4950SEF',
      name: 'Professional Placement',
      description: 'Industry internship opportunity for students to gain practical work experience in data science or related fields.',
      credits: 3,
      category: 'elective',
      year: 3,
      semester: 'summer',
      prerequisites: '[]',
      level: 'undergraduate'
    },

    // ==================== YEAR 4 - AUTUMN ====================
    {
      id: 'COMP4330SEF',
      code: 'COMP 4330SEF',
      name: 'Advanced Programming & AI Algorithms',
      description: 'Advanced algorithms for artificial intelligence including search algorithms, optimization, and knowledge representation.',
      credits: 3,
      category: 'core',
      year: 4,
      semester: 'autumn',
      prerequisites: '["COMP3920SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'COMP4610SEF',
      code: 'COMP 4610SEF',
      name: 'Data Science Project',
      description: 'Capstone project where students apply data science techniques to solve real-world problems. Two-semester equivalent workload.',
      credits: 6,
      category: 'project',
      year: 4,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'COMP4930SEF',
      code: 'COMP 4930SEF',
      name: 'Deep Learning',
      description: 'Neural network architectures, convolutional networks, recurrent networks, and deep learning frameworks like TensorFlow and PyTorch.',
      credits: 3,
      category: 'core',
      year: 4,
      semester: 'autumn',
      prerequisites: '["COMP3920SEF"]',
      level: 'undergraduate'
    },

    // ==================== YEAR 4 - SPRING ====================
    {
      id: 'COMP4210SEF',
      code: 'COMP 4210SEF',
      name: 'Advanced Database & Data Warehousing',
      description: 'Advanced database concepts including data warehousing, OLAP, data mining, and business intelligence systems.',
      credits: 3,
      category: 'core',
      year: 4,
      semester: 'spring',
      prerequisites: '["COMP3200SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'COMP4600SEF',
      code: 'COMP 4600SEF',
      name: 'Advanced Topics in Data Mining',
      description: 'Advanced data mining techniques including association rules, clustering, classification, and text mining.',
      credits: 3,
      category: 'core',
      year: 4,
      semester: 'spring',
      prerequisites: '["COMP3920SEF"]',
      level: 'undergraduate'
    },

    // ==================== ELECTIVE COURSES ====================
    {
      id: 'COMP4630SEF',
      code: 'COMP 4630SEF',
      name: 'Distributed Systems and Parallel Computing',
      description: 'Design and implementation of distributed systems, parallel algorithms, and cloud computing architectures.',
      credits: 3,
      category: 'elective',
      year: 4,
      semester: 'spring',
      prerequisites: '["COMP2030SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'ELEC3050SEF',
      code: 'ELEC 3050SEF',
      name: 'Computer Networking',
      description: 'Network protocols, TCP/IP stack, network security, and wireless networking fundamentals.',
      credits: 3,
      category: 'elective',
      year: 4,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'ELEC3250SEF',
      code: 'ELEC 3250SEF',
      name: 'Computer & Network Security',
      description: 'Security principles, cryptography, authentication, and protection against cyber threats.',
      credits: 3,
      category: 'elective',
      year: 4,
      semester: 'spring',
      prerequisites: '["ELEC3050SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'ELEC4310SEF',
      code: 'ELEC 4310SEF',
      name: 'Blockchain Technologies',
      description: 'Blockchain fundamentals, smart contracts, cryptocurrencies, and decentralized applications.',
      credits: 3,
      category: 'elective',
      year: 4,
      semester: 'autumn',
      prerequisites: '["COMP2020SEF"]',
      level: 'undergraduate'
    },
    {
      id: 'ELEC4710SEF',
      code: 'ELEC 4710SEF',
      name: 'Digital Forensics',
      description: 'Investigation techniques for digital evidence, cybercrime analysis, and forensic tools.',
      credits: 3,
      category: 'elective',
      year: 4,
      semester: 'spring',
      prerequisites: '[]',
      level: 'undergraduate'
    },

    // ==================== UNIVERSITY CORE COURSES ====================
    {
      id: 'UCOR1001',
      code: 'UCOR 1001',
      name: 'Social Responsibilities',
      description: 'Exploration of social responsibility, ethics, and civic engagement in contemporary society.',
      credits: 1,
      category: 'university_core',
      year: 1,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'UCOR1002',
      code: 'UCOR 1002',
      name: 'University Core Values',
      description: 'Introduction to university values, academic integrity, and personal development.',
      credits: 2,
      category: 'university_core',
      year: 1,
      semester: 'spring',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'UCOR2003',
      code: 'UCOR 2003',
      name: 'The Effective Communication & Teamwork',
      description: 'Development of communication skills and teamwork abilities for professional environments.',
      credits: 3,
      category: 'university_core',
      year: 2,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    },
    {
      id: 'UCOR3003',
      code: 'UCOR 3003',
      name: 'Entrepreneurial Mindset & Leadership for Sustainability',
      description: 'Entrepreneurship principles, leadership skills, and sustainable business practices.',
      credits: 3,
      category: 'university_core',
      year: 3,
      semester: 'autumn',
      prerequisites: '[]',
      level: 'undergraduate'
    }
  ];

  return new Promise((resolve, reject) => {
    // Check if courses already exist
    db.get('SELECT COUNT(*) as count FROM courses', (err, row) => {
      if (err) {
        console.error('Error checking courses:', err);
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log(`Courses already seeded (${row.count} courses found)`);
        resolve();
        return;
      }

      // Insert courses
      const stmt = db.prepare(`
        INSERT INTO courses (id, code, name, description, credits, category, year, semester, prerequisites, level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      courses.forEach(course => {
        stmt.run(
          course.id,
          course.code,
          course.name,
          course.description,
          course.credits,
          course.category,
          course.year,
          course.semester,
          course.prerequisites,
          course.level
        );
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error seeding courses:', err);
          reject(err);
        } else {
          console.log(`Successfully seeded ${courses.length} courses`);
          resolve();
        }
      });
    });
  });
}

/**
 * Seed sample reviews for demonstration
 */
function seedReviews() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM reviews', (err, row) => {
      if (err) {
        console.error('Error checking reviews:', err);
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log(`Reviews already seeded (${row.count} reviews found)`);
        resolve();
        return;
      }

      const reviews = [
        {
          course_id: 'COMP1080SEF',
          user_id: 'user_001',
          author_name: 'Alice Wong',
          author_year: 3,
          semester: '2023 Autumn',
          rating: 5,
          content: 'Excellent introduction to programming! The Python-based curriculum is perfect for beginners. Professor explains concepts clearly and assignments are well-designed. Highly recommend for anyone new to coding.',
          helpful_count: 15
        },
        {
          course_id: 'COMP1080SEF',
          user_id: 'user_002',
          author_name: 'Bob Chen',
          author_year: 2,
          semester: '2024 Spring',
          rating: 4,
          content: 'Good course overall. The pace is a bit fast in the middle sections covering OOP, but the TA support is excellent. Make sure to start assignments early!',
          helpful_count: 8
        },
        {
          course_id: 'COMP2090SEF',
          user_id: 'user_003',
          author_name: 'Carol Lee',
          author_year: 3,
          semester: '2023 Spring',
          rating: 5,
          content: 'Challenging but rewarding course. Data structures are fundamental to computer science and this course covers them thoroughly. The algorithm analysis section is particularly valuable.',
          helpful_count: 12
        },
        {
          course_id: 'MATH1410SEF',
          user_id: 'user_004',
          author_name: 'David Liu',
          author_year: 4,
          semester: '2022 Autumn',
          rating: 3,
          content: 'Essential math course but quite challenging if you do not have a strong math background. Recommend reviewing calculus before starting.',
          helpful_count: 6
        },
        {
          course_id: 'COMP3920SEF',
          user_id: 'user_005',
          author_name: 'Emma Zhang',
          author_year: 4,
          semester: '2023 Spring',
          rating: 5,
          content: 'Best course in the program! Machine learning concepts are explained with practical examples. The final project allows you to apply everything you learned. Great preparation for data science careers.',
          helpful_count: 20
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO reviews (course_id, user_id, author_name, author_year, semester, rating, content, helpful_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      reviews.forEach(review => {
        stmt.run(
          review.course_id,
          review.user_id,
          review.author_name,
          review.author_year,
          review.semester,
          review.rating,
          review.content,
          review.helpful_count
        );
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error seeding reviews:', err);
          reject(err);
        } else {
          console.log(`Successfully seeded ${reviews.length} reviews`);
          resolve();
        }
      });
    });
  });
}

/**
 * Initialize the database with tables and seed data
 */
async function initializeDatabase() {
  try {
    await initializeTables();
    await seedCourses();
    await seedReviews();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get all courses
 * @returns {Promise<Array>} Array of course objects
 */
function getAllCourses() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM courses ORDER BY year, semester, code', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Get course by ID
 * @param {string} id - Course ID
 * @returns {Promise<Object>} Course object
 */
function getCourseById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Get courses by year
 * @param {number} year - Year (1-4)
 * @returns {Promise<Array>} Array of course objects
 */
function getCoursesByYear(year) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM courses WHERE year = ? ORDER BY semester, code', [year], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Get courses by category
 * @param {string} category - Course category
 * @returns {Promise<Array>} Array of course objects
 */
function getCoursesByCategory(category) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM courses WHERE category = ? ORDER BY year, code', [category], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Get reviews for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} Array of review objects
 */
function getReviewsByCourse(courseId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM reviews WHERE course_id = ? ORDER BY created_at DESC',
      [courseId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

/**
 * Add a new review
 * @param {Object} review - Review object
 * @returns {Promise<Object>} Created review with ID
 */
function addReview(review) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO reviews (course_id, user_id, author_name, author_year, semester, rating, content, is_anonymous)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      review.course_id,
      review.user_id,
      review.author_name,
      review.author_year,
      review.semester,
      review.rating,
      review.content,
      review.is_anonymous || 0,
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...review });
        }
      }
    );

    stmt.finalize();
  });
}

/**
 * Increment helpful count for a review
 * @param {number} reviewId - Review ID
 * @returns {Promise<boolean>} Success status
 */
function incrementHelpfulCount(reviewId) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
      [reviewId],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
}

/**
 * Delete a review
 * @param {number} reviewId - Review ID
 * @returns {Promise<boolean>} Success status
 */
function deleteReview(reviewId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM reviews WHERE id = ?', [reviewId], function(err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

/**
 * Get materials for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} Array of material objects
 */
function getMaterialsByCourse(courseId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM materials WHERE course_id = ? ORDER BY created_at DESC',
      [courseId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

/**
 * Get material by ID
 * @param {number} materialId - Material ID
 * @returns {Promise<Object>} Material object
 */
function getMaterialById(materialId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM materials WHERE id = ?', [materialId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Add a new material
 * @param {Object} material - Material object
 * @returns {Promise<Object>} Created material with ID
 */
function addMaterial(material) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO materials (course_id, filename, original_name, file_size, file_type, description, uploaded_by, uploader_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      material.course_id,
      material.filename,
      material.original_name,
      material.file_size,
      material.file_type,
      material.description,
      material.uploaded_by,
      material.uploader_id,
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...material });
        }
      }
    );

    stmt.finalize();
  });
}

/**
 * Increment download count for a material
 * @param {number} materialId - Material ID
 * @returns {Promise<boolean>} Success status
 */
function incrementDownloadCount(materialId) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE materials SET download_count = download_count + 1 WHERE id = ?',
      [materialId],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
}

/**
 * Delete a material
 * @param {number} materialId - Material ID
 * @returns {Promise<boolean>} Success status
 */
function deleteMaterial(materialId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM materials WHERE id = ?', [materialId], function(err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

/**
 * Get user progress for all courses
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user course progress
 */
function getUserProgress(userId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT c.*, uc.status, uc.updated_at
      FROM courses c
      LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = ?
      ORDER BY c.year, c.semester, c.code
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Update course status for a user
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} status - Status (completed, in_progress, available, locked)
 * @returns {Promise<Object>} Updated progress
 */
function updateCourseStatus(userId, courseId, status) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO user_courses (user_id, course_id, status)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, course_id) DO UPDATE SET
        status = excluded.status,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(userId, courseId, status, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ user_id: userId, course_id: courseId, status });
      }
    });

    stmt.finalize();
  });
}

/**
 * Get progress statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
function getProgressStats(userId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        COUNT(*) as total_courses,
        SUM(c.credits) as total_credits,
        SUM(CASE WHEN uc.status = 'completed' THEN c.credits ELSE 0 END) as completed_credits,
        SUM(CASE WHEN uc.status = 'in_progress' THEN c.credits ELSE 0 END) as in_progress_credits,
        COUNT(CASE WHEN uc.status = 'completed' THEN 1 END) as completed_courses,
        COUNT(CASE WHEN uc.status = 'in_progress' THEN 1 END) as in_progress_courses
      FROM courses c
      LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = ?
    `, [userId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          total_courses: row.total_courses || 0,
          total_credits: row.total_credits || 120,
          completed_credits: row.completed_credits || 0,
          in_progress_credits: row.in_progress_credits || 0,
          remaining_credits: 120 - (row.completed_credits || 0),
          completed_courses: row.completed_courses || 0,
          in_progress_courses: row.in_progress_courses || 0,
          completion_percentage: row.total_credits ? 
            Math.round(((row.completed_credits || 0) / 120) * 100) : 0
        });
      }
    });
  });
}

/**
 * Get category breakdown for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of category statistics
 */
function getCategoryBreakdown(userId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        c.category,
        SUM(c.credits) as total_credits,
        SUM(CASE WHEN uc.status = 'completed' THEN c.credits ELSE 0 END) as completed_credits,
        COUNT(*) as total_courses,
        COUNT(CASE WHEN uc.status = 'completed' THEN 1 END) as completed_courses
      FROM courses c
      LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = ?
      GROUP BY c.category
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  getAllCourses,
  getCourseById,
  getCoursesByYear,
  getCoursesByCategory,
  getReviewsByCourse,
  addReview,
  incrementHelpfulCount,
  deleteReview,
  getMaterialsByCourse,
  getMaterialById,
  addMaterial,
  incrementDownloadCount,
  deleteMaterial,
  getUserProgress,
  updateCourseStatus,
  getProgressStats,
  getCategoryBreakdown
};
