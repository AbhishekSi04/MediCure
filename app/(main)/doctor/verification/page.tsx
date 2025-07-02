import { ClipboardCheck, AlertCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export default async function VerificationPage() {
  // Get complete user profile
  const user = await getCurrentUser();

  // If already verified, redirect to dashboard
  if (user?.verificationStatus === "VERIFIED") {
    redirect("/doctor");
  }

  const isRejected = user?.verificationStatus === "REJECTED";

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-xl sm:max-w-2xl mx-auto">
        <Card className="border-blue-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="text-center px-4 sm:px-6">
            <div
              className={`mx-auto p-4 sm:p-5 ${
                isRejected 
                  ? "bg-red-100 dark:bg-red-900/20" 
                  : "bg-blue-100 dark:bg-blue-900/20"
              } rounded-full mb-6 w-fit`}
            >
              {isRejected ? (
                <XCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
              ) : (
                <ClipboardCheck className="h-10 w-10 text-blue-500 dark:text-blue-400" />
              )}
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {isRejected
                ? "Verification Declined"
                : "Verification in Progress"}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {isRejected
                ? "Unfortunately, your application needs revision"
                : "Thank you for submitting your information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-4 sm:px-6">
            {isRejected ? (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-start text-left gap-4">
                <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0" />
                <div className="text-slate-700 dark:text-slate-300">
                  <p className="mb-4 text-base leading-relaxed">
                    Our administrative team has reviewed your application and
                    found that it doesn&apos;t meet our current requirements.
                    Common reasons for rejection include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4 text-sm">
                    <li className="leading-relaxed">Insufficient or unclear credential documentation</li>
                    <li className="leading-relaxed">Professional experience requirements not met</li>
                    <li className="leading-relaxed">Incomplete or vague service description</li>
                    <li className="leading-relaxed">Missing required certifications or licenses</li>
                  </ul>
                  <p className="text-sm leading-relaxed">
                    You can update your application with more information and
                    resubmit for review. We&apos;re here to help you succeed!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-start text-left gap-4">
                <AlertCircle className="h-6 w-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <div className="text-slate-700 dark:text-slate-300">
                  <p className="text-base leading-relaxed">
                    Your profile is currently under review by our administrative
                    team. This process typically takes <strong>1-2 business days</strong>.
                    You&apos;ll receive an email notification once your account is
                    verified.
                  </p>
                  <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>What happens next?</strong>
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-500">
                      <li>• We verify your medical credentials and licenses</li>
                      <li>• Review your professional experience and background</li>
                      <li>• Confirm your availability and service areas</li>
                      <li>• Set up your payment and scheduling preferences</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <p className="text-slate-600 dark:text-slate-400 mb-8 text-base leading-relaxed">
              {isRejected
                ? "You can update your doctor profile and resubmit for verification. Our team is available to help you improve your application."
                : "While you wait, you can familiarize yourself with our platform or reach out to our support team if you have any questions."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
              {isRejected ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Link href="/">Return to Home</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                  >
                    <Link href="/doctor/update-profile">Update Profile</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Link href="/">Return to Home</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}