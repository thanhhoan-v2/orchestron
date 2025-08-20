import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  order?: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url?: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  order: number;
  created_at: string;
  updated_at: string;
  children?: Bookmark[];
}

export interface CreateBookmarkInput {
  title: string;
  url?: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
}

export interface UpdateBookmarkInput {
  title?: string;
  url?: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  order?: number;
}

export class TodoService {
  // Initialize the database table if it doesn't exist
  static async initializeDatabase(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS todos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT FALSE,
          "order" INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Add order column if it doesn't exist (for existing databases)
      try {
        await sql`
          ALTER TABLE todos ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0
        `;
        
        // Set order for existing todos if they don't have it
        await sql`
          UPDATE todos 
          SET "order" = EXTRACT(EPOCH FROM created_at)::INTEGER 
          WHERE "order" = 0 OR "order" IS NULL
        `;
      } catch (error) {
        // Column might already exist, ignore error
        console.log('Order column migration info:', error);
      }
      console.log('Database table initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  static async getAllTodos(): Promise<Todo[]> {
    const result = await sql`
      SELECT * FROM todos 
      ORDER BY "order" ASC, created_at DESC
    `;
    return result as Todo[];
  }

  static async getTodoById(id: string): Promise<Todo | null> {
    const result = await sql`
      SELECT * FROM todos WHERE id = ${id}
    `;
    return result[0] as Todo || null;
  }

  static async createTodo(input: CreateTodoInput): Promise<Todo> {
    // Get the maximum order value to place new todo at the end
    const maxOrderResult = await sql`
      SELECT COALESCE(MAX("order"), 0) + 1 as next_order FROM todos
    `;
    const nextOrder = maxOrderResult[0]?.next_order || 1;
    
    const result = await sql`
      INSERT INTO todos (title, description, "order")
      VALUES (${input.title}, ${input.description || null}, ${nextOrder})
      RETURNING *
    `;
    return result[0] as Todo;
  }

  static async updateTodo(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    // If no updates provided, return the existing todo
    if (Object.keys(input).length === 0) {
      return await this.getTodoById(id);
    }

    // Handle different update combinations using tagged template literals
    if (input.title !== undefined && input.description !== undefined && input.completed !== undefined && input.order !== undefined) {
      const result = await sql`
        UPDATE todos 
        SET title = ${input.title}, 
            description = ${input.description}, 
            completed = ${input.completed}, 
            "order" = ${input.order},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Todo || null;
    } else if (input.order !== undefined && input.completed === undefined && input.title === undefined && input.description === undefined) {
      // Order only
      const result = await sql`
        UPDATE todos 
        SET "order" = ${input.order}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Todo || null;
    } else if (input.completed !== undefined && input.order === undefined && input.title === undefined && input.description === undefined) {
      // Completed only
      const result = await sql`
        UPDATE todos 
        SET completed = ${input.completed}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Todo || null;
    } else if (input.title !== undefined && input.description !== undefined && input.completed === undefined && input.order === undefined) {
      // Title and description
      const result = await sql`
        UPDATE todos 
        SET title = ${input.title}, 
            description = ${input.description}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Todo || null;
    } else if (input.title !== undefined && input.completed !== undefined && input.description === undefined && input.order === undefined) {
      // Title and completed
      const result = await sql`
        UPDATE todos 
        SET title = ${input.title}, 
            completed = ${input.completed}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Todo || null;
    } else if (input.title !== undefined && input.description === undefined && input.completed === undefined && input.order === undefined) {
      // Title only
      const result = await sql`
        UPDATE todos 
        SET title = ${input.title}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Todo || null;
    } else if (input.description !== undefined && input.title === undefined && input.completed === undefined && input.order === undefined) {
      // Description only
      const result = await sql`
        UPDATE todos 
        SET description = ${input.description}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Todo || null;
    }

    // Fallback for other combinations - get current todo and update all fields
    const currentTodo = await this.getTodoById(id);
    if (!currentTodo) return null;

    const result = await sql`
      UPDATE todos 
      SET title = ${input.title ?? currentTodo.title}, 
          description = ${input.description ?? currentTodo.description}, 
          completed = ${input.completed ?? currentTodo.completed}, 
          "order" = ${input.order ?? currentTodo.order},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] as Todo || null;
  }

  static async deleteTodo(id: string): Promise<boolean> {
    console.log('TodoService.deleteTodo called with ID:', id, 'Type:', typeof id);
    
    try {
      // First, let's check if the todo exists
      const existingTodo = await this.getTodoById(id);
      console.log('Existing todo before delete:', existingTodo);
      
      if (!existingTodo) {
        console.log('Todo does not exist, returning false');
        return false;
      }
      
      await sql`
        DELETE FROM todos WHERE id = ${id}
      `;
      
      // Check if the todo still exists after deletion
      const todoAfterDelete = await this.getTodoById(id);
      const success = todoAfterDelete === null;
      console.log('Delete operation success:', success);
      return success;
    } catch (error) {
      console.error('Error in deleteTodo:', error);
      throw error;
    }
  }

  static async toggleTodoCompletion(id: string): Promise<Todo | null> {
    const result = await sql`
      UPDATE todos 
      SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] as Todo || null;
  }

  static async reorderTodos(todoOrders: { id: string; order: number }[]): Promise<void> {
    try {
      // Update each todo's order in a single transaction-like operation
      for (const { id, order } of todoOrders) {
        await sql`
          UPDATE todos 
          SET "order" = ${order}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }
    } catch (error) {
      console.error('Error reordering todos:', error);
      throw error;
    }
  }
}

