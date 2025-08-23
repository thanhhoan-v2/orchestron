import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateTodoStringInput, TodoString, UpdateTodoStringInput } from "../db";

// Query keys for consistent cache management
export const TODOS_QUERY_KEY = ["todoString"] as const;

// Fetch the todo string
export function useTodoString() {
	return useQuery({
		queryKey: TODOS_QUERY_KEY,
		queryFn: async (): Promise<TodoString | null> => {
			const response = await fetch("/api/todos");
			if (!response.ok) {
				throw new Error("Failed to fetch todo string");
			}
			return response.json();
		},
	});
}

// Create or update todo string mutation
export function useCreateOrUpdateTodoString() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateTodoStringInput): Promise<TodoString> => {
			const response = await fetch("/api/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to create or update todo string");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch todo string after successful creation/update
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});
}

// Update todo string mutation
export function useUpdateTodoString() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			input,
		}: {
			id: string;
			input: UpdateTodoStringInput;
		}): Promise<TodoString> => {
			const response = await fetch(`/api/todos/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to update todo string");
			}

			return response.json();
		},
		onMutate: async ({ id, input }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

			// Snapshot the previous value
			const previousTodoString = queryClient.getQueryData<TodoString>(TODOS_QUERY_KEY);

			// Optimistically update to the new value
			if (previousTodoString) {
				queryClient.setQueryData<TodoString>(TODOS_QUERY_KEY, (old) =>
					old ? { ...old, content: input.content, updated_at: new Date().toISOString() } : undefined
				);
			}

			// Return a context object with the snapshotted value
			return { previousTodoString };
		},
		onError: (err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousTodoString) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodoString);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});
}
