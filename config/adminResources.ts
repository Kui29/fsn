// Data sets admins can view, export and edit. Shared by the admin page and the admin API,
// so adding a field here makes it appear in the table, the form and the CSV export.

export type FieldType = "text" | "longtext" | "number" | "boolean" | "date" | "list" | "password";

export type AdminField = {
	name: string;
	type: FieldType;
	required?: boolean;
};

export type AdminResource = {
	label: string;
	source: "prisma" | "firestore";
	// Prisma model delegate name, or Firestore collection name
	collection: string;
	idField: string;
	fields: AdminField[];
};

export const adminResources: Record<string, AdminResource> = {
	users: {
		label: "Users",
		source: "prisma",
		collection: "user",
		idField: "uid",
		fields: [
			{name: "first_name", type: "text", required: true},
			{name: "middle_name", type: "text"},
			{name: "last_name", type: "text", required: true},
			{name: "user_name", type: "text", required: true},
			{name: "email", type: "text", required: true},
			{name: "phone_number", type: "text", required: true},
			{name: "gender", type: "text", required: true},
			{name: "birthday", type: "date", required: true},
			{name: "reason", type: "longtext", required: true},
			{name: "profession", type: "text"},
			{name: "university", type: "text"},
			{name: "degree", type: "text"},
			{name: "interests", type: "list"},
			{name: "is_team", type: "boolean"},
			{name: "photo_url", type: "text"},
			{name: "group_id", type: "text"},
			{name: "password", type: "password", required: true},
		],
	},
	groups: {
		label: "Buddy groups",
		source: "prisma",
		collection: "buddyGroup",
		idField: "uid",
		fields: [{name: "group_name", type: "text", required: true}],
	},
	campaigns: {
		label: "Campaigns",
		source: "prisma",
		collection: "campaign",
		idField: "uid",
		fields: [
			{name: "campaign_name", type: "text", required: true},
			{name: "start_date", type: "date", required: true},
			{name: "end_date", type: "date", required: true},
			{name: "creator_id", type: "text", required: true},
		],
	},
	events: {
		label: "Events",
		source: "prisma",
		collection: "event",
		idField: "uid",
		fields: [
			{name: "event_name", type: "text", required: true},
			{name: "start_date", type: "date", required: true},
			{name: "end_date", type: "date", required: true},
			{name: "campaign_id", type: "text", required: true},
		],
	},
	photos: {
		label: "Campaign photos",
		source: "prisma",
		collection: "campaignPhoto",
		idField: "uid",
		fields: [
			{name: "url", type: "text", required: true},
			{name: "caption", type: "text"},
			{name: "is_main", type: "boolean", required: true},
			{name: "campaign_id", type: "text", required: true},
			{name: "creator_id", type: "text", required: true},
		],
	},
	points: {
		label: "Points",
		source: "prisma",
		collection: "point",
		idField: "uid",
		fields: [
			{name: "user_id", type: "text", required: true},
			{name: "points_earned", type: "number", required: true},
			{name: "reason", type: "text", required: true},
			{name: "given_by", type: "text", required: true},
		],
	},
	stories: {
		label: "Stories",
		source: "firestore",
		collection: "stories",
		idField: "id",
		fields: [
			{name: "name", type: "text", required: true},
			{name: "letter", type: "longtext"},
			{name: "letterPath", type: "text"},
			{name: "userPicPath", type: "text"},
			{name: "approved", type: "boolean"},
		],
	},
};
