import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface TodoString {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoStringInput {
  content: string;
}

export interface UpdateTodoStringInput {
  content: string;
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

export interface Reminder {
  id: string;
  title: string;
  due_date: string;
  days_remaining: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  title: string;
  due_date: string;
}

export interface UpdateReminderInput {
  title?: string;
  due_date?: string;
  order?: number;
}

export interface Fund {
  id: string;
  title: string;
  price: string; // in VND stored as string for precision
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFundInput {
  title: string;
  price: string;
}

export interface UpdateFundInput {
  title?: string;
  price?: string;
  order?: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  priority: 'low' | 'medium' | 'high';
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  target_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  target_date?: string;
  priority?: 'low' | 'medium' | 'high';
  order?: number;
}

export class TodoStringService {
  // Initialize the database table if it doesn't exist
  static async initializeDatabase(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS todo_strings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Insert default empty content if table is empty
      const countResult = await sql`SELECT COUNT(*) as count FROM todo_strings`;
      if (countResult[0]?.count === '0') {
        await sql`
          INSERT INTO todo_strings (content) VALUES ('')
        `;
      }
      
      console.log('Todo strings database table initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  static async getTodoString(): Promise<TodoString | null> {
    const result = await sql`
      SELECT * FROM todo_strings 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    return result[0] as TodoString || null;
  }

  static async createOrUpdateTodoString(input: CreateTodoStringInput): Promise<TodoString> {
    // Check if there's an existing record
    const existing = await this.getTodoString();
    
    if (existing) {
      // Update existing record
      const result = await sql`
        UPDATE todo_strings 
        SET content = ${input.content}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.id}
        RETURNING *
      `;
      return result[0] as TodoString;
    } else {
      // Create new record
      const result = await sql`
        INSERT INTO todo_strings (content)
        VALUES (${input.content})
        RETURNING *
      `;
      return result[0] as TodoString;
    }
  }

  static async updateTodoString(id: string, input: UpdateTodoStringInput): Promise<TodoString | null> {
    const result = await sql`
      UPDATE todo_strings 
      SET content = ${input.content}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] as TodoString || null;
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

export class ReminderService {
  // Helper method to calculate days remaining
  private static calculateDaysRemaining(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    
    // Reset time to start of day for accurate day calculation
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Initialize the database table if it doesn't exist
  static async initializeDatabase(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS reminders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          due_date DATE NOT NULL,
          "order" INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Add order column if it doesn't exist (for existing databases)
      try {
        await sql`
          ALTER TABLE reminders ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0
        `;
        
        // Set order for existing reminders if they don't have it
        await sql`
          UPDATE reminders 
          SET "order" = EXTRACT(EPOCH FROM created_at)::INTEGER 
          WHERE "order" = 0 OR "order" IS NULL
        `;
      } catch (error) {
        // Column might already exist, ignore error
        console.log('Order column migration info:', error);
      }
      console.log('Reminders database table initialized successfully');
    } catch (error) {
      console.error('Error initializing reminders database:', error);
      throw error;
    }
  }

  static async getAllReminders(): Promise<Reminder[]> {
    const result = await sql`
      SELECT 
        id, 
        title, 
        due_date, 
        "order",
        created_at, 
        updated_at 
      FROM reminders 
      ORDER BY due_date ASC, "order" ASC, created_at DESC
    `;
    
    // Calculate days remaining in JavaScript
    return result.map(row => ({
      ...row,
      days_remaining: this.calculateDaysRemaining(row.due_date)
    })) as Reminder[];
  }

  static async getReminderById(id: string): Promise<Reminder | null> {
    const result = await sql`
      SELECT 
        id, 
        title, 
        due_date, 
        "order",
        created_at, 
        updated_at 
      FROM reminders 
      WHERE id = ${id}
    `;
    
    if (!result[0]) return null;
    
    return {
      ...result[0],
      days_remaining: this.calculateDaysRemaining(result[0].due_date)
    } as Reminder;
  }

  static async createReminder(input: CreateReminderInput): Promise<Reminder> {
    // Get the maximum order value to place new reminder at the end
    const maxOrderResult = await sql`
      SELECT COALESCE(MAX("order"), 0) + 1 as next_order FROM reminders
    `;
    const nextOrder = maxOrderResult[0]?.next_order || 1;
    
    const result = await sql`
      INSERT INTO reminders (title, due_date, "order")
      VALUES (${input.title}, ${input.due_date}::DATE, ${nextOrder})
      RETURNING 
        id, 
        title, 
        due_date, 
        "order",
        created_at, 
        updated_at
    `;
    
    return {
      ...result[0],
      days_remaining: this.calculateDaysRemaining(result[0].due_date)
    } as Reminder;
  }

  static async updateReminder(id: string, input: UpdateReminderInput): Promise<Reminder | null> {
    // If no updates provided, return the existing reminder
    if (Object.keys(input).length === 0) {
      return await this.getReminderById(id);
    }

    const currentReminder = await this.getReminderById(id);
    if (!currentReminder) return null;

    const result = await sql`
      UPDATE reminders 
      SET 
        title = ${input.title ?? currentReminder.title}, 
        due_date = ${input.due_date ? sql`${input.due_date}::DATE` : sql`due_date`}, 
        "order" = ${input.order ?? currentReminder.order},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id, 
        title, 
        due_date, 
        "order",
        created_at, 
        updated_at
    `;
    
    if (!result[0]) return null;
    
    return {
      ...result[0],
      days_remaining: this.calculateDaysRemaining(result[0].due_date)
    } as Reminder;
  }

  static async deleteReminder(id: string): Promise<boolean> {
    try {
      const existingReminder = await this.getReminderById(id);
      if (!existingReminder) {
        return false;
      }
      
      await sql`
        DELETE FROM reminders WHERE id = ${id}
      `;
      
      const reminderAfterDelete = await this.getReminderById(id);
      return reminderAfterDelete === null;
    } catch (error) {
      console.error('Error in deleteReminder:', error);
      throw error;
    }
  }

  static async reorderReminders(reminderOrders: { id: string; order: number }[]): Promise<void> {
    try {
      for (const { id, order } of reminderOrders) {
        await sql`
          UPDATE reminders 
          SET "order" = ${order}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }
    } catch (error) {
      console.error('Error reordering reminders:', error);
      throw error;
    }
  }
}

export class FundService {
  // Initialize the database table if it doesn't exist
  static async initializeDatabase(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS funds (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          price TEXT NOT NULL,
          "order" INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Add order column if it doesn't exist (for existing databases)
      try {
        await sql`
          ALTER TABLE funds ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0
        `;
        
        // Set order for existing funds if they don't have it
        await sql`
          UPDATE funds 
          SET "order" = EXTRACT(EPOCH FROM created_at)::INTEGER 
          WHERE "order" = 0 OR "order" IS NULL
        `;
      } catch (error) {
        // Column might already exist, ignore error
        console.log('Order column migration info:', error);
      }
      console.log('Funds database table initialized successfully');
    } catch (error) {
      console.error('Error initializing funds database:', error);
      throw error;
    }
  }

  static async getAllFunds(): Promise<Fund[]> {
    const result = await sql`
      SELECT * FROM funds 
      ORDER BY "order" ASC, created_at DESC
    `;
    return result as Fund[];
  }

  static async getFundById(id: string): Promise<Fund | null> {
    const result = await sql`
      SELECT * FROM funds WHERE id = ${id}
    `;
    return result[0] as Fund || null;
  }

  static async createFund(input: CreateFundInput): Promise<Fund> {
    // Get the maximum order value to place new fund at the end
    const maxOrderResult = await sql`
      SELECT COALESCE(MAX("order"), 0) + 1 as next_order FROM funds
    `;
    const nextOrder = maxOrderResult[0]?.next_order || 1;
    
    const result = await sql`
      INSERT INTO funds (title, price, "order")
      VALUES (${input.title}, ${input.price}, ${nextOrder})
      RETURNING *
    `;
    return result[0] as Fund;
  }

  static async updateFund(id: string, input: UpdateFundInput): Promise<Fund | null> {
    // If no updates provided, return the existing fund
    if (Object.keys(input).length === 0) {
      return await this.getFundById(id);
    }

    const currentFund = await this.getFundById(id);
    if (!currentFund) return null;

    const result = await sql`
      UPDATE funds 
      SET 
        title = ${input.title ?? currentFund.title}, 
        price = ${input.price ?? currentFund.price}, 
        "order" = ${input.order ?? currentFund.order},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] as Fund || null;
  }

  static async deleteFund(id: string): Promise<boolean> {
    try {
      const existingFund = await this.getFundById(id);
      if (!existingFund) {
        return false;
      }
      
      await sql`
        DELETE FROM funds WHERE id = ${id}
      `;
      
      const fundAfterDelete = await this.getFundById(id);
      return fundAfterDelete === null;
    } catch (error) {
      console.error('Error in deleteFund:', error);
      throw error;
    }
  }

  static async reorderFunds(fundOrders: { id: string; order: number }[]): Promise<void> {
    try {
      for (const { id, order } of fundOrders) {
        await sql`
          UPDATE funds 
          SET "order" = ${order}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }
    } catch (error) {
      console.error('Error reordering funds:', error);
      throw error;
    }
  }
}

export class GoalService {
  // Initialize the database table if it doesn't exist
  static async initializeDatabase(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS goals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          target_date DATE,
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          "order" INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Add order column if it doesn't exist (for existing databases)
      try {
        await sql`
          ALTER TABLE goals ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0
        `;
        
        // Set order for existing goals if they don't have it
        await sql`
          UPDATE goals 
          SET "order" = EXTRACT(EPOCH FROM created_at)::INTEGER 
          WHERE "order" = 0 OR "order" IS NULL
        `;
      } catch (error) {
        // Column might already exist, ignore error
        console.log('Order column migration info:', error);
      }
      console.log('Goals database table initialized successfully');
    } catch (error) {
      console.error('Error initializing goals database:', error);
      throw error;
    }
  }

  static async getAllGoals(): Promise<Goal[]> {
    const result = await sql`
      SELECT * FROM goals 
      ORDER BY "order" ASC, created_at DESC
    `;
    return result as Goal[];
  }

  static async getGoalById(id: string): Promise<Goal | null> {
    const result = await sql`
      SELECT * FROM goals WHERE id = ${id}
    `;
    return result[0] as Goal || null;
  }

  static async createGoal(input: CreateGoalInput): Promise<Goal> {
    // Get the maximum order value to place new goal at the end
    const maxOrderResult = await sql`
      SELECT COALESCE(MAX("order"), 0) + 1 as next_order FROM goals
    `;
    const nextOrder = maxOrderResult[0]?.next_order || 1;
    
    const result = await sql`
      INSERT INTO goals (title, description, target_date, priority, "order")
      VALUES (
        ${input.title}, 
        ${input.description || null}, 
        ${input.target_date ? sql`${input.target_date}::DATE` : sql`NULL`}, 
        ${input.priority || 'medium'}, 
        ${nextOrder}
      )
      RETURNING *
    `;
    return result[0] as Goal;
  }

  static async updateGoal(id: string, input: UpdateGoalInput): Promise<Goal | null> {
    // If no updates provided, return the existing goal
    if (Object.keys(input).length === 0) {
      return await this.getGoalById(id);
    }

    const currentGoal = await this.getGoalById(id);
    if (!currentGoal) return null;

    const result = await sql`
      UPDATE goals 
      SET 
        title = ${input.title ?? currentGoal.title}, 
        description = ${input.description ?? currentGoal.description}, 
        target_date = ${input.target_date ? sql`${input.target_date}::DATE` : sql`${currentGoal.target_date}`}, 
        priority = ${input.priority ?? currentGoal.priority}, 
        "order" = ${input.order ?? currentGoal.order},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] as Goal || null;
  }

  static async deleteGoal(id: string): Promise<boolean> {
    try {
      const existingGoal = await this.getGoalById(id);
      if (!existingGoal) {
        return false;
      }
      
      await sql`
        DELETE FROM goals WHERE id = ${id}
      `;
      
      const goalAfterDelete = await this.getGoalById(id);
      return goalAfterDelete === null;
    } catch (error) {
      console.error('Error in deleteGoal:', error);
      throw error;
    }
  }

  static async reorderGoals(goalOrders: { id: string; order: number }[]): Promise<void> {
    try {
      for (const { id, order } of goalOrders) {
        await sql`
          UPDATE goals 
          SET "order" = ${order}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }
    } catch (error) {
      console.error('Error reordering goals:', error);
      throw error;
    }
  }
}
