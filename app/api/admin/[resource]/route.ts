import {createRecord, errorResponse, getResource, listRecords, requireAdmin, toCsv} from "@/lib/adminData";

type Context = {params: {resource: string}};

// GET /api/admin/users          → JSON list
// GET /api/admin/users?format=csv → spreadsheet download
export async function GET(request: Request, {params}: Context) {
	try {
		await requireAdmin(request);
		const resource = getResource(params.resource);
		const rows = await listRecords(resource);

		if (new URL(request.url).searchParams.get("format") !== "csv") return Response.json(rows);
		return new Response(toCsv(rows), {
			headers: {
				"Content-Type": "text/csv; charset=utf-8",
				"Content-Disposition": `attachment; filename="${params.resource}.csv"`,
			},
		});
	} catch (error) {
		return errorResponse(error);
	}
}

export async function POST(request: Request, {params}: Context) {
	try {
		await requireAdmin(request);
		const record = await createRecord(getResource(params.resource), await request.json());
		return Response.json(record, {status: 201});
	} catch (error) {
		return errorResponse(error);
	}
}
