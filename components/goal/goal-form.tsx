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
	const [amount, setAmount] = useState("");
	const [progress, setProgress] = useState("0");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		onSubmit({
			title: title.trim(),
			description: description.trim() || undefined,
			target_date: targetDate || undefined,
			amount: amount || undefined,
			progress: progress || "0",
		});

		// Reset form
		setTitle("");
		setDescription("");
		setTargetDate("");
		setAmount("");
		setProgress("0");
	};

	return (
		<Dialog>
			<VisuallyHidden>
				<DialogTitle>New Goal</DialogTitle>
			</VisuallyHidden>
			<DialogTrigger asChild>
				<div className="flex justify-between items-end pb-2 border-b-2">
					<h2 className="font-bold text-xl">Goals</h2>
					<Button variant="ghost">
						<PlusIcon className="size-4" />
					</Button>
				</div>
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
						<Label htmlFor="amount">Total Target (Optional)</Label>
						<Input
							id="amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="e.g., 150"
							min="0"
							step="1"
						/>
					</div>

					<div>
						<Label htmlFor="progress">Current Progress</Label>
						<Input
							id="progress"
							type="number"
							value={progress}
							onChange={(e) => setProgress(e.target.value)}
							placeholder="e.g., 42"
							min="0"
							step="1"
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
