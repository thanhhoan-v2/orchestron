"use client";

import { Button } from "@/components/ui/button";
import {
	useCreateOrUpdateTodoString,
	useCreateTodoSession,
	useDeleteTodoSession,
	useLoadTodoSession,
	useTodoSessions,
	useTodoString,
} from "@/lib/hooks/use-todos";
import { BookmarkIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export function TodoList() {
	const [value, setValue] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [sessionTitle, setSessionTitle] = useState("");
	const [isSaveSessionDialogOpen, setIsSaveSessionDialogOpen] = useState(false);
	const [previewSession, setPreviewSession] = useState<{
		id: string;
		title: string;
		content: string;
		created_at: string;
		updated_at: string;
	} | null>(null);
	const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

	// React Query hooks
	const { data: todoString, isLoading } = useTodoString();
	const createOrUpdateTodoStringMutation = useCreateOrUpdateTodoString();
	const { data: sessions, isLoading: sessionsLoading } = useTodoSessions();
	const createSessionMutation = useCreateTodoSession();
	const deleteSessionMutation = useDeleteTodoSession();
	const loadSessionMutation = useLoadTodoSession();

	// Initialize local state with data from database
	useEffect(() => {
		if (todoString?.content) {
			setValue(todoString.content);
		}
	}, [todoString?.content]);

	const handleSaveTodoString = async () => {
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

	const handleSaveAsSession = async () => {
		if (!sessionTitle.trim() || !value.trim()) return;

		createSessionMutation.mutate(
			{ title: sessionTitle, content: value },
			{
				onSuccess: () => {
					setIsSaveSessionDialogOpen(false);
					setSessionTitle("");
				},
			}
		);
	};

	const handlePreviewSession = (session: {
		id: string;
		title: string;
		content: string;
		created_at: string;
		updated_at: string;
	}) => {
		setPreviewSession(session);
		setIsPreviewDialogOpen(true);
	};

	const handleLoadSession = async (session: {
		id: string;
		title: string;
		content: string;
		created_at: string;
		updated_at: string;
	}) => {
		loadSessionMutation.mutate(session, {
			onSuccess: () => {
				setValue(session.content);
				setIsPreviewDialogOpen(false);
			},
		});
	};

	const handleDeleteSession = (sessionId: string) => {
		deleteSessionMutation.mutate(sessionId);
	};

	if (isLoading) {
		return (
			<div className="space-y-6 mx-auto p-5 w-full h-[50vh]">
				{/* Header with Edit Button */}
				<div className="flex justify-between items-end pb-2 border-b-2">
					<h2 className="font-bold text-xl">Todos</h2>
					<Button variant="ghost" disabled>
						<PlusIcon className="size-4" />
					</Button>
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
						<Button variant="ghost">
							<PlusIcon className="size-4" />
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
									disabled={createOrUpdateTodoStringMutation.isPending}
									className="flex-1"
								>
									{createOrUpdateTodoStringMutation.isPending
										? "Saving..."
										: "Save Todos"}
								</Button>
								<Dialog
									open={isSaveSessionDialogOpen}
									onOpenChange={setIsSaveSessionDialogOpen}
								>
									<DialogTrigger asChild>
										<Button variant="outline" disabled={!value.trim()}>
											<BookmarkIcon className="mr-2 size-4" />
											Save Session
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogTitle>Save Todo Session</DialogTitle>
										<div className="py-4">
											<Input
												placeholder="Session name..."
												value={sessionTitle}
												onChange={(e) => setSessionTitle(e.target.value)}
												className="mb-4"
											/>
											<div className="flex gap-2">
												<Button
													onClick={handleSaveAsSession}
													disabled={
														createSessionMutation.isPending ||
														!sessionTitle.trim() ||
														!value.trim()
													}
													className="flex-1"
												>
													{createSessionMutation.isPending
														? "Saving..."
														: "Save Session"}
												</Button>
												<Button
													variant="outline"
													onClick={() => setIsSaveSessionDialogOpen(false)}
												>
													Cancel
												</Button>
											</div>
										</div>
									</DialogContent>
								</Dialog>
								<Button
									variant="outline"
									onClick={() => setIsDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={() => setValue("")}
									disabled={!value.trim()}
								>
									Clear All
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Streamdown Display */}
			<Streamdown className="p-4 border-none min-h-[400px]">
				{value || "None."}
			</Streamdown>

			{/* Saved Sessions */}
			<div>
				<h3 className="mb-6 pb-2 border-b-2 font-bold text-xl">Saved Todos</h3>
				{sessionsLoading ? (
					<div className="text-gray-500">Loading sessions...</div>
				) : sessions && sessions.length > 0 ? (
					<div className="space-y-2">
						{sessions.map((session) => (
							<div
								key={session.id}
								className="flex justify-between items-center p-3 border rounded-lg"
							>
								<div className="flex-1">
									<h4 className="font-medium">{session.title}</h4>
									<p className="text-gray-500 text-sm">
										{new Date(session.created_at).toLocaleDateString()} at{" "}
										{new Date(session.created_at).toLocaleTimeString()}
									</p>
								</div>
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => handlePreviewSession(session)}
									>
										Preview
									</Button>

									<Button
										size="sm"
										variant="destructive"
										onClick={() => handleDeleteSession(session.id)}
										disabled={deleteSessionMutation.isPending}
									>
										<TrashIcon className="size-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="py-4 text-gray-500 text-center">
						No saved todos yet.
					</div>
				)}
			</div>

			{/* Preview Session Dialog */}
			<Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh]">
					<DialogTitle>{previewSession?.title}</DialogTitle>
					<div className="py-4">
						<div className="mb-4 p-3">
							<p className="text-sm">
								Created:{" "}
								{previewSession
									? new Date(previewSession.created_at).toLocaleDateString()
									: ""}{" "}
								at{" "}
								{previewSession
									? new Date(previewSession.created_at).toLocaleTimeString()
									: ""}
							</p>
						</div>

						{/* Streamdown Preview */}
						<div className="p-4 border rounded-lg min-h-[300px] max-h-[400px] overflow-y-auto">
							<Streamdown className="border-none">
								{previewSession?.content || ""}
							</Streamdown>
						</div>

						<div className="flex gap-2 mt-4">
							<Button
								onClick={() =>
									previewSession && handleLoadSession(previewSession)
								}
								disabled={loadSessionMutation.isPending || !previewSession}
								className="flex-1"
							>
								{loadSessionMutation.isPending
									? "Loading..."
									: "Load This Session"}
							</Button>
							<Button
								variant="outline"
								onClick={() => setIsPreviewDialogOpen(false)}
							>
								Close
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
