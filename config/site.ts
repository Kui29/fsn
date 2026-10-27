export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "Fancied Story Network",
	description: "FANCIED STORY NETWORK (FSN) is a social movement which was formed on March" +
		" 3rd 2022.The movement was formed initially as a form of self-expression on the lack of awareness on " +
		"the general mental health state of our society on a day-to-day basis.It is steadily growing both locally and internationally" +
		" with a current membership of more than 140 + members.Overtime the movement has evolved and diversified its works into raising mental health " +
		"awareness by running mental health campaigns and reducing stigma on mental health " +
		"through storytelling.Alternatively the movement also addresses poverty as a cause of mental health issues in Kenya through the Fancied Families Project.",
	navItems: [
		{
			label: "Home",
			href: "/",
		},
    {
      label: "Gallery",
      href: "/gallery",
    },
    {
      label: "This Month",
      href: "/campaign",
    },
    {
      label: "Impact",
      href: "/impact",
    },
    {
      label: "About",
      href: "/#LearnMore",
    }
		,
		{
			label: "Team",
			href: "/team",
		}
	],
	navMenuItems: [
		{
			label: "Home",
			href: "/",
		},
		{
			label: "Gallery",
			href: "/gallery",
		},
		{
			label: "This Month",
			href: "/campaign",
		},
		{
			label: "Impact",
			href: "/impact",
		},
		{
			label: "About",
			href: "/#LearnMore",
		}
		,
		{
			label: "Team",
			href: "/team",
		}
	],
	links: {
		instagram:"https://www.instagram.com/fanciedstorynetwork",
		linktoJoin:"https://docs.google.com/forms/d/e/1FAIpQLSflLlm9o1twUFiRXBdlPoHOq0xhcerXvmQoRAmuUMEGJ9d1hQ/viewform?usp=sf_link ",
		github: "https://github.com/nextui-org/nextui",
		twitter: "https://twitter.com/fanciedstory",
    sponsor: "https://paydexp.com/niskizee-match-day"
	},
};
