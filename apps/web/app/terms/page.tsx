import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Paintpile',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-foreground">
      <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>
      <p className="mb-4 text-sm text-muted-foreground">Last updated: April 5, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By using Paintpile (&quot;the Service&quot;), you agree to these Terms of Service. If you do not agree, do not use the Service.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. Account</h2>
          <p>You must be at least 13 years old to create an account. You are responsible for maintaining the security of your account and all activity that occurs under it.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. User Content</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>You retain ownership of all content you upload to Paintpile (photos, recipes, posts, etc.).</li>
            <li>By posting content publicly, you grant Paintpile a non-exclusive license to display it on the platform and in promotional materials.</li>
            <li>You must not upload content that you do not have the right to share.</li>
            <li>You must not upload illegal, abusive, or explicitly sexual content. Miniature figures with artistic nudity consistent with the tabletop hobby are permitted.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. AI Features</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>AI critiques, paint suggestions, and other AI-generated content are provided for entertainment and educational purposes only.</li>
            <li>AI results may be inaccurate. Paintpile is not responsible for decisions made based on AI output.</li>
            <li>Images submitted for AI analysis are processed by third-party AI providers (Anthropic, Replicate) under their respective usage policies.</li>
            <li>AI credits are consumed per use and are non-refundable. Unused credits do not roll over between months.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Subscriptions and Payments</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Pro subscriptions are billed monthly through Stripe.</li>
            <li>You may cancel your subscription at any time. Access continues until the end of your billing period.</li>
            <li>Prices may change with 30 days notice.</li>
            <li>Refunds are handled on a case-by-case basis.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">6. Prohibited Conduct</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Harassment, hate speech, or abuse of other users</li>
            <li>Spamming, botting, or automated scraping</li>
            <li>Attempting to exploit, hack, or disrupt the Service</li>
            <li>Circumventing AI credit limits or subscription restrictions</li>
            <li>Impersonating other users or entities</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">7. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
          <p>Paintpile is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the Service, including loss of data, revenue, or profits.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">9. Changes</h2>
          <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">10. Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:support@thepaintpile.com" className="text-primary hover:underline">support@thepaintpile.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
