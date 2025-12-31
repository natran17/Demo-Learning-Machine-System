// backend/routes/assignments.js
import express from 'express';
import { db } from '../db/index.js';
import { assignments, submissions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// GET all assignments for a course
router.get('/courses/:courseId/assignments', async (req, res) => {
  const { courseId } = req.params;
  
  const courseAssignments = await db
    .select()
    .from(assignments)
    .where(eq(assignments.courseId, courseId));
  
  res.json(courseAssignments);  // Send as JSON
});

// POST - student submits assignment
router.post('/assignments/:assignmentId/submit', async (req, res) => {
  const { assignmentId } = req.params;
  const { studentId, content } = req.body;
  
  const newSubmission = await db
    .insert(submissions)
    .values({
      assignmentId,
      studentId,
      content,
    })
    .returning();
  
  res.json(newSubmission);
});

export default router;