import express from 'express';
import cors from 'cors';
import { db } from './db/index.js';
import { courses, assignments, submissions, users } from './db/schema.js';
import authRouter from './routes/auth.js';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRouter);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // You'll need to add this to your .env
});



// Get courses for a specific user
app.get('/api/courses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For prototype: just get all courses
    // You can filter by teacherId later if needed
    const allCourses = await db.select().from(courses);
    
    res.json(allCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, teacherId } = req.body;

    const [newCourse] = await db
      .insert(courses)
      .values({
        title,
        description,
        teacherId,
      })
      .returning();

    res.json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Get single course details
app.get('/api/courses/:courseId/details', async (req, res) => {
  try {
    const { courseId } = req.params;
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, parseInt(courseId)))
      .limit(1);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Get assignments for a course
app.get('/api/courses/:courseId/assignments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.courseId, parseInt(courseId)));
    
    res.json(courseAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

app.post('/api/courses/:courseId/assignments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, dueDate, aiPrompt } = req.body;

    const [newAssignment] = await db
      .insert(assignments)
      .values({
        courseId: parseInt(courseId),
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        aiPrompt: aiPrompt || null,
      })
      .returning();

    res.json(newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Delete an assignment
app.delete('/api/assignments/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // First, delete any submissions for this assignment
    await db
      .delete(submissions)
      .where(eq(submissions.assignmentId, parseInt(assignmentId)));

    // Then delete the assignment
    await db
      .delete(assignments)
      .where(eq(assignments.id, parseInt(assignmentId)));

    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// Submit/Update assignment with AI feedback
app.post('/api/assignments/:assignmentId/submit', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, content, courseTitle, courseDescription, aiPrompt } = req.body;

    // Get assignment details
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, parseInt(assignmentId)))
      .limit(1);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if student already has a submission (MOVE THIS UP!)
    const [existingSubmission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.assignmentId, parseInt(assignmentId)))
      .where(eq(submissions.studentId, parseInt(studentId)))
      .limit(1);

    // NOW you can use existingSubmission in your prompt
    const instructorGuidance = aiPrompt 
      ? `\n\nTeacher's Specific Focus Areas: ${aiPrompt}` 
      : '';

    const revisionContext = existingSubmission 
      ? '\n\nThis is a revised submission. The student has improved their work based on previous AI feedback.' 
      : '';

    const prompt = `You are an educational AI assistant helping students improve their work.

    Course: ${courseTitle}
    Course Description: ${courseDescription}
    Assignment: ${assignment.title}
    Assignment Description: ${assignment.description}${instructorGuidance}${revisionContext}

    Student's Submission:
    ${content}

    Please provide constructive feedback in HTML format. Structure your feedback as follows:

    <h4>✅ Strengths</h4>
    <ul>
    <li>List 2-3 specific things the student did well</li>
    </ul>

    <h4>🎯 Areas for Improvement</h4>
    <ul>
    <li>Provide 3-4 specific, actionable suggestions</li>
    <li>When relevant, quote specific parts using <blockquote> tags</li>
    </ul>

    <h4>📝 Next Steps</h4>
    <ul>
    <li>1-2 concrete actions the student can take to improve</li>
    </ul>

    Use <strong> for emphasis. Be specific, constructive, and encouraging.`;

    let aiFeedback = '';

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful educational assistant providing constructive feedback to students. Your goal is to help them improve through specific, actionable advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      aiFeedback = completion.choices[0].message.content;

      // Clean up any markdown code blocks
      aiFeedback = aiFeedback
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      aiFeedback = '<p>Unable to generate AI feedback at this time. Your submission has been saved and your teacher will review it.</p>';
    }

    let submission;

    if (existingSubmission) {
      // Update existing submission
      [submission] = await db
        .update(submissions)
        .set({
          content: content,
          aiFeedback: aiFeedback,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, existingSubmission.id))
        .returning();
    } else {
      // Create new submission
      [submission] = await db
        .insert(submissions)
        .values({
          assignmentId: parseInt(assignmentId),
          studentId: parseInt(studentId),
          content: content,
          aiFeedback: aiFeedback,
        })
        .returning();
    }

    res.json({
      submission: submission,
      aiFeedback: aiFeedback,
      isUpdate: !!existingSubmission,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});


// Get student's submission for an assignment
app.get('/api/assignments/:assignmentId/submission/:studentId', async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.assignmentId, parseInt(assignmentId)))
      .where(eq(submissions.studentId, parseInt(studentId)))
      .limit(1);

    if (!submission) {
      return res.status(404).json({ error: 'No submission found' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});


// Get all submissions for an assignment (with student names)
app.get('/api/assignments/:assignmentId/all-submissions', async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignmentSubmissions = await db
      .select({
        id: submissions.id,
        content: submissions.content,
        ai_feedback: submissions.aiFeedback,
        grade: submissions.grade,
        teacher_feedback: submissions.teacherFeedback,
        submitted_at: submissions.submittedAt,
        updated_at: submissions.updatedAt,
        student_id: submissions.studentId,
        student_name: users.name,
        student_email: users.email,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.studentId, users.id))
      .where(eq(submissions.assignmentId, parseInt(assignmentId)));

    res.json(assignmentSubmissions);
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Update submission with grade and teacher feedback
app.put('/api/submissions/:submissionId/grade', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, teacherFeedback } = req.body;

    const [updatedSubmission] = await db
      .update(submissions)
      .set({
        grade: grade,
        teacherFeedback: teacherFeedback,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, parseInt(submissionId)))
      .returning();

    if (!updatedSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(updatedSubmission);
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ error: 'Failed to update grade' });
  }
});

// Get student's grades for a course
app.get('/api/courses/:courseId/student/:studentId/grades', async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // Get all assignments for the course
    const courseAssignments = await db
      .select({
        assignment_id: assignments.id,
        grade: submissions.grade,
        submitted_at: submissions.submittedAt,
      })
      .from(assignments)
      .leftJoin(
        submissions,
        eq(assignments.id, submissions.assignmentId)
      )
      .where(eq(assignments.courseId, parseInt(courseId)))
      .where(eq(submissions.studentId, parseInt(studentId)));

    res.json(courseAssignments);
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});