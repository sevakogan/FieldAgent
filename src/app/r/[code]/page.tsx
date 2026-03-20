import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  readonly params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "Join KleanHQ — Skip the Waitlist",
    description:
      "Schedule jobs, dispatch workers, get paid automatically. Use this referral link to skip the line.",
    openGraph: {
      title: "Join KleanHQ — Skip the Waitlist",
      description:
        "The simplest field service platform. Join the waitlist and skip the line with this referral link.",
      type: "website",
      url: `https://kleanhq.com/r/${code}`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Join KleanHQ — Skip the Waitlist",
      description:
        "The simplest field service platform. Use this referral link to skip the line.",
    },
  };
}

export default async function ReferralRedirect({ params }: Props) {
  const { code } = await params;
  redirect(`/?ref=${encodeURIComponent(code)}`);
}
