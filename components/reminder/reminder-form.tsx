"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useState } from "react";

interface ReminderFormProps {
	onSubmit: (reminder: { title: string; due_date: string }) => void;
	loading?: boolean;
}

export function ReminderForm({ onSubmit, loading }: ReminderFormProps) {
	const [title, setTitle] = useState("");
	const [date, setDate] = useState<Date>();
	const [isOpen, setIsOpen] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !date) return;

		onSubmit({
			title: title.trim(),
			due_date: format(date, "yyyy-MM-dd"),
		});

		// Reset form
		setTitle("");
		setDate(undefined);
		setIsOpen(false);
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			// Reset form when dialog closes
			setTitle("");
			setDate(undefined);
		}
	};

	return (
		<div className="flex justify-between items-end pb-2 border-b-2">
			<h2 className="font-bold text-xl">Reminders</h2>
			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<Button variant="ghost">
						<Plus className="w-4 h-4" />
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create New Reminder</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Input
								placeholder="Reminder title..."
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="text-lg"
								required
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
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
							>
								Cancel
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
