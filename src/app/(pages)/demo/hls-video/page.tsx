"use client";

import { useState } from "react";
import HLSVideoPlayer from "@/components/hls-video-player";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoUploader from "@/components/video-uploader";
import { cn } from "@/lib/utils";

export default function InstructionsPage() {
	const [currentStep, setCurrentStep] = useState(1);
	const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
	const totalSteps = 3;

	const handleNext = () => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleVideoUploadComplete = (videoUrl: string) => {
		setUploadedVideoUrl(videoUrl);
		// Automatically move to next step after successful upload
		setTimeout(() => {
			if (currentStep === 2) {
				setCurrentStep(3);
			}
		}, 1500);
	};

	const markdownContentStep1 = `
# Video Upload & HLS Streaming Guide

Welcome to our advanced video processing system! This guide will walk you through uploading, processing, and streaming videos using HLS (HTTP Live Streaming) technology.

## What You'll Learn

### Step 1: Understanding the Process
- **Video Upload**: Learn about our chunked upload system for large video files
- **HLS Processing**: Understand how videos are converted to streaming format
- **Quality Options**: Multiple resolution options for optimal viewing

### Step 2: Upload Your Video
- **Supported Formats**: MP4, WebM, MOV, AVI, WMV
- **File Size Limit**: Up to 50MB per video
- **Processing**: Automatic chunking and HLS conversion

### Step 3: Stream & Play
- **HLS Player**: Custom video player with adaptive streaming
- **Quality Selection**: Automatic quality adjustment based on connection
- **Controls**: Full playback controls with seek, volume, and fullscreen

## Technical Features

- **Chunked Upload**: Large files are split into 4MB chunks for reliable upload
- **HLS Segmentation**: Videos are processed into 10-second segments
- **Multi-Quality**: Automatic generation of 360p, 480p, 720p, and 1080p versions
- **Adaptive Streaming**: Player automatically adjusts quality based on bandwidth

Click **Next** to start uploading your video!
`;

	return (
		<div className="flex flex-col items-center justify-center p-4">
			<Card className="w-full max-w-5xl">
				<CardHeader className="pb-4">
					<CardTitle className="text-center text-2xl">
						Video Processing Pipeline
					</CardTitle>
					<div className="flex justify-center gap-4 mt-4">
						{[1, 2, 3].map((step) => (
							<div
								key={step}
								className={cn(
									"flex items-center gap-2 text-lg font-semibold",
									currentStep === step
										? "text-primary"
										: "text-muted-foreground",
								)}
							>
								<span
									className={cn(
										"w-8 h-8 flex items-center justify-center rounded-full border-2",
										currentStep === step
											? "border-primary bg-primary text-primary-foreground"
											: currentStep > step
												? "border-green-500 bg-green-500 text-white"
												: "border-muted-foreground bg-background",
									)}
								>
									{currentStep > step ? "✓" : step}
								</span>
								<span className="hidden sm:inline">
									{step === 1 && "Instructions"}
									{step === 2 && "Upload & Process"}
									{step === 3 && "Stream & Play"}
								</span>
							</div>
						))}
					</div>
				</CardHeader>
				<CardContent className=" flex items-center justify-center">
					{currentStep === 1 && (
						<ScrollArea className="w-full h-[50vh]">
							<div className="prose max-w-none">
								<MarkdownRenderer markdownContent={markdownContentStep1} />
							</div>
						</ScrollArea>
					)}
					{currentStep === 2 && (
						<VideoUploader
							onUploadComplete={handleVideoUploadComplete}
							onUploadError={(error) => console.error("Upload error:", error)}
						/>
					)}
					{currentStep === 3 && (
						<div className="w-full space-y-4">
							{uploadedVideoUrl ? (
								<HLSVideoPlayer
									src={uploadedVideoUrl}
									title="Your Uploaded Video"
									controls={true}
								/>
							) : (
								<div className="text-center p-8 border-2 border-dashed rounded-lg">
									<p className="text-muted-foreground">
										No video uploaded yet. Go back to step 2 to upload a video.
									</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
				<CardFooter className="flex justify-between pt-4">
					<Button
						onClick={handleBack}
						disabled={currentStep === 1}
						variant="outline"
					>
						Back
					</Button>
					<Button
						onClick={handleNext}
						disabled={
							currentStep === totalSteps ||
							(currentStep === 2 && !uploadedVideoUrl)
						}
					>
						{currentStep === totalSteps ? "Finish" : "Next"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
