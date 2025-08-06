import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Page() {
	return (
		<div className={cn("flex flex-col gap-6")}>
			<div>
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-2">
						<h1 className="text-xl font-bold text-center">
							You have not configured your uploadThing credentials
						</h1>
					</div>
					<div className="grid gap-4 sm:grid-cols-1">
						<Link href="/configure/uploadThing" className="w-full">
							<Button variant="secondary" type="button" className="w-full">
								Start Setup
							</Button>
						</Link>
					</div>
				</div>
			</div>

			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				We do not store your TOKEN with us, it is only used to authenticate your
				uploads with UploadThing.
			</div>
		</div>
	);
}

export default Page;
