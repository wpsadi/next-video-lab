"use client";

import { useDropzone } from "@uploadthing/react";
import { AlertCircle, CheckCircle, Loader2, Upload, Video } from "lucide-react";
import { useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUploadThingStore } from "@/store/uploadThing.store";
import { useVideoConfigStore } from "@/store/video-config";
import { useUploadThing } from "@/utils/uploadthing";

interface VideoUploaderProps {
	onUploadComplete?: (videoUrl: string) => void;
	onUploadError?: (error: string) => void;
	className?: string;
}

export default function VideoUploader({
	onUploadComplete,
	onUploadError,
	className = "",
}: VideoUploaderProps) {
	const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
	const { videoConfig } = useVideoConfigStore();
	const { UPLOADTHING_TOKEN } = useUploadThingStore();

	const { startUpload } = useUploadThing("videoUploader", {
		onClientUploadComplete: async (res) => {
			console.log("Upload completed:", res);
			setIsUploading(false);
			setIsProcessing(true);

			if (res?.[0] && selectedVideo) {
				try {
					// Process video to HLS
					const processResponse = await fetch("/api/video/process", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							videoUrl: res[0].url,
							fileName: selectedVideo.name,
						}),
					});

					const processResult = await processResponse.json();

					if (processResult.success) {
						setUploadedVideoUrl(processResult.hlsUrl);
						onUploadComplete?.(processResult.hlsUrl);
					} else {
						throw new Error(processResult.error || "Processing failed");
					}
				} catch (err) {
					const errorMessage =
						err instanceof Error ? err.message : "Processing failed";
					setError(errorMessage);
					onUploadError?.(errorMessage);
				}
			}
			setIsProcessing(false);
		},
		onUploadError: (error) => {
			console.error("Upload error:", error);
			setError(`Upload failed: ${error.message}`);
			onUploadError?.(error.message);
			setIsUploading(false);
		},
		onUploadProgress: (progress) => {
			setUploadProgress(progress);
		},
		headers: {
			"x-uploadthing-token": UPLOADTHING_TOKEN,
		},
	});

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (!file) return;

		setError(null);

		// Validate file size (4MB max)
		if (file.size > 4 * 1024 * 1024) {
			setError("File size must be less than 4MB");
			return;
		}

		// Validate file type
		if (!file.type.startsWith("video/")) {
			setError("Please select a valid video file");
			return;
		}

		setSelectedVideo(file);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"video/*": [], // Accept all video types; restrict by extension in validation if needed
		},
		maxFiles: videoConfig.UPLOAD_CONFIG.maxFileCount,
		multiple: videoConfig.UPLOAD_CONFIG.multiple,
	});
	const handleUpload = async () => {
		if (!selectedVideo) return;

		setIsUploading(true);
		setUploadProgress(0);

		try {
			await startUpload([selectedVideo]);
		} catch (_err) {
			const errorMessage = "Upload failed. Please try again.";
			setError(errorMessage);
			onUploadError?.(errorMessage);
			setIsUploading(false);
		}
	};

	const resetUploader = () => {
		setSelectedVideo(null);
		setUploadProgress(0);
		setError(null);
		setUploadedVideoUrl(null);
		setIsProcessing(false);
		setIsUploading(false);
	};

	const formatFileSize = (bytes: number): string => {
		const mb = bytes / (1024 * 1024);
		return `${mb.toFixed(2)} MB`;
	};

	return (
		<Card className={`w-full max-w-2xl mx-auto ${className}`}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Video className="w-5 h-5" />
					Video Upload & HLS Processing
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{!selectedVideo && (
					<div
						{...getRootProps()}
						className={`
              flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
              ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground hover:border-primary"}
            `}
					>
						<input {...getInputProps()} />
						<Upload className="w-12 h-12 text-muted-foreground mb-4" />
						<p className="text-lg font-medium mb-2">
							{isDragActive ? "Drop your video here" : "Upload Video File"}
						</p>
						<p className="text-sm text-muted-foreground text-center">
							Drag and drop a video file, or click to select
						</p>
						<div className="mt-4 flex flex-wrap gap-2 justify-center">
							{videoConfig.ALLOWED_EXTENSIONS.map((ext) => (
								<Badge key={ext} variant="secondary" className="text-xs">
									{ext}
								</Badge>
							))}
						</div>
						<p className="text-xs text-muted-foreground mt-2">
							Max size: {formatFileSize(videoConfig.MAX_FILE_SIZE)}
						</p>
					</div>
				)}

				{selectedVideo && (
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
							<div className="flex items-center gap-3">
								<Video className="w-8 h-8 text-primary" />
								<div>
									<p className="font-medium">{selectedVideo.name}</p>
									<p className="text-sm text-muted-foreground">
										{formatFileSize(selectedVideo.size)}
									</p>
								</div>
							</div>
							<Button variant="ghost" size="sm" onClick={resetUploader}>
								Remove
							</Button>
						</div>

						{isProcessing && (
							<div className="flex items-center gap-2 p-4 border rounded-lg">
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Processing video for HLS conversion...</span>
							</div>
						)}

						{selectedVideo &&
							!isUploading &&
							!uploadedVideoUrl &&
							!isProcessing && (
								<div className="space-y-3">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<CheckCircle className="w-4 h-4 text-green-500" />
										Ready for upload and HLS processing
									</div>
									<Button onClick={handleUpload} className="w-full">
										<Upload className="w-4 h-4 mr-2" />
										Upload & Process for HLS
									</Button>
								</div>
							)}

						{isUploading && (
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<Loader2 className="w-4 h-4 animate-spin" />
									<span className="text-sm">
										Uploading and processing... {Math.round(uploadProgress)}%
									</span>
								</div>
								<Progress value={uploadProgress} className="w-full" />
							</div>
						)}

						{uploadedVideoUrl && (
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm text-green-600">
									<CheckCircle className="w-4 h-4" />
									Video uploaded and processed successfully!
								</div>
								<Badge variant="outline" className="text-xs">
									HLS Stream Ready: {uploadedVideoUrl}
								</Badge>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
