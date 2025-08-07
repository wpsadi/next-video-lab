import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface VideoStorageFile {
	filename: string;
	content: Buffer;
	contentType: string;
}

export class VideoStorage {
	private baseDir: string;

	constructor() {
		this.baseDir = path.join(os.tmpdir(), "hls-cache");
	}

	/**
	 * Store HLS files for a video
	 */
	async storeHLSFiles(
		videoId: string,
		files: VideoStorageFile[],
	): Promise<void> {
		const videoDir = path.join(this.baseDir, videoId);
		await fs.mkdir(videoDir, { recursive: true });

		for (const file of files) {
			const filePath = path.join(videoDir, file.filename);
			await fs.writeFile(filePath, file.content);
		}
	}

	/**
	 * Retrieve a specific HLS file
	 */
	async getHLSFile(
		videoId: string,
		filename: string,
	): Promise<VideoStorageFile | null> {
		try {
			const filePath = path.join(this.baseDir, videoId, filename);
			const content = await fs.readFile(filePath);

			// Determine content type
			const ext = path.extname(filename).toLowerCase();
			let contentType = "application/octet-stream";

			if (ext === ".m3u8") {
				contentType = "application/vnd.apple.mpegurl";
			} else if (ext === ".ts") {
				contentType = "video/mp2t";
			}

			return {
				filename,
				content,
				contentType,
			};
		} catch (error) {
			console.error(
				`Error retrieving file ${filename} for video ${videoId}:`,
				error,
			);
			return null;
		}
	}

	/**
	 * Check if video exists in storage
	 */
	async videoExists(videoId: string): Promise<boolean> {
		try {
			const videoDir = path.join(this.baseDir, videoId);
			const stats = await fs.stat(videoDir);
			return stats.isDirectory();
		} catch {
			return false;
		}
	}

	/**
	 * List all files for a video
	 */
	async listVideoFiles(videoId: string): Promise<string[]> {
		try {
			const videoDir = path.join(this.baseDir, videoId);
			const files = await fs.readdir(videoDir);
			return files.filter(
				(file) => file.endsWith(".m3u8") || file.endsWith(".ts"),
			);
		} catch {
			return [];
		}
	}

	/**
	 * Delete all files for a video (cleanup)
	 */
	async deleteVideo(videoId: string): Promise<void> {
		try {
			const videoDir = path.join(this.baseDir, videoId);
			await fs.rm(videoDir, { recursive: true, force: true });
		} catch (error) {
			console.error(`Error deleting video ${videoId}:`, error);
		}
	}

	/**
	 * Get storage stats
	 */
	async getStorageStats(): Promise<{
		totalVideos: number;
		totalFiles: number;
	}> {
		try {
			const videoDirs = await fs.readdir(this.baseDir);
			let totalFiles = 0;

			for (const videoDir of videoDirs) {
				const files = await this.listVideoFiles(videoDir);
				totalFiles += files.length;
			}

			return {
				totalVideos: videoDirs.length,
				totalFiles,
			};
		} catch {
			return { totalVideos: 0, totalFiles: 0 };
		}
	}
}

// Singleton instance
export const videoStorage = new VideoStorage();
