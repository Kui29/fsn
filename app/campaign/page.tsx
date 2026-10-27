import {Card, CardBody} from "@nextui-org/react";
import {title} from "@/components/primitives";
import {MediaView} from "@/components/MediaView";
import {PageSections} from "@/components/PageSections";
import {sitePages} from "@/config/adminResources";
import {prisma} from "@/lib/prisma";

// Always show the latest campaigns instead of a copy saved when the site was built
export const dynamic = "force-dynamic";

export const metadata = {title: "This Month"};

const formatDate = (date: Date) =>
	date.toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric"});

// Only public fields are selected, so people's IDs never reach the page
async function getCampaigns() {
	return prisma.campaign.findMany({
		orderBy: {start_date: "desc"},
		select: {
			uid: true,
			campaign_name: true,
			start_date: true,
			end_date: true,
			details: true,
			media_url: true,
			photos: {
				orderBy: [{is_main: "desc"}, {date: "desc"}],
				select: {uid: true, caption: true, date: true, details: true, url: true},
			},
		},
	});
}

type Campaign = Awaited<ReturnType<typeof getCampaigns>>[number];

export default async function CampaignsPage() {
	const campaigns = await getCampaigns();

	return (
		<div className="flex flex-col gap-8 py-8 text-[16px]">
			<h1 className={title()}>This Month</h1>
			<PageSections page={sitePages.thisMonth}/>
			<h2 className="text-[30px] font-semibold">Campaigns</h2>
			{campaigns.length === 0 && <p>No campaigns yet. Check back soon!</p>}
			{campaigns.map(campaign => <CampaignSection key={campaign.uid} campaign={campaign}/>)}
		</div>
	);
}

function CampaignSection({campaign}: {campaign: Campaign}) {
	return (
		<section className="flex flex-col gap-4 p-0">
			<div>
				<h2 className="text-[26px] font-semibold">{campaign.campaign_name}</h2>
				<p className="opacity-90">{formatDate(campaign.start_date)} – {formatDate(campaign.end_date)}</p>
			</div>
			<MediaView url={campaign.media_url} alt={campaign.campaign_name} className="max-h-[480px] w-auto max-w-full self-start rounded-xl"/>
			{campaign.details && <p className="whitespace-pre-line max-w-3xl leading-relaxed">{campaign.details}</p>}
			{campaign.photos.length > 0 && (
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{campaign.photos.map(photo => (
						<Card key={photo.uid} className="bg-content1 text-default-900 text-[15px]">
							<CardBody className="flex flex-col gap-2">
								<MediaView url={photo.url} alt={photo.caption ?? campaign.campaign_name}
										   className="w-full aspect-[4/3] object-cover rounded-lg"/>
								{photo.caption && <h3 className="font-semibold text-[17px]">{photo.caption}</h3>}
								{photo.date && <p className="text-default-600">{formatDate(photo.date)}</p>}
								{photo.details && <p className="whitespace-pre-line">{photo.details}</p>}
							</CardBody>
						</Card>
					))}
				</div>
			)}
		</section>
	);
}
