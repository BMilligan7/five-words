import FeedbackForm from "@/components/feedback-form";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ token: string }> }) { return <FeedbackForm token={(await params).token}/>; }
