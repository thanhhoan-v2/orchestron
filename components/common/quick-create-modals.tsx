"use client";

import { BookmarkForm } from "@/components/bookmark/bookmark-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBookmark } from "@/lib/hooks/use-bookmarks";
import { useCreateReminder } from "@/lib/hooks/use-reminders";
import { useCreateTodo } from "@/lib/hooks/use-todos";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface QuickCreateModalsProps {
  todoOpen: boolean;
  bookmarkOpen: boolean;
  reminderOpen: boolean;
  onTodoOpenChange: (open: boolean) => void;
  onBookmarkOpenChange: (open: boolean) => void;
  onReminderOpenChange: (open: boolean) => void;
}

export function QuickCreateModals({
  todoOpen,
  bookmarkOpen,
  reminderOpen,
  onTodoOpenChange,
  onBookmarkOpenChange,
  onReminderOpenChange,
}: QuickCreateModalsProps) {
  const createTodo = useCreateTodo();
  const createBookmark = useCreateBookmark();
  const createReminder = useCreateReminder();

  const handleCreateTodo = (todo: { title: string; description?: string }) => {
    createTodo.mutate(todo, {
      onSuccess: () => {
        onTodoOpenChange(false);
      },
    });
  };

  const handleCreateBookmark = (bookmark: {
    title: string;
    url?: string;
    description?: string;
    parent_id?: string;
    icon?: string;
    color?: string;
  }) => {
    createBookmark.mutate(bookmark, {
      onSuccess: () => {
        onBookmarkOpenChange(false);
      },
    });
  };

  const handleCreateReminder = (reminder: {
    title: string;
    due_date: string;
  }) => {
    createReminder.mutate(reminder, {
      onSuccess: () => {
        onReminderOpenChange(false);
      },
    });
  };

  return (
    <>
      {/* Quick Todo Creation Modal */}
      <Dialog open={todoOpen} onOpenChange={onTodoOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Create Todo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <QuickTodoForm
              onSubmit={handleCreateTodo}
              loading={createTodo.isPending}
              onCancel={() => onTodoOpenChange(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Bookmark Creation Modal */}
      <Dialog open={bookmarkOpen} onOpenChange={onBookmarkOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Create Bookmark</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <BookmarkForm
              onSubmit={handleCreateBookmark}
              loading={createBookmark.isPending}
              isDialogOpen={bookmarkOpen}
              onOpenChange={onBookmarkOpenChange}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Reminder Creation Modal */}
      <Dialog open={reminderOpen} onOpenChange={onReminderOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Create Reminder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <QuickReminderForm
              onSubmit={handleCreateReminder}
              loading={createReminder.isPending}
              onCancel={() => onReminderOpenChange(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick form components for modal use
interface QuickTodoFormProps {
  onSubmit: (todo: { title: string; description?: string }) => void;
  loading?: boolean;
  onCancel: () => void;
}

function QuickTodoForm({ onSubmit, loading, onCancel }: QuickTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
    });

    setTitle("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Todo title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg"
          required
          autoFocus
        />
      </div>
      
      <div>
        <Textarea
          placeholder="Description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!title.trim() || loading} className="flex-1">
          {loading ? "Creating..." : "Create Todo"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface QuickReminderFormProps {
  onSubmit: (reminder: { title: string; due_date: string }) => void;
  loading?: boolean;
  onCancel: () => void;
}

function QuickReminderForm({ onSubmit, loading, onCancel }: QuickReminderFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSubmit({
      title: title.trim(),
      due_date: format(date, "yyyy-MM-dd"),
    });

    setTitle("");
    setDate(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Reminder title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg"
          required
          autoFocus
        />
      </div>
      
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 w-4 h-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={!title.trim() || !date || loading} 
          className="flex-1"
        >
          {loading ? "Creating..." : "Create Reminder"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
