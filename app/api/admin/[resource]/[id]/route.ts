import {errorResponse, getResource, requireAdmin, updateRecord} from "@/lib/adminData";

type Context = {params: {resource: string; id: string}};

export async function PATCH(request: Request, {params}: Context) {
	try {
		await requireAdmin(request);
		const record = await updateRecord(getResource(params.resource), params.id, await request.json());
		return Response.json(record);
	} catch (error) {
		return errorResponse(error);
	}
}
