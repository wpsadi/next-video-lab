"use client";

import { useDropzone } from "@uploadthing/react";
import { AlertCircle, CheckCircle, Loader2, Upload, Video } from "lucide-react";
import { useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useVideoConfigStore } from "@/store/video-config";
import { uploadFiles } from "@/utils/uploadthing";
import {
	chunkVideoFile,
	type ProcessedVideo,
	validateVideoFile,
} from "@/utils/video-processing";

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
	const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(
		null,
	);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (!file) return;

		setError(null);

		// Validate the video file
		const validation = validateVideoFile(file);
		if (!validation.isValid) {
			setError(validation.error || "Invalid file");
			return;
		}

		setSelectedVideo(file);
		setIsProcessing(true);

		try {
			// Process video into chunks
			const processed = await chunkVideoFile(file);
			setProcessedVideo(processed);
		} catch (err) {
			setError("Failed to process video file");
			console.error("Video processing error:", err);
		} finally {
			setIsProcessing(false);
		}
	}, []);
	const { videoConfig } = useVideoConfigStore();

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"video/*": videoConfig.ALLOWED_EXTENSIONS,
		},
		maxFiles: videoConfig.UPLOAD_CONFIG.maxFileCount,
		multiple: videoConfig.UPLOAD_CONFIG.multiple,
	});

	const handleUpload = async () => {
		if (!processedVideo || !selectedVideo) return;

		setIsUploading(true);
		setUploadProgress(0);

		try {
			// Simulate chunked upload process
			for (let i = 0; i < processedVideo.chunks.length; i++) {
				const _chunk = processedVideo.chunks[i];

				// conver this chunk to a File object
				const chunkFile = new File(
					[_chunk.blob],
					`${selectedVideo.name}-chunk-${i}.mp4`,
					{
						type: selectedVideo.type,
					},
				);

				// Simulate upload delay
				await uploadFiles("imageUploader", { files: [chunkFile] });
				console.log(`Uploading chunk ${i + 1}/${processedVideo.chunks.length}`);

				// Update progress
				const progress = ((i + 1) / processedVideo.chunks.length) * 100;
				setUploadProgress(progress);
			}

			// Simulate HLS processing
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Mock uploaded video URL (in real implementation, this would come from your backend)
			const mockVideoUrl = `/api/video/stream/${selectedVideo.name.replace(/\.[^/.]+$/, "")}.m3u8`;
			setUploadedVideoUrl(mockVideoUrl);

			onUploadComplete?.(mockVideoUrl);
		} catch (_err) {
			const errorMessage = "Upload failed. Please try again.";
			setError(errorMessage);
			onUploadError?.(errorMessage);
		} finally {
			setIsUploading(false);
		}
	};

	const resetUploader = () => {
		setSelectedVideo(null);
		setProcessedVideo(null);
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
								<span>Processing video for chunked upload...</span>
							</div>
						)}

						{processedVideo && !isUploading && !uploadedVideoUrl && (
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<CheckCircle className="w-4 h-4 text-green-500" />
									Ready for upload: {processedVideo.totalChunks} chunks
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
