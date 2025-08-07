import fs from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	_request: NextRequest,
	{ params }: { params: { path: string[] } },
) {
	try {
		const filePath = params.path.join("/");
		const fullPath = path.join(process.cwd(), "public", "hls", filePath);

		// Check if file exists
		const fileStats = await fs.stat(fullPath);
		if (!fileStats.isFile()) {
			return new NextResponse("File not found", { status: 404 });
		}

		// Read the file
		const fileContent = await fs.readFile(fullPath);

		// Determine content type
		const ext = path.extname(fullPath).toLowerCase();
		let contentType = "application/octet-stream";

		if (ext === ".m3u8") {
			contentType = "application/vnd.apple.mpegurl";
		} else if (ext === ".ts") {
			contentType = "video/mp2t";
		}

		// Set appropriate headers
		const headers = new Headers();
		headers.set("Content-Type", contentType);
		headers.set("Cache-Control", "no-cache");
		headers.set("Access-Control-Allow-Origin", "*");
		headers.set("Access-Control-Allow-Methods", "GET");
		headers.set("Access-Control-Allow-Headers", "Range");

		return new NextResponse(fileContent, {
			status: 200,
			headers,
		});
	} catch (error) {
		console.error("Streaming error:", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
}
