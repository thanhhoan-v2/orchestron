"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Goal, UpdateGoalInput } from "@/lib/db";
import { CalendarIcon, PenIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

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
	const [isHovered, setIsHovered] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editTitle, setEditTitle] = useState(goal.title);
	const [editDescription, setEditDescription] = useState(
		goal.description || ""
	);
	const [editTargetDate, setEditTargetDate] = useState(goal.target_date || "");
	const [editAmount, setEditAmount] = useState(goal.amount || "");
	const [editProgress, setEditProgress] = useState(goal.progress || "0");

	// Calculate progress percentage for goals with amount
	const calculateProgress = () => {
		if (!goal.amount) return 0;

		const currentProgress = parseFloat(goal.progress || "0");
		const targetAmount = parseFloat(goal.amount);

		if (isNaN(currentProgress) || isNaN(targetAmount) || targetAmount === 0)
			return 0;

		const progress = (currentProgress / targetAmount) * 100;
		return Math.min(progress, 100); // Cap at 100%
	};

	const getProgressColor = (progress: number) => {
		if (progress >= 100) return "bg-green-500";
		if (progress >= 75) return "bg-blue-500";
		if (progress >= 50) return "bg-yellow-500";
		if (progress >= 25) return "bg-orange-500";
		return "bg-gray-300";
	};

	const progress = calculateProgress();
	const progressColor = getProgressColor(progress);

	const handleSave = () => {
		const updates: UpdateGoalInput = {
			title: editTitle.trim(),
			description: editDescription.trim() || undefined,
			target_date: editTargetDate || undefined,
			amount: editAmount || undefined,
			progress: editProgress || "0",
		};

		onUpdate(goal.id, updates);
		setIsEditDialogOpen(false);
	};

	const handleCancel = () => {
		setEditTitle(goal.title);
		setEditDescription(goal.description || "");
		setEditTargetDate(goal.target_date || "");
		setEditAmount(goal.amount || "");
		setEditProgress(goal.progress || "0");
		setIsEditDialogOpen(false);
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

	// Reset form when dialog opens
	const handleEditClick = () => {
		setEditTitle(goal.title);
		setEditDescription(goal.description || "");
		setEditTargetDate(goal.target_date || "");
		setEditAmount(goal.amount || "");
		setEditProgress(goal.progress || "0");
		setIsEditDialogOpen(true);
	};

	return (
		<Card
			className="pb-2 transition-all duration-200"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<CardContent className="px-5">
				<div className="flex flex-col">
					<div className="flex-1 min-w-0">
						<div className="flex justify-between items-center gap-2 mb-2">
							<h3 className="font-bold text-lg truncate">{goal.title}</h3>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									className="p-0 w-8 h-8"
									onClick={handleEditClick}
								>
									<PenIcon className="w-3 h-3" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="p-0 w-8 h-8"
									onClick={() => onDelete(goal.id)}
								>
									<XIcon className="w-3 h-3" />
								</Button>
							</div>
						</div>

						{/* Progress Display */}
						{goal.amount && (
							<div className="flex items-center gap-1 mb-2 text-muted-foreground text-xs">
								<span className="font-mono font-semibold text-green-600 dark:text-green-400 text-base">
									{goal.progress || "0"}/{goal.amount}
								</span>
							</div>
						)}

						{/* Progress Bar */}
						{goal.amount && (
							<div className="space-y-2 mt-3">
								<div className="flex justify-between items-center text-xs">
									<span className="text-muted-foreground">Progress</span>
									<span className="font-medium">{progress.toFixed(1)}%</span>
								</div>
								<div className="bg-gray-200 dark:bg-gray-700 rounded-full w-full h-2">
									<div
										className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
										style={{ width: `${progress}%` }}
									></div>
								</div>
								<div className="flex justify-between items-center text-muted-foreground text-xs">
									<span>
										{progress >= 100
											? "Goal reached! 🎉"
											: `${Math.max(
													0,
													parseInt(goal.amount) - parseInt(goal.progress || "0")
											  )} to go`}
									</span>
								</div>
							</div>
						)}

						{/* Date Badges */}
						<div className="flex items-center gap-2 mt-3">
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

					{/* Actions */}
					<div
						className={`flex gap-1 items-end transition-opacity duration-200 ${
							isHovered ? "opacity-100" : "opacity-0"
						}`}
					>
						{/* Action buttons are now in the header, so this section is for future use */}
					</div>
				</div>
			</CardContent>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogTitle>Edit Goal</DialogTitle>
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
							<div>
								<Label htmlFor={`edit-amount-${goal.id}`}>Total Target</Label>
								<Input
									id={`edit-amount-${goal.id}`}
									type="number"
									value={editAmount}
									onChange={(e) => setEditAmount(e.target.value)}
									placeholder="e.g., 150"
									min="0"
									step="1"
								/>
							</div>
						</div>

						<div>
							<Label htmlFor={`edit-progress-${goal.id}`}>
								Current Progress
							</Label>
							<Input
								id={`edit-progress-${goal.id}`}
								type="number"
								value={editProgress}
								onChange={(e) => setEditProgress(e.target.value)}
								placeholder="e.g., 42"
								min="0"
								step="1"
							/>
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
				</DialogContent>
			</Dialog>
		</Card>
	);
}
