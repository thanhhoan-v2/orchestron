import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateTodoSessionInput, CreateTodoStringInput, TodoSession, TodoString, UpdateTodoSessionInput, UpdateTodoStringInput } from "../db";

// Query keys for consistent cache management
export const TODOS_QUERY_KEY = ["todoString"] as const;
export const TODO_SESSIONS_QUERY_KEY = ["todoSessions"] as const;

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

// Todo Sessions Hooks

// Fetch all todo sessions
export function useTodoSessions() {
	return useQuery({
		queryKey: TODO_SESSIONS_QUERY_KEY,
		queryFn: async (): Promise<TodoSession[]> => {
			const response = await fetch("/api/todo-sessions");
			if (!response.ok) {
				throw new Error("Failed to fetch todo sessions");
			}
			return response.json();
		},
	});
}

// Create todo session mutation
export function useCreateTodoSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateTodoSessionInput): Promise<TodoSession> => {
			const response = await fetch("/api/todo-sessions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to create todo session");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch sessions after successful creation
			queryClient.invalidateQueries({ queryKey: TODO_SESSIONS_QUERY_KEY });
		},
	});
}

// Update todo session mutation
export function useUpdateTodoSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			input,
		}: {
			id: string;
			input: UpdateTodoSessionInput;
		}): Promise<TodoSession> => {
			const response = await fetch(`/api/todo-sessions/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to update todo session");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch sessions after successful update
			queryClient.invalidateQueries({ queryKey: TODO_SESSIONS_QUERY_KEY });
		},
	});
}

// Delete todo session mutation
export function useDeleteTodoSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<{ success: boolean }> => {
			const response = await fetch(`/api/todo-sessions/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete todo session");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch sessions after successful deletion
			queryClient.invalidateQueries({ queryKey: TODO_SESSIONS_QUERY_KEY });
		},
	});
}

// Load session content into current todos
export function useLoadTodoSession() {
	const createOrUpdateTodoStringMutation = useCreateOrUpdateTodoString();

	return useMutation({
		mutationFn: async (session: TodoSession): Promise<TodoSession> => {
			// Update the current todo string with the session content
			await createOrUpdateTodoStringMutation.mutateAsync({ content: session.content });
			return session;
		},
	});
}
