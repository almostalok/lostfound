import { prisma } from "@/lib/prisma";
import { CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VerifyResultPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { foundItem: true }
  });

  if (!match) {
    redirect("/browse");
  }

  const isVerified = match.status === 'verified';
  const isRejected = match.status === 'rejected';

  if (!isVerified && !isRejected) {
    // If it's still pending, somehow they got here without submitting
    redirect(`/verify/${matchId}`);
  }

  return (
    <div className="max-w-md mx-auto py-24 text-center">
      {isVerified ? (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-900">Ownership Verified</h1>
          <p className="text-neutral-600 leading-relaxed">
            Congratulations! The AI has successfully verified your answers against the hidden details of the found item.
          </p>
          
          <div className="bg-white border border-neutral-200 rounded-xl p-6 mt-8 shadow-sm">
            <p className="text-sm font-medium text-neutral-900 mb-4">You can now contact the finder securely.</p>
            <Link href={`/chat/${matchId}`} className="w-full flex justify-center items-center gap-2 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors">
              <MessageSquare className="w-4 h-4" />
              Open Secure Chat
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-900">Verification Failed</h1>
          <p className="text-neutral-600 leading-relaxed">
            Unfortunately, your answers did not match the hidden details provided by the finder. To prevent false claims, this match has been rejected.
          </p>
        </div>
      )}

      <div className="mt-10">
        <Link href="/browse" className="text-sm text-neutral-500 hover:text-neutral-900 underline underline-offset-4">
          Return to Browse
        </Link>
      </div>
    </div>
  );
}
