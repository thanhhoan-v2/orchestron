import { BookmarkList } from "@/components/bookmark/bookmark-list";
import { TodoList } from "@/components/todo/todo-list";

export default function Home() {
	return (
		<div className="gap-4 grid grid-cols-3">
			<TodoList />
			<BookmarkList />
		</div>
	);
}
