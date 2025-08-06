"use client";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUploadThingStore } from "@/store/uploadThing.store";

export function UploadThingConfigureModel({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { UPLOADTHING_TOKEN, updateUT_token, deleteUT_token, hydrated } =
		useUploadThingStore();

	const saveToken = (token: string) => {
		updateUT_token(token);
		toast.success("Token saved successfully!");
	};
	const deleteToken = () => {
		deleteUT_token();
		toast.success("Token deleted successfully!");
	};
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					const token = formData.get("UPLOADTHING_TOKEN") as string;
					saveToken(token);
				}}
			>
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center gap-2">
						<h1 className="text-xl font-bold">
							Add your uploadThing crendentials
						</h1>
						<div className="text-center text-sm">
							example: UPLOADTHING_TOKEN='eyJhcGl...'
						</div>
					</div>
					<div className="flex flex-col gap-6">
						<div className="grid gap-3">
							<Label htmlFor="UPLOADTHING_TOKEN">UPLOADTHING_TOKEN</Label>
							<Input
								id="UPLOADTHING_TOKEN"
								type="text"
								name="UPLOADTHING_TOKEN"
								defaultValue={hydrated ? UPLOADTHING_TOKEN : "..."}
								disabled={!hydrated}
								placeholder="eyJhcGlLZXkiOiJza19saXZlXzViMzI1ZmZlYWY..."
								required
							/>
						</div>
						<Button type="submit" className="w-full" disabled={!hydrated}>
							Save Token
						</Button>
					</div>
					<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
					<div className="grid gap-4 sm:grid-cols-1">
						<Button
							variant="destructive"
							type="button"
							className="w-full"
							disabled={!hydrated}
							onClick={deleteToken}
						>
							<Trash2Icon className="h-4 w-4 mr-2" />
							Delete Token
						</Button>
					</div>
				</div>
			</form>
			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				We do not store your TOKEN with us, it is only used to authenticate your
				uploads with UploadThing.
			</div>
		</div>
	);
}
