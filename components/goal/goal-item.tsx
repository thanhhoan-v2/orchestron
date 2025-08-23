"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Goal, UpdateGoalInput } from "@/lib/db";
import { CalendarIcon, XIcon } from "lucide-react";
import { useState } from "react";

interface GoalItemProps {
	goal: Goal;
	onUpdate: (id: string, updates: Partial<Goal>) => void;
	onDelete: (id: string) => void;
	onMoveUp: (goalId: string) => void;
	onMoveDown: (goalId: string) => void;
	loading?: boolean;
	deleting?: boolean;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
}

export function GoalItem({
	goal,
	onUpdate,
	onDelete,
	onMoveUp,
	onMoveDown,
	loading = false,
	deleting = false,
	canMoveUp = false,
	canMoveDown = false,
}: GoalItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(goal.title);
	const [editDescription, setEditDescription] = useState(
		goal.description || ""
	);
	const [editTargetDate, setEditTargetDate] = useState(goal.target_date || "");

	const handleSave = () => {
		const updates: UpdateGoalInput = {
			title: editTitle.trim(),
			description: editDescription.trim() || undefined,
			target_date: editTargetDate || undefined,
		};

		onUpdate(goal.id, updates);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditTitle(goal.title);
		setEditDescription(goal.description || "");
		setEditTargetDate(goal.target_date || "");
		setIsEditing(false);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	const getRemainingDaysText = (dateString: string) => {
		if (!dateString) return "";
		const target = new Date(dateString);
		const today = new Date();
		// Normalize to midnight to avoid time-of-day drift
		today.setHours(0, 0, 0, 0);
		target.setHours(0, 0, 0, 0);
		const msPerDay = 1000 * 60 * 60 * 24;
		const diffDays = Math.round(
			(target.getTime() - today.getTime()) / msPerDay
		);
		if (diffDays === 0) return "Due today";
		if (diffDays > 0)
			return `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
		const overdue = Math.abs(diffDays);
		return `${overdue} day${overdue === 1 ? "" : "s"} overdue`;
	};

	if (isEditing) {
		return (
			<Card className="border-2 border-blue-200">
				<CardContent className="pt-6">
					<div className="space-y-4">
						<div>
							<Label htmlFor={`edit-title-${goal.id}`}>Title *</Label>
							<Input
								id={`edit-title-${goal.id}`}
								value={editTitle}
								onChange={(e) => setEditTitle(e.target.value)}
								placeholder="Goal title..."
								required
							/>
						</div>

						<div>
							<Label htmlFor={`edit-description-${goal.id}`}>Description</Label>
							<Textarea
								id={`edit-description-${goal.id}`}
								value={editDescription}
								onChange={(e) => setEditDescription(e.target.value)}
								placeholder="Description..."
								className="min-h-[80px]"
							/>
						</div>

						<div className="gap-4 grid grid-cols-2">
							<div>
								<Label htmlFor={`edit-target-date-${goal.id}`}>
									Target Date
								</Label>
								<Input
									id={`edit-target-date-${goal.id}`}
									type="date"
									value={editTargetDate}
									onChange={(e) => setEditTargetDate(e.target.value)}
								/>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={handleSave}
								disabled={!editTitle.trim() || loading}
								size="sm"
							>
								Save
							</Button>
							<Button onClick={handleCancel} variant="outline" size="sm">
								Cancel
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="group hover:shadow-md transition-shadow">
			<div>
				<div className="flex justify-between items-center">
					<div className="flex-1 min-w-0">
						<div className="font-bold text-lg truncate">{goal.title}</div>
						<div className="flex items-center gap-2">
							{goal.target_date && (
								<Badge variant="outline" className="flex items-center gap-1">
									<CalendarIcon className="size-4" />
									{formatDate(goal.target_date)}
								</Badge>
							)}
							{goal.target_date && (
								<Badge variant="outline" className="flex items-center gap-1">
									{getRemainingDaysText(goal.target_date)}
								</Badge>
							)}
						</div>
					</div>
					<div>
						<Button
							onClick={() => onDelete(goal.id)}
							variant="outline"
							size="icon"
						>
							<XIcon className="size-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
