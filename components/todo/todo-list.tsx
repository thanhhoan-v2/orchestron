"use client";

import { Todo } from "@/lib/db";
import {
	useCreateTodo,
	useDeleteTodo,
	useReorderTodos,
	useTodos,
	useUpdateTodo,
} from "@/lib/hooks/use-todos";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { TodoForm } from "./todo-form";
import { TodoItem } from "./todo-item";

type FilterType = "all" | "pending" | "completed";

export function TodoList() {
	const [filter] = useState<FilterType>("all");
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	// React Query hooks
	const { data: todos = [], isLoading } = useTodos();
	const createTodoMutation = useCreateTodo();
	const updateTodoMutation = useUpdateTodo();
	const deleteTodoMutation = useDeleteTodo();
	const reorderTodosMutation = useReorderTodos();

	const handleCreateTodo = async (todoData: {
		title: string;
		description?: string;
	}) => {
		createTodoMutation.mutate(todoData);
	};

	const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
		updateTodoMutation.mutate({ id, updates });
	};

	const handleDeleteTodo = async (id: string) => {
		// Prevent multiple delete attempts
		if (deletingIds.has(id)) return;

		// Mark as deleting
		setDeletingIds((prev) => new Set(prev).add(id));

		deleteTodoMutation.mutate(id, {
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

	const handleToggleTodo = async (id: string) => {
		const todo = todos.find((t) => t.id === id);
		if (todo) {
			handleUpdateTodo(id, { completed: !todo.completed });
		}
	};

	const handleMoveUp = async (todoId: string) => {
		const currentIndex = filteredTodos.findIndex((todo) => todo.id === todoId);
		if (currentIndex <= 0) return; // Already at top or not found

		const currentTodo = filteredTodos[currentIndex];
		const previousTodo = filteredTodos[currentIndex - 1];

		// Swap the order values between the two todos
		const todoOrders = [
			{ id: currentTodo.id, order: previousTodo.order },
			{ id: previousTodo.id, order: currentTodo.order },
		];

		reorderTodosMutation.mutate(todoOrders);
	};

	const handleMoveDown = async (todoId: string) => {
		const currentIndex = filteredTodos.findIndex((todo) => todo.id === todoId);
		if (currentIndex >= filteredTodos.length - 1 || currentIndex === -1) return; // Already at bottom or not found

		const currentTodo = filteredTodos[currentIndex];
		const nextTodo = filteredTodos[currentIndex + 1];

		// Swap the order values between the two todos
		const todoOrders = [
			{ id: currentTodo.id, order: nextTodo.order },
			{ id: nextTodo.id, order: currentTodo.order },
		];

		reorderTodosMutation.mutate(todoOrders);
	};

	const filteredTodos = todos.filter((todo) => {
		switch (filter) {
			case "pending":
				return !todo.completed;
			case "completed":
				return todo.completed;
			default:
				return true;
		}
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center w-full min-h-[400px]">
				<div className="flex flex-col justify-center items-center gap-3 p-8">
					<RefreshCw className="size-6 animate-spin" />
					<p>Loading todos</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 mx-auto p-5 w-full h-[50vh]">
			{/* Stats */}

			{/* Create Todo Form */}
			<TodoForm
				onSubmit={handleCreateTodo}
				loading={createTodoMutation.isPending}
			/>

			{/* Todo List */}
			<div className="space-y-4 max-h-[800px] overflow-y-auto">
				{filteredTodos.length === 0 ? (
					<div>
						<div className="p-8 text-center">
							<div className="space-y-2">
								<h3 className="font-medium text-lg">No todos found</h3>
								<p className="text-muted-foreground">
									{filter === "all"
										? "Create your first todo to get started!"
										: `No ${filter} todos at the moment.`}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						{filteredTodos.map((todo, index) => (
							<TodoItem
								key={todo.id}
								todo={todo}
								onUpdate={handleUpdateTodo}
								onDelete={handleDeleteTodo}
								onToggle={handleToggleTodo}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
								loading={updateTodoMutation.isPending}
								deleting={deletingIds.has(todo.id)}
								canMoveUp={index > 0}
								canMoveDown={index < filteredTodos.length - 1}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
