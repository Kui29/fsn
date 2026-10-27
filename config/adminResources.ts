// Data sets admins can view, export and edit. Shared by the admin page and the admin API,
// so adding a field here makes it appear in the table, the form and the CSV export.
// Every data set starts with a name, date, details and photo/video, then its own fields.

export type FieldType = "text" | "longtext" | "number" | "boolean" | "date" | "list" | "password" | "media" | "reference";

export type AdminField = {
	name: string;
	type: FieldType;
	label?: string;
	required?: boolean;
	// For "reference" fields: the data set whose ID this field holds
	references?: string;
};

export type AdminResource = {
	label: string;
	source: "prisma" | "firestore";
	// Prisma model delegate name, or Firestore collection name
	collection: string;
	idField: string;
	// Field shown when another data set links to this one
	nameField: string;
	fields: AdminField[];
};

export const fieldLabel = (field: AdminField) => field.label ?? field.name;

export const adminResources: Record<string, AdminResource> = {
	users: {
		label: "Users",
		source: "prisma",
		collection: "user",
		idField: "uid",
		nameField: "email",
		fields: [
			{name: "first_name", label: "First name", type: "text", required: true},
			{name: "birthday", label: "Date of birth", type: "date", required: true},
			{name: "reason", label: "Details (reason for joining)", type: "longtext", required: true},
			{name: "photo_url", label: "Photo or video", type: "media"},
			{name: "middle_name", label: "Middle name", type: "text"},
			{name: "last_name", label: "Last name", type: "text", required: true},
			{name: "user_name", label: "Username", type: "text", required: true},
			{name: "email", label: "Email", type: "text", required: true},
			{name: "phone_number", label: "Phone number", type: "text", required: true},
			{name: "gender", label: "Gender", type: "text", required: true},
			{name: "profession", label: "Profession", type: "text"},
			{name: "university", label: "University", type: "text"},
			{name: "degree", label: "Degree", type: "text"},
			{name: "interests", label: "Interests", type: "list"},
			{name: "is_team", label: "Team member", type: "boolean"},
			{name: "group_id", label: "Buddy group", type: "reference", references: "groups"},
			{name: "password", label: "Password", type: "password", required: true},
		],
	},
	groups: {
		label: "Buddy groups",
		source: "prisma",
		collection: "buddyGroup",
		idField: "uid",
		nameField: "group_name",
		fields: [
			{name: "group_name", label: "Name", type: "text", required: true},
			{name: "date", label: "Date", type: "date"},
			{name: "details", label: "Details", type: "longtext"},
			{name: "media_url", label: "Photo or video", type: "media"},
		],
	},
	campaigns: {
		label: "Campaigns",
		source: "prisma",
		collection: "campaign",
		idField: "uid",
		nameField: "campaign_name",
		fields: [
			{name: "campaign_name", label: "Name", type: "text", required: true},
			{name: "start_date", label: "Start date", type: "date", required: true},
			{name: "end_date", label: "End date", type: "date", required: true},
			{name: "details", label: "Details", type: "longtext"},
			{name: "media_url", label: "Photo or video", type: "media"},
			{name: "creator_id", label: "Created by", type: "reference", references: "users", required: true},
		],
	},
	events: {
		label: "Events",
		source: "prisma",
		collection: "event",
		idField: "uid",
		nameField: "event_name",
		fields: [
			{name: "event_name", label: "Name", type: "text", required: true},
			{name: "start_date", label: "Start date", type: "date", required: true},
			{name: "end_date", label: "End date", type: "date", required: true},
			{name: "details", label: "Details", type: "longtext"},
			{name: "media_url", label: "Photo or video", type: "media"},
			{name: "campaign_id", label: "Campaign", type: "reference", references: "campaigns", required: true},
		],
	},
	photos: {
		label: "Campaign photos",
		source: "prisma",
		collection: "campaignPhoto",
		idField: "uid",
		nameField: "caption",
		fields: [
			{name: "caption", label: "Name", type: "text"},
			{name: "date", label: "Date", type: "date"},
			{name: "details", label: "Details", type: "longtext"},
			{name: "url", label: "Photo or video", type: "media", required: true},
			{name: "is_main", label: "Main photo for the campaign", type: "boolean", required: true},
			{name: "campaign_id", label: "Campaign", type: "reference", references: "campaigns", required: true},
			{name: "creator_id", label: "Added by", type: "reference", references: "users", required: true},
		],
	},
	points: {
		label: "Points",
		source: "prisma",
		collection: "point",
		idField: "uid",
		nameField: "name",
		fields: [
			{name: "name", label: "Name", type: "text"},
			{name: "given_at", label: "Date", type: "date"},
			{name: "reason", label: "Details (reason)", type: "longtext", required: true},
			{name: "media_url", label: "Photo or video", type: "media"},
			{name: "points_earned", label: "Points", type: "number", required: true},
			{name: "user_id", label: "Given to", type: "reference", references: "users", required: true},
			{name: "given_by", label: "Given by", type: "text", required: true},
		],
	},
	stories: {
		label: "Stories",
		source: "firestore",
		collection: "stories",
		idField: "id",
		nameField: "name",
		fields: [
			{name: "name", label: "Name", type: "text", required: true},
			{name: "date", label: "Date", type: "date"},
			{name: "letter", label: "Details (story)", type: "longtext"},
			{name: "userPicPath", label: "Photo or video", type: "media"},
			{name: "letterPath", label: "Letter image", type: "media"},
			{name: "approved", label: "Approved", type: "boolean"},
		],
	},
};
