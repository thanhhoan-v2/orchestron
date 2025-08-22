import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateGoalInput, Goal, UpdateGoalInput } from "../db";

// Query keys for consistent cache management
export const GOALS_QUERY_KEY = ["goals"] as const;

// Fetch all goals
export function useGoals() {
	return useQuery({
		queryKey: GOALS_QUERY_KEY,
		queryFn: async (): Promise<Goal[]> => {
			const response = await fetch("/api/goals");
			if (!response.ok) {
				throw new Error("Failed to fetch goals");
			}
			return response.json();
		},
	});
}

// Create goal mutation
export function useCreateGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateGoalInput): Promise<Goal> => {
			const response = await fetch("/api/goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to create goal");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch goals after successful creation
			queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
		},
	});
}

// Update goal mutation
export function useUpdateGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			updates,
		}: {
			id: string;
			updates: UpdateGoalInput;
		}): Promise<Goal> => {
			const response = await fetch(`/api/goals/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update goal");
			}

			return response.json();
		},
		onMutate: async ({ id, updates }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: GOALS_QUERY_KEY });

			// Snapshot the previous value
			const previousGoals = queryClient.getQueryData<Goal[]>(GOALS_QUERY_KEY);

			// Optimistically update to the new value
			if (previousGoals) {
				queryClient.setQueryData<Goal[]>(GOALS_QUERY_KEY, (old) =>
					old ? old.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)) : []
				);
			}

			// Return a context object with the snapshotted value
			return { previousGoals };
		},
		onError: (err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousGoals) {
				queryClient.setQueryData(GOALS_QUERY_KEY, context.previousGoals);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
		},
	});
}

// Delete goal mutation
export function useDeleteGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			const response = await fetch(`/api/goals/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete goal");
			}
		},
		onMutate: async (id) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: GOALS_QUERY_KEY });

			// Snapshot the previous value
			const previousGoals = queryClient.getQueryData<Goal[]>(GOALS_QUERY_KEY);

			// Optimistically remove the goal
			if (previousGoals) {
				queryClient.setQueryData<Goal[]>(GOALS_QUERY_KEY, (old) =>
					old ? old.filter((goal) => goal.id !== id) : []
				);
			}

			// Return a context object with the snapshotted value
			return { previousGoals };
		},
		onError: (err, id, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousGoals) {
				queryClient.setQueryData(GOALS_QUERY_KEY, context.previousGoals);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
		},
	});
}

// Reorder goals mutation
export function useReorderGoals() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (goalOrders: { id: string; order: number }[]): Promise<void> => {
			const response = await fetch("/api/goals/reorder", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ goalOrders }),
			});

			if (!response.ok) {
				throw new Error("Failed to reorder goals");
			}
		},
		onMutate: async (goalOrders) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: GOALS_QUERY_KEY });

			// Snapshot the previous value
			const previousGoals = queryClient.getQueryData<Goal[]>(GOALS_QUERY_KEY);

			// Optimistically update the order
			if (previousGoals) {
				queryClient.setQueryData<Goal[]>(GOALS_QUERY_KEY, (old) => {
					if (!old) return [];
					
					return old.map((goal) => {
						const orderUpdate = goalOrders.find((g) => g.id === goal.id);
						return orderUpdate ? { ...goal, order: orderUpdate.order } : goal;
					}).sort((a, b) => a.order - b.order);
				});
			}

			// Return a context object with the snapshotted value
			return { previousGoals };
		},
		onError: (err, goalOrders, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousGoals) {
				queryClient.setQueryData(GOALS_QUERY_KEY, context.previousGoals);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
		},
	});
}
