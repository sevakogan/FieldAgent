import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FieldAgent",
  description: "FieldAgent privacy policy. How we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 16, 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <Section title="1. Who We Are">
          <p>
            FieldAgent is operated by TheLevelTeam LLC ("we", "us", "our"). We provide a
            field service management platform that helps businesses manage leads, clients,
            jobs, and revenue.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Account information:</strong> Name, email address, phone number, and
              business details provided during registration.
            </li>
            <li>
              <strong>Usage data:</strong> How you interact with FieldAgent, including pages
              visited, features used, and actions taken.
            </li>
            <li>
              <strong>Device information:</strong> Browser type, operating system, and device
              identifiers.
            </li>
            <li>
              <strong>Communications:</strong> Messages sent and received through the platform,
              including SMS notifications.
            </li>
            <li>
              <strong>Referral information:</strong> When an existing user invites someone, we
              collect the invitee&apos;s name and phone number to send a one-time invitation.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide, maintain, and improve the FieldAgent platform.</li>
            <li>Send operational notifications (task assignments, status updates, schedule changes).</li>
            <li>Send one-time referral invitations on behalf of existing users.</li>
            <li>Respond to your requests and provide customer support.</li>
            <li>Ensure security and prevent fraud.</li>
          </ul>
          <p className="mt-3">
            <strong>We do not sell your personal information.</strong> We do not use your phone
            number for advertising or promotional marketing.
          </p>
        </Section>

        <Section title="4. SMS Messaging">
          <p>
            By creating an account and providing your phone number, you consent to receive
            SMS messages from FieldAgent. These messages include:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Task assignment and status notifications</li>
            <li>Schedule updates and reminders</li>
            <li>One-time referral invitations (sent when an existing user invites you)</li>
          </ul>
          <p className="mt-3">
            <strong>Message frequency varies</strong> based on your activity. Message and data
            rates may apply. Carriers are not liable for delayed or undelivered messages.
          </p>
          <p className="mt-3">
            You can opt out at any time by replying <strong>STOP</strong> to any message. Reply{" "}
            <strong>HELP</strong> for assistance. You may also opt back in by replying{" "}
            <strong>START</strong>.
          </p>
        </Section>

        <Section title="5. Data Sharing">
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Service providers:</strong> Third-party services that help us operate
              FieldAgent (e.g., hosting, SMS delivery via Twilio, analytics).
            </li>
            <li>
              <strong>Legal requirements:</strong> When required by law, regulation, or legal
              process.
            </li>
            <li>
              <strong>Business transfers:</strong> In connection with a merger, acquisition, or
              sale of assets.
            </li>
          </ul>
          <p className="mt-3">
            We do not share your information with third parties for their marketing purposes.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p>
            We implement industry-standard security measures to protect your data, including
            encryption in transit and at rest, access controls, and regular security reviews.
            However, no method of transmission over the internet is 100% secure.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain your information for as long as your account is active or as needed to
            provide services. You may request deletion of your account and associated data by
            contacting us.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your information.</li>
            <li>Opt out of SMS communications at any time.</li>
          </ul>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            FieldAgent is not intended for use by anyone under the age of 18. We do not
            knowingly collect information from children.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this policy from time to time. We will notify you of significant
            changes via the app or email. Continued use of FieldAgent after changes
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have questions about this privacy policy or your data, contact us at:
          </p>
          <p className="mt-2">
            <strong>TheLevelTeam LLC</strong>
            <br />
            Email: support@fieldagent.app
            <br />
            Phone: +1 (786) 655-4411
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}
