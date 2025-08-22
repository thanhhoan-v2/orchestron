"use client";

import { Goal } from "@/lib/db";
import {
	useCreateGoal,
	useDeleteGoal,
	useGoals,
	useReorderGoals,
	useUpdateGoal,
} from "@/lib/hooks/use-goals";
import { RefreshCw, Target } from "lucide-react";
import { useState } from "react";
import { GoalForm } from "./goal-form";
import { GoalItem } from "./goal-item";

type FilterType = "all" | "high" | "medium" | "low";

export function GoalList() {
	const [filter, setFilter] = useState<FilterType>("all");
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	// React Query hooks
	const { data: goals = [], isLoading } = useGoals();
	const createGoalMutation = useCreateGoal();
	const updateGoalMutation = useUpdateGoal();
	const deleteGoalMutation = useDeleteGoal();
	const reorderGoalsMutation = useReorderGoals();

	const handleCreateGoal = async (goalData: {
		title: string;
		description?: string;
		target_date?: string;
		priority?: "low" | "medium" | "high";
	}) => {
		createGoalMutation.mutate(goalData);
	};

	const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
		updateGoalMutation.mutate({ id, updates });
	};

	const handleDeleteGoal = async (id: string) => {
		// Prevent multiple delete attempts
		if (deletingIds.has(id)) return;

		// Mark as deleting
		setDeletingIds((prev) => new Set(prev).add(id));

		deleteGoalMutation.mutate(id, {
			onSettled: () => {
				// Remove from deleting set regardless of success or failure
				setDeletingIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(id);
					return newSet;
				});
			},
		});
	};

	const handleMoveUp = async (goalId: string) => {
		const currentIndex = filteredGoals.findIndex((goal) => goal.id === goalId);
		if (currentIndex <= 0) return; // Already at top or not found

		const currentGoal = filteredGoals[currentIndex];
		const previousGoal = filteredGoals[currentIndex - 1];

		// Swap the order values between the two goals
		const goalOrders = [
			{ id: currentGoal.id, order: previousGoal.order },
			{ id: previousGoal.id, order: currentGoal.order },
		];

		reorderGoalsMutation.mutate(goalOrders);
	};

	const handleMoveDown = async (goalId: string) => {
		const currentIndex = filteredGoals.findIndex((goal) => goal.id === goalId);
		if (currentIndex >= filteredGoals.length - 1 || currentIndex === -1) return; // Already at bottom or not found

		const currentGoal = filteredGoals[currentIndex];
		const nextGoal = filteredGoals[currentIndex + 1];

		// Swap the order values between the two goals
		const goalOrders = [
			{ id: currentGoal.id, order: nextGoal.order },
			{ id: nextGoal.id, order: currentGoal.order },
		];

		reorderGoalsMutation.mutate(goalOrders);
	};

	const filteredGoals = goals.filter((goal) => {
		switch (filter) {
			case "high":
				return goal.priority === "high";
			case "medium":
				return goal.priority === "medium";
			case "low":
				return goal.priority === "low";
			default:
				return true;
		}
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center w-full min-h-[400px]">
				<div className="flex flex-col justify-center items-center gap-3 p-8">
					<RefreshCw className="size-6 animate-spin" />
					<p>Loading goals</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 mx-auto p-5 w-full h-[50vh]">
			{/* Create Goal Form */}
			<GoalForm
				onSubmit={handleCreateGoal}
				loading={createGoalMutation.isPending}
			/>

			{/* Goals List */}
			<div className="space-y-4 max-h-[800px] overflow-y-auto">
				{filteredGoals.length === 0 ? (
					<div>
						<div className="p-8 text-center">
							<div className="space-y-2">
								<Target className="mx-auto w-12 h-12 text-muted-foreground" />
								<h3 className="font-medium text-lg">No goals found</h3>
								<p className="text-muted-foreground">
									{filter === "all"
										? "Create your first goal to get started!"
										: `No ${filter} priority goals at the moment.`}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						{filteredGoals.map((goal, index) => (
							<GoalItem
								key={goal.id}
								goal={goal}
								onUpdate={handleUpdateGoal}
								onDelete={handleDeleteGoal}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
								loading={updateGoalMutation.isPending}
								deleting={deletingIds.has(goal.id)}
								canMoveUp={index > 0}
								canMoveDown={index < filteredGoals.length - 1}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
