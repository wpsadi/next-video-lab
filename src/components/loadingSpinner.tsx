import { LoaderCircle } from "lucide-react";

function LoadingSpinner({
	text = "Loading...",
	description = "Please wait while we load the content.",
}) {
	return (
		<div className="flex flex-col items-center justify-center py-8">
			<LoaderCircle className="h-8 w-8 animate-spin text-primary mb-4" />
			<div className="text-lg font-medium text-primary mb-1">{text}</div>
			<div className="text-sm text-muted-foreground">{description}</div>
		</div>
	);
}

export default LoadingSpinner;
