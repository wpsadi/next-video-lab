"use client";

import { useDropzone } from "@uploadthing/react";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { useCallback, useState } from "react";
import {
	generateClientDropzoneAccept,
	generatePermittedFileTypes,
} from "uploadthing/client";
import SpinnerPage from "@/components/spinner-page"; // Assuming this is a custom component
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUploadThingStore } from "@/store/uploadThing.store"; // Assuming this path is correct
import { useUploadThing } from "@/utils/uploadthing"; // Assuming this path is correct

export default function MultiUploader() {
	const [files, setFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const { UPLOADTHING_TOKEN, hydrated } = useUploadThingStore();

	const onDrop = useCallback((acceptedFiles: File[]) => {
		setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
	}, []);

	const removeFile = useCallback((fileToRemove: File) => {
		setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
	}, []);

	const { startUpload, routeConfig } = useUploadThing("imageUploader", {
		onClientUploadComplete: () => {
			alert("Uploaded successfully!");
			setFiles([]); // Clear files after successful upload
			setIsUploading(false);
		},
		onUploadError: (error) => {
			alert(`Error occurred while uploading: ${error.message}`);
			setIsUploading(false);
		},
		onUploadBegin: (filename) => {
			console.log("Upload has begun for", filename);
			setIsUploading(true);
		},
		headers: {
			"x-uploadthing-token": UPLOADTHING_TOKEN,
		},
	});

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: generateClientDropzoneAccept(
			generatePermittedFileTypes(routeConfig).fileTypes,
		),
	});

	if (!UPLOADTHING_TOKEN || !hydrated) {
		return (
			<SpinnerPage
				description="Retrieving upload token..."
				text="Please wait..."
			/>
		);
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Upload Files</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div
					{...getRootProps()}
					className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors duration-200"
				>
					<input {...getInputProps()} />
					<UploadCloud className="w-12 h-12 text-muted-foreground mb-2" />
					{isDragActive ? (
						<p className="text-muted-foreground">Drop the files here ...</p>
					) : (
						<p className="text-muted-foreground text-center">
							Drag 'n' drop some files here, or click to select files
						</p>
					)}
				</div>

				{files.length > 0 && (
					<div className="grid gap-2">
						<h3 className="font-medium text-sm">Selected Files:</h3>
						<ul className="grid gap-2">
							{files.map((file) => (
								<li
									key={file.name}
									className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
								>
									<div className="flex items-center gap-2">
										<FileText className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm font-medium truncate max-w-[200px]">
											{file.name}
										</span>
										<Badge variant="secondary" className="text-xs">
											{(file.size / 1024 / 1024).toFixed(2)} MB
										</Badge>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeFile(file)}
										className="w-6 h-6"
										aria-label={`Remove ${file.name}`}
									>
										<X className="w-4 h-4" />
									</Button>
								</li>
							))}
						</ul>
						<Button
							onClick={() => startUpload(files)}
							disabled={isUploading || files.length === 0}
							className="w-full mt-4"
						>
							{isUploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								`Upload ${files.length} file${files.length > 1 ? "s" : ""}`
							)}
						</Button>
						<Button
							variant="outline"
							onClick={() => setFiles([])}
							disabled={isUploading || files.length === 0}
							className="w-full mt-2"
						>
							Clear All
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
