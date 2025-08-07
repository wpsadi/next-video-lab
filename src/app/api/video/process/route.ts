import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

		// Create output directory
		const outputDir = path.join(
			process.cwd(),
			"public",
			"hls",
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

		// Clean up input file
		await fs.unlink(inputVideoPath);

		// Return the HLS URL
		const hlsUrl = `/api/hls/${fileName.replace(/\.[^/.]+$/, "")}/playlist.m3u8`;

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
