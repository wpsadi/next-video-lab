import { UploadThingConfigureModel } from "./model";

export default function Page() {
	return (
		<div className="bg-background flex flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm">
				<UploadThingConfigureModel />
			</div>
		</div>
	);
}
