import {Prisma} from "@prisma/client";
import bcrypt from "bcryptjs";
import {AdminResource, adminResources} from "@/config/adminResources";
import {adminAuth, adminDb} from "@/lib/firebaseAdmin";
import {prisma} from "@/lib/prisma";

type Row = Record<string, unknown>;

export class AdminError extends Error {
	constructor(message: string, public status: number) {
		super(message);
	}
}

// Checks the Firebase ID token sent by the admin page and that its email is in ADMIN_EMAILS
export async function requireAdmin(request: Request): Promise<string> {
	const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
	if (!token) throw new AdminError("Please sign in", 401);

	const user = await adminAuth().verifyIdToken(token).catch(() => null);
	const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase());
	if (!user?.email || !user.email_verified || !allowed.includes(user.email.toLowerCase())) {
		throw new AdminError("This account is not an admin", 403);
	}
	return user.email;
}

export function getResource(name: string): AdminResource {
	const resource = adminResources[name];
	if (!resource) throw new AdminError(`Unknown data set: ${name}`, 404);
	return resource;
}

// Keeps only known fields and converts form values to the types the database expects
async function parseInput(resource: AdminResource, input: Row, isCreate: boolean): Promise<Row> {
	const data: Row = {};
	for (const field of resource.fields) {
		const value = input[field.name];
		const isEmpty = value === undefined || value === null || value === "";
		// A blank password on update keeps the current one
		if (!isCreate && field.type === "password" && isEmpty) continue;
		if (isEmpty && field.required && (isCreate || value !== undefined)) {
			throw new AdminError(`${field.name} is required`, 400);
		}
		// Fields that were not sent keep their current or default value
		if (value === undefined) continue;
		data[field.name] = isEmpty ? null : await convert(field.type, value);
	}
	return data;
}

async function convert(type: string, value: unknown): Promise<unknown> {
	switch (type) {
		case "number": {
			const num = Number(value);
			if (Number.isNaN(num)) throw new AdminError(`"${value}" is not a number`, 400);
			return num;
		}
		case "boolean":
			return value === true || value === "true";
		case "date": {
			const date = new Date(String(value));
			if (Number.isNaN(date.getTime())) throw new AdminError(`"${value}" is not a date`, 400);
			return date;
		}
		case "list":
			return Array.isArray(value) ? value : String(value).split(",").map(s => s.trim()).filter(Boolean);
		case "password":
			return bcrypt.hash(String(value), 10);
		default:
			return String(value);
	}
}

// Prisma delegates share these methods; typing them loosely lets one code path serve every model
function prismaModel(resource: AdminResource) {
	return (prisma as any)[resource.collection];
}

function prismaSelect(resource: AdminResource) {
	const select: Record<string, boolean> = {[resource.idField]: true};
	resource.fields.filter(f => f.type !== "password").forEach(f => (select[f.name] = true));
	return select;
}

export async function listRecords(resource: AdminResource): Promise<Row[]> {
	if (resource.source === "prisma") {
		return prismaModel(resource).findMany({select: prismaSelect(resource)});
	}
	const snapshot = await adminDb().collection(resource.collection).get();
	return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
}

export async function createRecord(resource: AdminResource, input: Row): Promise<Row> {
	const data = await parseInput(resource, input, true);
	if (resource.source === "prisma") {
		return prismaModel(resource).create({data, select: prismaSelect(resource)});
	}
	const ref = await adminDb().collection(resource.collection).add(data);
	return {id: ref.id, ...data};
}

export async function updateRecord(resource: AdminResource, id: string, input: Row): Promise<Row> {
	const data = await parseInput(resource, input, false);
	if (resource.source === "prisma") {
		return prismaModel(resource).update({
			where: {[resource.idField]: id},
			data,
			select: prismaSelect(resource),
		});
	}
	const ref = adminDb().collection(resource.collection).doc(id);
	await ref.update(data);
	return {id, ...(await ref.get()).data()};
}

export function toCsv(rows: Row[]): string {
	const columns = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
	const lines = [columns, ...rows.map(row => columns.map(col => row[col]))];
	return lines.map(line => line.map(csvCell).join(",")).join("\n");
}

function csvCell(value: unknown): string {
	let text = value instanceof Date ? value.toISOString()
		: typeof value === "object" && value !== null ? JSON.stringify(value)
		: String(value ?? "");
	// Stop spreadsheet apps from running cell contents as formulas
	if (/^[=+\-@]/.test(text)) text = `'${text}`;
	return `"${text.replace(/"/g, '""')}"`;
}

// Plain-language messages for common database errors
const prismaErrors: Record<string, [string, number]> = {
	P2002: ["A record with that value already exists", 409],
	P2003: ["A linked record (such as a user or campaign ID) was not found", 400],
	P2025: ["That record no longer exists", 404],
};

export function errorResponse(error: unknown): Response {
	if (error instanceof AdminError) return Response.json({error: error.message}, {status: error.status});
	if (error instanceof Prisma.PrismaClientKnownRequestError && prismaErrors[error.code]) {
		const [message, status] = prismaErrors[error.code];
		return Response.json({error: message}, {status});
	}
	console.error(error);
	return Response.json({error: "Something went wrong"}, {status: 500});
}
