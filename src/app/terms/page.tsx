import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions — KleanHQ",
  description: "KleanHQ terms and conditions governing use of the platform.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 16, 2026</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <Section title="1. Agreement to Terms">
          <p>
            By accessing or using KleanHQ ("the Service"), operated by TheLevelTeam LLC
            ("we", "us", "our"), you agree to be bound by these Terms and Conditions. If you
            do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            KleanHQ is a field service management platform that enables businesses to
            manage leads, clients, jobs, scheduling, and revenue. The Service includes a web
            application and SMS notifications.
          </p>
        </Section>

        <Section title="3. Account Registration">
          <p>To use KleanHQ, you must:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Be at least 18 years of age.</li>
            <li>Provide accurate and complete registration information.</li>
            <li>Maintain the security of your account credentials.</li>
            <li>Notify us immediately of any unauthorized use of your account.</li>
          </ul>
          <p className="mt-3">
            You are responsible for all activity that occurs under your account.
          </p>
        </Section>

        <Section title="4. SMS Messaging Terms">
          <p>
            By providing your phone number and creating an account, you consent to receive
            SMS messages from KleanHQ. This is a core part of how the Service operates.
          </p>

          <div className="mt-3 rounded-lg bg-gray-100 p-4 space-y-2">
            <p>
              <strong>Program Name:</strong> KleanHQ Notifications
            </p>
            <p>
              <strong>Message Types:</strong> Task assignments, status updates, schedule
              changes, and one-time referral invitations.
            </p>
            <p>
              <strong>Message Frequency:</strong> Varies based on your usage and activity.
            </p>
            <p>
              <strong>Message and Data Rates:</strong> May apply. Contact your carrier for
              details.
            </p>
            <p>
              <strong>Opt-Out:</strong> Reply <strong>STOP</strong> to any message to
              unsubscribe from SMS notifications.
            </p>
            <p>
              <strong>Help:</strong> Reply <strong>HELP</strong> to any message for
              assistance, or contact support@kleanhq.com.
            </p>
            <p>
              <strong>Opt-In:</strong> Reply <strong>START</strong> to re-subscribe to SMS
              notifications.
            </p>
          </div>

          <p className="mt-3">
            Carriers (T-Mobile, AT&T, Verizon, etc.) are not liable for delayed or
            undelivered messages. We do not send advertising or promotional messages.
          </p>
        </Section>

        <Section title="5. Referral Invitations">
          <p>
            Existing users may invite others to KleanHQ by providing their phone number.
            Invitees will receive a <strong>single, one-time SMS invitation</strong>. By
            submitting someone&apos;s phone number for a referral, you confirm that you have
            their consent to be contacted.
          </p>
        </Section>

        <Section title="6. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the Service for any unlawful purpose.</li>
            <li>Attempt to gain unauthorized access to other accounts or systems.</li>
            <li>Interfere with or disrupt the Service.</li>
            <li>Submit false, misleading, or fraudulent information.</li>
            <li>Use the Service to send spam or unsolicited messages.</li>
            <li>Reverse-engineer, decompile, or disassemble the Service.</li>
          </ul>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            All content, features, and functionality of KleanHQ — including text,
            graphics, logos, and software — are owned by TheLevelTeam LLC and protected by
            intellectual property laws. You may not copy, modify, or distribute any part of
            the Service without our written consent.
          </p>
        </Section>

        <Section title="8. Data and Privacy">
          <p>
            Your use of KleanHQ is also governed by our{" "}
            <a href="/privacy" className="text-blue-600 underline hover:text-blue-800">
              Privacy Policy
            </a>
            , which describes how we collect, use, and protect your information.
          </p>
        </Section>

        <Section title="9. Service Availability">
          <p>
            We strive to keep KleanHQ available at all times but do not guarantee
            uninterrupted access. We may modify, suspend, or discontinue the Service at any
            time without notice. We are not liable for any downtime or service interruptions.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, TheLevelTeam LLC shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages arising
            from your use of KleanHQ. Our total liability shall not exceed the amount you
            paid us in the 12 months preceding the claim.
          </p>
        </Section>

        <Section title="11. Indemnification">
          <p>
            You agree to indemnify and hold harmless TheLevelTeam LLC, its officers,
            employees, and agents from any claims, damages, or expenses arising from your use
            of the Service or violation of these Terms.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            We may suspend or terminate your account at any time for violation of these
            Terms. You may delete your account at any time by contacting us. Upon
            termination, your right to use the Service ceases immediately.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms are governed by the laws of the State of Florida, without regard to
            conflict of law principles. Any disputes shall be resolved in the courts of
            Miami-Dade County, Florida.
          </p>
        </Section>

        <Section title="14. Changes to Terms">
          <p>
            We may update these Terms from time to time. We will notify you of material
            changes via the app or email. Continued use of KleanHQ after changes
            constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="15. Contact Us">
          <p>For questions about these Terms, contact us at:</p>
          <p className="mt-2">
            <strong>TheLevelTeam LLC</strong>
            <br />
            Email: support@kleanhq.com
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
