import {MediaView} from "@/components/MediaView";
import {prisma} from "@/lib/prisma";

const formatDate = (date: Date) =>
	date.toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric"});

// Shows the sections admins added for a page, in their chosen order.
// Sections with a photo or video sit beside their text, alternating sides on wide screens.
export async function PageSections({page}: {page: string}) {
	const sections = await prisma.pageSection.findMany({
		where: {page},
		orderBy: [{position: {sort: "asc", nulls: "last"}}, {updated_at: "desc"}],
		select: {uid: true, heading: true, date: true, details: true, media_url: true},
	});

	return sections.map((section, index) => (
		<section key={section.uid}
				 className={`flex flex-col gap-6 p-0 md:items-center ${index % 2 ? "md:flex-row-reverse" : "md:flex-row"}`}>
			{section.media_url && (
				<MediaView url={section.media_url} alt={section.heading}
						   className="w-full md:w-1/2 max-h-[480px] object-cover rounded-xl"/>
			)}
			<div className="flex flex-col gap-2 md:flex-1">
				<h2 className="text-[26px] font-semibold">{section.heading}</h2>
				{section.date && <p className="opacity-90">{formatDate(section.date)}</p>}
				{section.details && <p className="whitespace-pre-line max-w-3xl leading-relaxed">{section.details}</p>}
			</div>
		</section>
	));
}
