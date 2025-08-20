import { BookmarkList } from "@/components/bookmark/bookmark-list";
import { TodoList } from "@/components/todo/todo-list";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<div className="gap-4 grid grid-cols-3">
			<TodoList />

			<div className="flex flex-col justify-center items-center gap-8 pt-5">
				<Image
					src="/ascii-art-1.png"
					alt="ascii-art-1"
					width={500}
					height={100}
				/>
				<div className="font-bold text-2xl">Welcome, Hoàn.</div>
				<Button asChild>
					<Link href="https://app.daily.dev">Tech news</Link>
				</Button>
			</div>

			<BookmarkList />
		</div>
	);
}
