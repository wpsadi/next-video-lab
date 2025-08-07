"use client";

import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";

interface MarkdownRendererProps {
	markdownContent: string;
}

export default function MarkdownRenderer({
	markdownContent,
}: MarkdownRendererProps) {
	return (
		<Card className="w-full">
			<CardContent className="p-6 prose max-w-none">
				<ReactMarkdown>{markdownContent}</ReactMarkdown>
			</CardContent>
		</Card>
	);
}
