import type { NextRequest } from "next/server";
import { videoStorage } from "@/utils/video-storage";

export async function GET(req: NextRequest) {
	try {
		const pathParam = req.nextUrl.searchParams.get("path");
		if (!pathParam) {
			return new Response("Path parameter is required", { status: 400 });
		}

		// Parse the path to get videoId and filename
		const pathParts = pathParam.split("/");
		if (pathParts.length < 2) {
			return new Response("Invalid path format", { status: 400 });
		}

		const videoId = pathParts[0];
		const filename = pathParts[1];

		// Get the file from storage
		const file = await videoStorage.getHLSFile(videoId, filename);

		if (!file) {
			return new Response("File not found", { status: 404 });
		}

		// Set appropriate headers
		const headers = new Headers();
		headers.set("Content-Type", file.contentType);
		headers.set("Cache-Control", "no-cache");
		headers.set("Access-Control-Allow-Origin", "*");
		headers.set("Access-Control-Allow-Methods", "GET");
		headers.set("Access-Control-Allow-Headers", "Range");

		return new Response(new Uint8Array(file.content), {
			status: 200,
			headers,
		});
	} catch (error) {
		console.error("Streaming error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
