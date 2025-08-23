"use client";

import { BookmarkForm } from "@/components/bookmark/bookmark-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateBookmark } from "@/lib/hooks/use-bookmarks";
import { useCreateReminder } from "@/lib/hooks/use-reminders";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface QuickCreateModalsProps {
  bookmarkOpen: boolean;
  reminderOpen: boolean;
  onBookmarkOpenChange: (open: boolean) => void;
  onReminderOpenChange: (open: boolean) => void;
}

export function QuickCreateModals({
  bookmarkOpen,
  reminderOpen,
  onBookmarkOpenChange,
  onReminderOpenChange,
}: QuickCreateModalsProps) {
  const createBookmark = useCreateBookmark();
  const createReminder = useCreateReminder();

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
