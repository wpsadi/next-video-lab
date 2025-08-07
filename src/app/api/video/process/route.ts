import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type VideoStorageFile, videoStorage } from "@/utils/video-storage";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
	try {
		const { videoUrl, fileName } = await request.json();

		if (!videoUrl || !fileName) {
			return NextResponse.json(
				{ error: "Video URL and fileName are required" },
				{ status: 400 },
			);
		}

		// Create output directory in temp folder
		const outputDir = path.join(
			os.tmpdir(),
			"hls-processing",
			fileName.replace(/\.[^/.]+$/, ""),
		);
		await fs.mkdir(outputDir, { recursive: true });

		// Download the video file
		console.log("Downloading video from:", videoUrl);
		const response = await fetch(videoUrl);

		if (!response.ok) {
			throw new Error(`Failed to download video: ${response.statusText}`);
		}

		const videoBuffer = await response.arrayBuffer();
		const inputVideoPath = path.join(outputDir, "input.mp4");
		await fs.writeFile(inputVideoPath, Buffer.from(videoBuffer));

		// FFmpeg command to create HLS segments
		const hlsOutputPath = path.join(outputDir, "playlist.m3u8");

		const ffmpegCommand = [
			"ffmpeg",
			"-i",
			inputVideoPath,
			"-profile:v",
			"baseline",
			"-level",
			"3.0",
			"-s",
			"640x360",
			"-start_number",
			"0",
			"-hls_time",
			"10",
			"-hls_list_size",
			"0",
			"-hls_segment_filename",
			path.join(outputDir, "segment_%03d.ts"),
			"-f",
			"hls",
			hlsOutputPath,
		].join(" ");

		console.log("Running FFmpeg command:", ffmpegCommand);

		// Execute FFmpeg
		await execAsync(ffmpegCommand);

		// Read generated HLS files and prepare them for storage
		const hlsFiles = await fs.readdir(outputDir);
		const storageFiles: VideoStorageFile[] = [];

		for (const file of hlsFiles) {
			if (file.endsWith(".m3u8") || file.endsWith(".ts")) {
				const filePath = path.join(outputDir, file);
				const fileContent = await fs.readFile(filePath);

				// Determine content type
				const ext = path.extname(file).toLowerCase();
				let contentType = "application/octet-stream";

				if (ext === ".m3u8") {
					contentType = "application/vnd.apple.mpegurl";
				} else if (ext === ".ts") {
					contentType = "video/mp2t";
				}

				storageFiles.push({
					filename: file,
					content: fileContent,
					contentType,
				});
			}
		}

		// Store HLS files using our storage utility
		const videoId = fileName.replace(/\.[^/.]+$/, "");
		await videoStorage.storeHLSFiles(videoId, storageFiles);

		// Clean up temporary processing directory
		await fs.rm(outputDir, { recursive: true, force: true });

		// Return the HLS URL pointing to our API endpoint
		const hlsUrl = `/api/hls?path=${encodeURIComponent(videoId)}/playlist.m3u8`;

		console.log("HLS processing completed successfully. URL:", hlsUrl);

		return NextResponse.json({
			success: true,
			hlsUrl,
			message: "Video processed successfully",
		});
	} catch (error) {
		console.error("Video processing error:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to process video",
			},
			{ status: 500 },
		);
	}
}
