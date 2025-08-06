"use client";

import { useUploadThingStore } from "@/store/uploadThing.store";
import { UploadButton } from "@/utils/uploadthing";

export default function Home() {
	const { UPLOADTHING_TOKEN, hydrated } = useUploadThingStore();
	if (!UPLOADTHING_TOKEN || !hydrated) {
		return (
			<div className="flex h-screen items-center justify-center">
				<h1 className="text-2xl font-bold">
					Please configure your uploadThing credentials first.
				</h1>
			</div>
		);
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<UploadButton
				endpoint="imageUploader"
				headers={{
					"x-uploadthing-token": UPLOADTHING_TOKEN,
				}}
				onClientUploadComplete={( res ) => {
				    // Do something with the response
				    console.log( "Files: ", res );
				    alert( "Upload Completed" );

				}}
				onUploadError={(error: Error) => {
					// Do something with the error.
					alert(`ERROR! ${error.message}`);
				}}
			/>
		</main>
	);
}
