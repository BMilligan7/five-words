import { owner, ownedPhoto, imageResponse, route } from "@/lib/store";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) { return route(async () => imageResponse(await ownedPhoto((await context.params).id, await owner()))); }
