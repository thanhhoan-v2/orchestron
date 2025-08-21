import { BookmarkList } from "@/components/bookmark/bookmark-list";
import { ReminderList } from "@/components/reminder/reminder-list";
import { TodoList } from "@/components/todo/todo-list";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<div className="gap-4 grid grid-cols-3 px-5">
			<div className="flex flex-col gap-4">
				<TodoList />
				<ReminderList />
			</div>

			<div className="flex flex-col justify-center items-center gap-8 pt-5 transition-all duration-300">
				<Image
					src="/ascii-art-1.png"
					alt="ascii-art-1"
					width={400}
					height={80}
				/>
				<div className="font-bold text-xl">Welcome, Hoàn.</div>
				<Button asChild>
					<Link href="https://app.daily.dev">Tech news</Link>
				</Button>
			</div>

			<BookmarkList />
		</div>
	);
}
