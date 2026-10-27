import {title} from "@/components/primitives";
import {PageSections} from "@/components/PageSections";
import {sitePages} from "@/config/adminResources";
import {prisma} from "@/lib/prisma";

// Always show the latest content admins added instead of a copy saved when the site was built
export const dynamic = "force-dynamic";

export const metadata = {title: "Team"};

export default async function TeamPage() {
	const hasSections = await prisma.pageSection.count({where: {page: sitePages.team}}) > 0;

	return (
		<div className="flex flex-col gap-10 py-8 text-[16px]">
			<h1 className={title()}>Our Team</h1>
			{hasSections ? <PageSections page={sitePages.team}/> : <p>Our team will be introduced here soon.</p>}
		</div>
	);
}
