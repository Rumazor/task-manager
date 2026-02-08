import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { Tag } from '../tags/tag.entity';
import { Project } from '../projects/project.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('Starting database seeding...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // Clear all existing data
    console.log('Clearing existing data...');
    // Use TRUNCATE CASCADE to handle foreign key constraints
    await dataSource.query('TRUNCATE TABLE "comment", "notification", "activity_log", "task_tags", "task", "tag", "project", "user" RESTART IDENTITY CASCADE;');

    // Create test users
    console.log('Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await dataSource.getRepository(User).save({
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    });

    const managerUser = await dataSource.getRepository(User).save({
      email: 'manager@test.com',
      password: hashedPassword,
      name: 'Manager User',
      role: UserRole.MANAGER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
    });

    const user1 = await dataSource.getRepository(User).save({
      email: 'john@test.com',
      password: hashedPassword,
      name: 'John Doe',
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    });

    const user2 = await dataSource.getRepository(User).save({
      email: 'jane@test.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    });

    const user3 = await dataSource.getRepository(User).save({
      email: 'bob@test.com',
      password: hashedPassword,
      name: 'Bob Wilson',
      role: UserRole.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    });

    console.log('✓ Created 5 test users');
    console.log('  - admin@test.com (Admin)');
    console.log('  - manager@test.com (Manager)');
    console.log('  - john@test.com, jane@test.com, bob@test.com (Users)');
    console.log('  - All passwords: password123');

    // Create projects
    console.log('\nCreating projects...');
    const project1 = await dataSource.getRepository(Project).save({
      name: 'Website Redesign',
      description: 'Complete redesign of the company website',
      color: '#3B82F6',
      owner: adminUser,
    });

    const project2 = await dataSource.getRepository(Project).save({
      name: 'Mobile App Development',
      description: 'Build a new mobile application',
      color: '#10B981',
      owner: managerUser,
    });

    const project3 = await dataSource.getRepository(Project).save({
      name: 'Marketing Campaign',
      description: 'Q1 2026 marketing campaign',
      color: '#F59E0B',
      owner: adminUser,
    });

    console.log('✓ Created 3 projects');

    // Create tags for each user
    console.log('\nCreating tags...');
    const urgentTag = await dataSource.getRepository(Tag).save({
      name: 'Urgent',
      color: '#EF4444',
      user: adminUser,
    });

    const bugTag = await dataSource.getRepository(Tag).save({
      name: 'Bug',
      color: '#DC2626',
      user: adminUser,
    });

    const featureTag = await dataSource.getRepository(Tag).save({
      name: 'Feature',
      color: '#3B82F6',
      user: user1,
    });

    const designTag = await dataSource.getRepository(Tag).save({
      name: 'Design',
      color: '#8B5CF6',
      user: user2,
    });

    const documentationTag = await dataSource.getRepository(Tag).save({
      name: 'Documentation',
      color: '#6B7280',
      user: user3,
    });

    console.log('✓ Created 5 tags');

    // Create tasks
    console.log('\nCreating tasks...');
    const tasksData = [
      // Admin's tasks
      {
        title: 'Setup project repository',
        description: 'Initialize Git repository and setup CI/CD pipeline',
        completed: true,
        priority: 'high' as const,
        user: adminUser,
        project: project1,
        tags: [urgentTag],
        position: 0,
      },
      {
        title: 'Review design mockups',
        description: 'Review and approve the new design mockups from the design team',
        completed: false,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        user: adminUser,
        project: project1,
        tags: [designTag],
        position: 1,
        assignedTo: user2,
      },
      {
        title: 'Update documentation',
        description: 'Update API documentation with new endpoints',
        completed: false,
        priority: 'medium' as const,
        user: adminUser,
        tags: [documentationTag],
        position: 2,
      },

      // Manager's tasks
      {
        title: 'Sprint planning meeting',
        description: 'Organize sprint planning for the next iteration',
        completed: false,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        user: managerUser,
        project: project2,
        position: 0,
      },
      {
        title: 'Code review PR #123',
        description: 'Review pull request for authentication module',
        completed: false,
        priority: 'medium' as const,
        user: managerUser,
        project: project2,
        tags: [featureTag],
        position: 1,
        assignedTo: user1,
      },

      // User1's tasks
      {
        title: 'Fix login bug',
        description: 'Users are experiencing issues with OAuth login',
        completed: false,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        user: user1,
        project: project2,
        tags: [bugTag, urgentTag],
        position: 0,
      },
      {
        title: 'Implement search feature',
        description: 'Add full-text search functionality to the app',
        completed: false,
        priority: 'medium' as const,
        user: user1,
        project: project2,
        tags: [featureTag],
        position: 1,
      },
      {
        title: 'Write unit tests',
        description: 'Add unit tests for the task service',
        completed: true,
        priority: 'low' as const,
        user: user1,
        tags: [documentationTag],
        position: 2,
      },

      // User2's tasks
      {
        title: 'Create wireframes',
        description: 'Design wireframes for the new dashboard',
        completed: true,
        priority: 'high' as const,
        user: user2,
        project: project1,
        tags: [designTag],
        position: 0,
      },
      {
        title: 'Design new landing page',
        description: 'Create a modern landing page design',
        completed: false,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        user: user2,
        project: project1,
        tags: [designTag],
        position: 1,
      },
      {
        title: 'User testing session',
        description: 'Conduct user testing for the new UI',
        completed: false,
        priority: 'medium' as const,
        user: user2,
        project: project1,
        position: 2,
      },

      // User3's tasks
      {
        title: 'Database optimization',
        description: 'Optimize slow database queries',
        completed: false,
        priority: 'medium' as const,
        user: user3,
        project: project2,
        position: 0,
      },
      {
        title: 'Setup monitoring',
        description: 'Configure application monitoring and alerts',
        completed: false,
        priority: 'low' as const,
        user: user3,
        tags: [documentationTag],
        position: 1,
      },

      // Marketing campaign tasks
      {
        title: 'Prepare email campaign',
        description: 'Create email templates for Q1 campaign',
        completed: false,
        priority: 'high' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: user2,
        project: project3,
        position: 0,
      },
      {
        title: 'Social media strategy',
        description: 'Develop social media content calendar',
        completed: false,
        priority: 'medium' as const,
        user: user1,
        project: project3,
        position: 1,
      },
    ];

    for (const taskData of tasksData) {
      await dataSource.getRepository(Task).save(taskData);
    }

    // Create a task with subtasks
    const parentTask = await dataSource.getRepository(Task).save({
      title: 'Launch new feature',
      description: 'Complete feature launch checklist',
      completed: false,
      priority: 'high' as const,
      user: adminUser,
      project: project2,
      tags: [featureTag, urgentTag],
      position: 3,
    });

    await dataSource.getRepository(Task).save({
      title: 'Write release notes',
      description: 'Document all changes for the release',
      completed: false,
      priority: 'medium' as const,
      user: adminUser,
      parentTask: parentTask,
      position: 0,
    });

    await dataSource.getRepository(Task).save({
      title: 'Update changelog',
      description: 'Add entries to CHANGELOG.md',
      completed: true,
      priority: 'low' as const,
      user: adminUser,
      parentTask: parentTask,
      position: 1,
    });

    console.log('✓ Created 17 tasks (including subtasks)');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Summary:');
    console.log('  - Users: 5 (1 admin, 1 manager, 3 regular users)');
    console.log('  - Projects: 3');
    console.log('  - Tags: 5');
    console.log('  - Tasks: 17');
    console.log('\n🔑 Login with:');
    console.log('  Email: admin@test.com');
    console.log('  Password: password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => {
    console.log('\n🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
