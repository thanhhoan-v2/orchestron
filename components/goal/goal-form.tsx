"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateGoalInput } from "@/lib/db";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

interface GoalFormProps {
	onSubmit: (goalData: CreateGoalInput) => void;
	loading?: boolean;
}

export function GoalForm({ onSubmit, loading = false }: GoalFormProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [targetDate, setTargetDate] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		onSubmit({
			title: title.trim(),
			description: description.trim() || undefined,
			target_date: targetDate || undefined,
		});

		// Reset form
		setTitle("");
		setDescription("");
		setTargetDate("");
	};

	return (
		<Dialog>
			<VisuallyHidden>
				<DialogTitle>New Goal</DialogTitle>
			</VisuallyHidden>
			<DialogTrigger asChild>
				<Button variant="ghost" className="mt-1 border-b-2 w-full">
					<PlusIcon />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="title">Title *</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="What do you want to achieve?"
							required
						/>
					</div>

					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="More details about your goal..."
							className="min-h-[80px]"
						/>
					</div>

					<div>
						<Label htmlFor="target-date">Target Date</Label>
						<Input
							id="target-date"
							type="date"
							value={targetDate}
							onChange={(e) => setTargetDate(e.target.value)}
						/>
					</div>

					<Button
						type="submit"
						disabled={!title.trim() || loading}
						className="w-full"
					>
						{loading ? "Adding..." : "Add Goal"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
