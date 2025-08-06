import LoadingSpinner from "./loadingSpinner";

function SpinnerPage({
	text,
	description,
}: {
	text?: string;
	description?: string;
}) {
	return (
		<div className="bg-background flex flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="">
					<LoadingSpinner text={text} description={description} />
				</div>
			</div>
		</div>
	);
}

export default SpinnerPage;
