import { db } from './src/db/index.js';
import { users, courses, assignments } from './src/db/schema.js';

async function seed() {
  try {
    // Create a teacher
    const [teacher] = await db.insert(users).values({
      email: 'teacher@school.com',
      password: 'hashed_password_here', // In real app, use bcrypt
      name: 'Ms. Johnson',
      role: 'teacher'
    }).returning();

    console.log('Created teacher:', teacher);

    // Create some courses
    const courseData = [
      {
        title: 'Mathematics 101',
        description: 'Introduction to Algebra',
        teacherId: teacher.id
      },
      {
        title: 'English Literature',
        description: 'Classic novels and poetry',
        teacherId: teacher.id
      },
      {
        title: 'Biology',
        description: 'Introduction to life sciences',
        teacherId: teacher.id
      }
    ];

    const createdCourses = await db.insert(courses).values(courseData).returning();
    console.log('Created courses:', createdCourses);

    // Create an assignment for the first course
    await db.insert(assignments).values({
      courseId: createdCourses[0].id,
      title: 'Algebra Homework 1',
      description: 'Complete problems 1-10 on page 42',
      dueDate: new Date('2025-12-25')
    });

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
  process.exit(0);
}

seed();