export class BookmarkService {
  // Get all bookmarks with hierarchical structure
  static async getAllBookmarks(): Promise<Bookmark[]> {
    const result = await sql`
      WITH RECURSIVE bookmark_tree AS (
        -- Base case: root bookmarks (no parent)
        SELECT 
          id, title, url, description, parent_id, icon, color, "order",
          created_at, updated_at, 0 as level
        FROM bookmarks 
        WHERE parent_id IS NULL
        
        UNION ALL
        
        -- Recursive case: child bookmarks
        SELECT 
          b.id, b.title, b.url, b.description, b.parent_id, b.icon, b.color, b."order",
          b.created_at, b.updated_at, bt.level + 1
        FROM bookmarks b
        INNER JOIN bookmark_tree bt ON b.parent_id = bt.id
      )
      SELECT * FROM bookmark_tree
      ORDER BY level, 
               CASE WHEN url IS NOT NULL THEN 0 ELSE 1 END,
               "order" ASC, created_at DESC
    `;
    
    // Build hierarchical structure
    const bookmarksMap = new Map<string, Bookmark>();
    const rootBookmarks: Bookmark[] = [];
    
    // First pass: create all bookmark objects
    for (const row of result) {
      const bookmark: Bookmark = {
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description,
        parent_id: row.parent_id,
        icon: row.icon,
        color: row.color,
        order: row.order,
        created_at: row.created_at,
        updated_at: row.updated_at,
        children: []
      };
      bookmarksMap.set(bookmark.id, bookmark);
    }
    
    // Second pass: build hierarchy
    for (const bookmark of bookmarksMap.values()) {
      if (bookmark.parent_id) {
        const parent = bookmarksMap.get(bookmark.parent_id);
        if (parent) {
          parent.children!.push(bookmark);
        }
      } else {
        rootBookmarks.push(bookmark);
      }
    }
    
    return rootBookmarks;
  }

