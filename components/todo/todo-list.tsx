"use client";

import { Button } from "@/components/ui/button";
import {
	useCreateOrUpdateTodoString,
	useTodoString,
} from "@/lib/hooks/use-todos";
import { PlusIcon, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";

export function TodoList() {
	const [value, setValue] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// React Query hooks
	const { data: todoString, isLoading } = useTodoString();
	const createOrUpdateTodoStringMutation = useCreateOrUpdateTodoString();

	// Initialize local state with data from database
	useEffect(() => {
		if (todoString?.content) {
			setValue(todoString.content);
		}
	}, [todoString?.content]);

	const handleSaveTodoString = async () => {
		if (value.trim() === "") return;

		createOrUpdateTodoStringMutation.mutate({ content: value });
		setIsDialogOpen(false);
	};

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
	};

	const handleDialogOpenChange = (open: boolean) => {
		setIsDialogOpen(open);
		// Reset to original content if dialog is closed without saving
		if (!open && todoString?.content) {
			setValue(todoString.content);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center w-full min-h-[400px]">
				<div className="flex flex-col justify-center items-center gap-3 p-8">
					<RefreshCw className="size-6 animate-spin" />
					<p>Loading todo string</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 mx-auto p-5 w-full h-[50vh]">
			{/* Header with Edit Button */}
			<div className="flex justify-between items-end pb-2 border-b-2">
				<h2 className="font-bold text-xl">Todos</h2>
				<Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
					<DialogTrigger asChild>
						<Button variant="outline">
							<PlusIcon className="size-4" />
							Add Todos
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogTitle>Edit Todos</DialogTitle>
						<div className="py-4">
							<Textarea
								placeholder="Add your todos here..."
								value={value}
								onChange={handleTextareaChange}
								className="min-h-[200px] resize-none"
							/>
							<div className="flex gap-2 mt-4">
								<Button
									onClick={handleSaveTodoString}
									disabled={
										!value.trim() || createOrUpdateTodoStringMutation.isPending
									}
									className="flex-1"
								>
									{createOrUpdateTodoStringMutation.isPending
										? "Saving..."
										: "Save Todos"}
								</Button>
								<Button
									variant="outline"
									onClick={() => setIsDialogOpen(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Streamdown Display */}
			<Streamdown className="p-4 border-none min-h-[400px]">
				{value || "Start typing your todos above..."}
			</Streamdown>
		</div>
	);
}
