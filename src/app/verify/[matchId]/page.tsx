import { generateVerificationQuestions, verifyAnswers } from "../../actions";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  
  // In a real app, you might want to cache these questions or store them in DB 
  // so they don't regenerate on every refresh, but for this demo we generate them.
  const questions = await generateVerificationQuestions(matchId);

  async function handleVerify(formData: FormData) {
    "use server";
    const answer1 = formData.get("answer0") as string;
    const answer2 = formData.get("answer1") as string;
    
    await verifyAnswers(matchId, questions, [answer1, answer2]);
    redirect(`/verify/${matchId}/result`);
  }

  return (
    <div className="max-w-xl mx-auto py-16">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900">Verify Ownership</h1>
        <p className="text-neutral-500 dark:text-neutral-500 mt-3 leading-relaxed">
          To protect against false claims, our AI has generated questions based on hidden details provided by the finder. Answer them accurately to unlock communication.
        </p>
      </div>

      <form action={handleVerify} className="space-y-8 bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
        {questions.map((q, idx) => (
          <div key={idx} className="space-y-3">
            <label className="block text-sm font-medium text-neutral-900">
              <span className="text-amber-600 font-bold mr-2">Q{idx + 1}.</span> 
              {q}
            </label>
            <textarea 
              name={`answer${idx}`} 
              required 
              rows={3} 
              placeholder="Your answer..." 
              className="w-full bg-white text-neutral-900 placeholder:text-neutral-500 caret-neutral-900 px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all resize-none"
            ></textarea>
          </div>
        ))}

        <div className="pt-4 border-t border-neutral-100">
          <button type="submit" className="w-full py-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-xl font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            Submit Answers for AI Evaluation
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <Link href="/browse" className="text-sm text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 underline underline-offset-4">
          Back to Browse
        </Link>
      </div>
    </div>
  );
}
