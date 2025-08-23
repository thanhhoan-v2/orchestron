import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function migrateTodosToTodoStrings() {
  try {
    console.log('Starting migration from todos to todo_strings...');
    
    // Check if old todos table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'todos'
      )
    `;
    
    if (!tableExists[0]?.exists) {
      console.log('Old todos table does not exist, skipping migration');
      return;
    }
    
    // Get all todos and combine them into a single string
    const todos = await sql`
      SELECT title, description, completed 
      FROM todos 
      ORDER BY "order" ASC, created_at ASC
    `;
    
    if (todos.length === 0) {
      console.log('No todos found to migrate');
      return;
    }
    
    // Combine all todos into a single string
    const combinedContent = todos
      .map(todo => {
        const status = todo.completed ? '[x]' : '[ ]';
        const title = todo.title || '';
        const description = todo.description ? ` - ${todo.description}` : '';
        return `${status} ${title}${description}`;
      })
      .join('\n');
    
    console.log('Combined todos content:', combinedContent);
    
    // Create new todo_strings table and insert combined content
    await sql`
      CREATE TABLE IF NOT EXISTS todo_strings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      INSERT INTO todo_strings (content) VALUES (${combinedContent})
    `;
    
    console.log('Migration completed successfully!');
    console.log('You can now safely drop the old todos table if desired.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateTodosToTodoStrings()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
