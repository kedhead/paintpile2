import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Paintpile',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-foreground">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-4 text-sm text-muted-foreground">Last updated: April 5, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>When you create an account on Paintpile, we collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Account information:</strong> email address, display name, and profile photo. If you sign in with Google, we receive your name, email, and profile picture from Google.</li>
            <li><strong>Content you create:</strong> project photos, paint libraries, recipes, comments, posts, and AI critique results.</li>
            <li><strong>Usage data:</strong> pages visited, features used, and AI credit consumption to improve our service.</li>
            <li><strong>Device information:</strong> when using our mobile app, we may collect device type, OS version, and push notification tokens to deliver notifications.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To provide and maintain the Paintpile service</li>
            <li>To process your AI feature requests (images are sent to Anthropic&apos;s API for analysis and are not stored by Anthropic)</li>
            <li>To send push notifications you&apos;ve opted into (likes, comments, follows)</li>
            <li>To process payments through Stripe for Pro subscriptions</li>
            <li>To display your public projects and profile to other users</li>
            <li>To show relevant ads to free-tier users (Pro subscribers see no ads)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Google OAuth:</strong> for account authentication</li>
            <li><strong>Anthropic (Claude AI):</strong> for AI-powered critiques, paint suggestions, and technique advice. Images sent for analysis are processed per Anthropic&apos;s API usage policy and are not used to train models.</li>
            <li><strong>Stripe:</strong> for payment processing. We do not store your credit card details.</li>
            <li><strong>Expo Push Notifications:</strong> for delivering mobile notifications</li>
            <li><strong>Replicate:</strong> for AI image processing (upscaling, recoloring)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Data Storage and Security</h2>
          <p>Your data is stored on our self-hosted servers. We use HTTPS encryption for all data in transit. Passwords are hashed and never stored in plain text. We take reasonable measures to protect your data, but no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Your Rights</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Access:</strong> You can view all your data through your profile and settings.</li>
            <li><strong>Export:</strong> You can export your data from Settings.</li>
            <li><strong>Delete:</strong> You can delete individual projects, photos, and posts. To delete your entire account, contact us.</li>
            <li><strong>Opt out:</strong> You can disable push notifications at any time in your device settings or notification preferences.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">6. User-Generated Content</h2>
          <p>Paintpile is a community for miniature painting hobbyists. Users may upload photos of painted miniatures, some of which may depict fantasy or sci-fi figures. While we do not allow explicit content, some miniature figures may feature artistic nudity consistent with the hobby. Users can report inappropriate content.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">7. Children&apos;s Privacy</h2>
          <p>Paintpile is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us so we can delete it.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">8. Cookies</h2>
          <p>We use a single authentication cookie (<code>pb_auth</code>) to keep you logged in. We do not use tracking cookies. Third-party ad providers on the free tier may set their own cookies.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">9. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify users of significant changes via email or in-app notification.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">10. Contact</h2>
          <p>If you have questions about this privacy policy or your data, contact us at <a href="mailto:support@thepaintpile.com" className="text-primary hover:underline">support@thepaintpile.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
