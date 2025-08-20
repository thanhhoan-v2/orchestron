import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateTodoInput, Todo, UpdateTodoInput } from "../db";

// Query keys for consistent cache management
export const TODOS_QUERY_KEY = ["todos"] as const;

// Fetch all todos
export function useTodos() {
	return useQuery({
		queryKey: TODOS_QUERY_KEY,
		queryFn: async (): Promise<Todo[]> => {
			const response = await fetch("/api/todos");
			if (!response.ok) {
				throw new Error("Failed to fetch todos");
			}
			return response.json();
		},
	});
}

// Create todo mutation
export function useCreateTodo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateTodoInput): Promise<Todo> => {
			const response = await fetch("/api/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to create todo");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch todos after successful creation
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});
}

// Update todo mutation
export function useUpdateTodo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			updates,
		}: {
			id: string;
			updates: UpdateTodoInput;
		}): Promise<Todo> => {
			const response = await fetch(`/api/todos/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update todo");
			}

			return response.json();
		},
		onMutate: async ({ id, updates }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

			// Snapshot the previous value
			const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

			// Optimistically update to the new value
			if (previousTodos) {
				queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) =>
					old ? old.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)) : []
				);
			}

			// Return a context object with the snapshotted value
			return { previousTodos };
		},
		onError: (err, variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousTodos) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});
}

// Delete todo mutation
export function useDeleteTodo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			const response = await fetch(`/api/todos/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete todo");
			}
		},
		onMutate: async (id) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

			// Snapshot the previous value
			const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

			// Optimistically remove the todo
			if (previousTodos) {
				queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) =>
					old ? old.filter((todo) => todo.id !== id) : []
				);
			}

			// Return a context object with the snapshotted value
			return { previousTodos };
		},
		onError: (err, id, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousTodos) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});
}

// Reorder todos mutation
export function useReorderTodos() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (todoOrders: { id: string; order: number }[]): Promise<void> => {
			const response = await fetch("/api/todos/reorder", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ todoOrders }),
			});

			if (!response.ok) {
				throw new Error("Failed to reorder todos");
			}
		},
		onMutate: async (todoOrders) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

			// Snapshot the previous value
			const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

			// Optimistically update the order
			if (previousTodos) {
				queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
					if (!old) return [];
					
					return old.map((todo) => {
						const orderUpdate = todoOrders.find((t) => t.id === todo.id);
						return orderUpdate ? { ...todo, order: orderUpdate.order } : todo;
					}).sort((a, b) => a.order - b.order);
				});
			}

			// Return a context object with the snapshotted value
			return { previousTodos };
		},
		onError: (err, todoOrders, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousTodos) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});
}
