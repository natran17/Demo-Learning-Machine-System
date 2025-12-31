import { pgTable, integer, varchar, timestamp, serial, text} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(), // ADD THIS LINE
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  class: varchar("class", { length: 10 }),
  grade_level: varchar("grade_level", { length: 10 }),
  createdAt: timestamp('created_at').defaultNow(), // Optional but good to have
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  teacherId: integer('teacher_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  aiPrompt: text('ai_prompt'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').references(() => assignments.id),
  studentId: integer('student_id').references(() => users.id),
  content: text('content').notNull(),
  aiFeedback: text('ai_feedback'),
  grade: integer('grade'),
  teacherFeedback: text('teacher_feedback'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),

});