"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Todo } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	PenIcon,
	RefreshCw,
	Save,
	X,
	XIcon,
} from "lucide-react";
import { useState } from "react";

interface TodoItemProps {
	todo: Todo;
	onUpdate: (id: string, updates: Partial<Todo>) => void;
	onDelete: (id: string) => void;
	onToggle: (id: string) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
	loading?: boolean;
	deleting?: boolean;
	canMoveUp: boolean;
	canMoveDown: boolean;
}

export function TodoItem({
	todo,
	onUpdate,
	onDelete,
	onToggle,
	onMoveUp,
	onMoveDown,
	loading,
	deleting,
	canMoveUp,
	canMoveDown,
}: TodoItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(todo.title);
	const [editDescription, setEditDescription] = useState(
		todo.description || ""
	);

	const handleSave = () => {
		onUpdate(todo.id, {
			title: editTitle.trim(),
			description: editDescription.trim() || undefined,
		});
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditTitle(todo.title);
		setEditDescription(todo.description || "");
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<Card className="w-full">
				<CardContent className="p-4">
					<div className="space-y-3">
						<Input
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
							className="font-medium text-lg"
						/>

						<Textarea
							value={editDescription}
							onChange={(e) => setEditDescription(e.target.value)}
							placeholder="Description..."
							className="min-h-[80px]"
						/>

						<div className="flex gap-2">
							<Button
								onClick={handleSave}
								disabled={!editTitle.trim() || loading}
								size="sm"
							>
								<Save className="mr-1 w-4 h-4" />
								Save
							</Button>
							<Button onClick={handleCancel} variant="outline" size="sm">
								<X className="mr-1 w-4 h-4" />
								Cancel
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={cn(
				"w-full transition-all hover:shadow-md",
				todo.completed && "opacity-75"
			)}
		>
			<CardContent>
				<div className="flex items-center gap-3">
					<div className="flex justify-between gap-2 w-full">
						<div className="flex flex-col gap-2">
							<div className="flex flex-1 items-center gap-2 min-w-0">
								<Checkbox
									checked={todo.completed}
									onCheckedChange={() => onToggle(todo.id)}
									disabled={loading}
								/>
								<h3
									className={cn(
										"font-medium text-lg leading-tight",
										todo.completed && "line-through text-muted-foreground"
									)}
								>
									{todo.title}
								</h3>
							</div>
							<div>
								{todo.description && (
									<p
										className={cn(
											"text-sm text-muted-foreground whitespace-pre",
											todo.completed && "line-through"
										)}
									>
										{todo.description}
									</p>
								)}
							</div>
						</div>

						<div className="flex gap-2">
							<div className="flex gap-2 border h-fit">
								<Button
									variant="ghost"
									size="sm"
									className="p-0 w-8 h-8"
									onClick={() => onMoveDown(todo.id)}
									disabled={!canMoveDown || loading}
								>
									<ChevronDownIcon className="w-4 h-4" />
								</Button>

								<Button
									variant="ghost"
									size="sm"
									className="p-0 w-8 h-8"
									onClick={() => onMoveUp(todo.id)}
									disabled={!canMoveUp || loading}
								>
									<ChevronUpIcon className="w-4 h-4" />
								</Button>
							</div>

							<div className="flex gap-2 border h-fit">
								<Button
									variant="ghost"
									size="sm"
									className="p-0 w-8 h-8"
									onClick={() => setIsEditing(true)}
								>
									<PenIcon className="w-4 h-4" />
								</Button>

								<Button
									variant="ghost"
									size="sm"
									className="p-0 w-8 h-8"
									onClick={() => onDelete(todo.id)}
									disabled={deleting || loading}
								>
									{deleting ? (
										<RefreshCw className="w-4 h-4 animate-spin" />
									) : (
										<XIcon className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