  static async getBookmarkById(id: string): Promise<Bookmark | null> {
    const result = await sql`
      SELECT * FROM bookmarks WHERE id = ${id}
    `;
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description,
      parent_id: row.parent_id,
      icon: row.icon,
      color: row.color,
      order: row.order,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  static async createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
    // Get the maximum order value for the parent (or root level)
    const maxOrderResult = await sql`
      SELECT COALESCE(MAX("order"), 0) + 1 as next_order 
      FROM bookmarks 
      WHERE ${input.parent_id ? sql`parent_id = ${input.parent_id}` : sql`parent_id IS NULL`}
    `;
    const nextOrder = maxOrderResult[0]?.next_order || 1;
    
    const result = await sql`
      INSERT INTO bookmarks (title, url, description, parent_id, icon, color, "order")
      VALUES (
        ${input.title}, 
        ${input.url || null}, 
        ${input.description || null}, 
        ${input.parent_id || null}, 
        ${input.icon || null}, 
        ${input.color || null}, 
        ${nextOrder}
      )
      RETURNING *
    `;
    
    const row = result[0];
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description,
      parent_id: row.parent_id,
      icon: row.icon,
      color: row.color,
      order: row.order,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  static async updateBookmark(id: string, input: UpdateBookmarkInput): Promise<Bookmark | null> {
    if (Object.keys(input).length === 0) {
      return await this.getBookmarkById(id);
    }

    const currentBookmark = await this.getBookmarkById(id);
    if (!currentBookmark) return null;

    const result = await sql`
      UPDATE bookmarks 
      SET 
        title = ${input.title ?? currentBookmark.title}, 
        url = ${input.url ?? currentBookmark.url}, 
        description = ${input.description ?? currentBookmark.description}, 
        parent_id = ${input.parent_id ?? currentBookmark.parent_id}, 
        icon = ${input.icon ?? currentBookmark.icon}, 
        color = ${input.color ?? currentBookmark.color}, 
        "order" = ${input.order ?? currentBookmark.order},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description,
      parent_id: row.parent_id,
      icon: row.icon,
      color: row.color,
      order: row.order,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  static async deleteBookmark(id: string): Promise<boolean> {
    try {
      const existingBookmark = await this.getBookmarkById(id);
      if (!existingBookmark) {
        return false;
      }
      
      await sql`
        DELETE FROM bookmarks WHERE id = ${id}
      `;
      
      const bookmarkAfterDelete = await this.getBookmarkById(id);
      return bookmarkAfterDelete === null;
    } catch (error) {
      console.error('Error in deleteBookmark:', error);
      throw error;
    }
  }

  static async reorderBookmarks(bookmarkOrders: { id: string; order: number }[]): Promise<void> {
    try {
      for (const { id, order } of bookmarkOrders) {
        await sql`
          UPDATE bookmarks 
          SET "order" = ${order}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }
    } catch (error) {
      console.error('Error reordering bookmarks:', error);
      throw error;
    }
  }

  static async moveBookmark(params: { 
    sourceId: string; 
    newParentId: string | null; 
    insertIndex: number 
  }): Promise<void> {
    const { sourceId, newParentId, insertIndex } = params;
    
    try {
      // Get all siblings in the target parent to determine the new order
      const siblings = await sql`
        SELECT id, "order" FROM bookmarks 
        WHERE ${newParentId ? sql`parent_id = ${newParentId}` : sql`parent_id IS NULL`}
        AND id != ${sourceId}
        ORDER BY "order" ASC
      `;

      // Calculate the new order for the moved bookmark
      let newOrder: number;
      if (siblings.length === 0) {
        newOrder = 1;
      } else if (insertIndex <= 0) {
        // Insert at beginning
        newOrder = siblings[0].order - 1;
      } else if (insertIndex >= siblings.length) {
        // Insert at end
        newOrder = siblings[siblings.length - 1].order + 1;
      } else {
        // Insert between two items
        const prevOrder = siblings[insertIndex - 1].order;
        const nextOrder = siblings[insertIndex].order;
        newOrder = Math.floor((prevOrder + nextOrder) / 2);
        
        // If we can't fit between (orders are consecutive), shift everything down
        if (newOrder === prevOrder) {
          // Shift all items at insertIndex and after
          for (let i = insertIndex; i < siblings.length; i++) {
            await sql`
              UPDATE bookmarks 
              SET "order" = ${siblings[i].order + 1}, updated_at = CURRENT_TIMESTAMP
              WHERE id = ${siblings[i].id}
            `;
          }
          newOrder = nextOrder;
        }
      }

      // Update the moved bookmark
      await sql`
        UPDATE bookmarks 
        SET parent_id = ${newParentId}, "order" = ${newOrder}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${sourceId}
      `;
    } catch (error) {
      console.error('Error moving bookmark:', error);
      throw error;
    }
  }

  static async getParentOptions(): Promise<{ id: string; title: string; level: number }[]> {
    const result = await sql`
      WITH RECURSIVE bookmark_tree AS (
        -- Base case: root folders (no parent and no URL)
        SELECT id, title, parent_id, 0 as level
        FROM bookmarks 
        WHERE parent_id IS NULL AND url IS NULL
        
        UNION ALL
        
        -- Recursive case: child folders (no URL)
        SELECT b.id, b.title, b.parent_id, bt.level + 1
        FROM bookmarks b
        INNER JOIN bookmark_tree bt ON b.parent_id = bt.id
        WHERE b.url IS NULL
      )
      SELECT id, title, level FROM bookmark_tree
      ORDER BY level, title
    `;
    
    return result.map(row => ({
      id: row.id,
      title: row.title,
      level: row.level
    }));
  }
}
