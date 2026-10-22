import { sharedPhoto, imageResponse, route } from "@/lib/store";
export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) { return route(async () => imageResponse(await sharedPhoto((await context.params).token))); }
