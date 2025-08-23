"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

interface TodoFormProps {
	onSubmit: (todo: { title: string; description?: string }) => void;
	loading?: boolean;
}

export function TodoForm({ onSubmit, loading }: TodoFormProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		onSubmit({
			title: title.trim(),
			description: description.trim() || undefined,
		});

		// Reset form
		setTitle("");
		setDescription("");
		setIsOpen(false);
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			// Reset form when dialog closes
			setTitle("");
			setDescription("");
		}
	};

	return (
		<div className="flex justify-between items-end pb-2 border-b-2">
			<h2 className="font-bold text-xl">Todos</h2>
			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<Button variant="outline">
						<Plus className="size-4" />
						Add Todo
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create New Todo</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Input
								placeholder="Todo title..."
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="text-lg"
								required
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

						<div className="flex gap-2 pt-4">
							<Button
								type="submit"
								disabled={!title.trim() || loading}
								className="flex-1"
							>
								{loading ? "Creating..." : "Create Todo"}
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
