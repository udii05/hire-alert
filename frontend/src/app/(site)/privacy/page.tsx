import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Hire Alert" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold font-heading mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-mono-label text-primary mb-3">Company</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: October 2026</p>

        <div className="mb-10 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-muted-foreground">
          Draft notice: this policy is a working draft for the beta and should be reviewed by a
          legal professional before public launch.
        </div>

        <Section title="1. Who we are">
          <p>
            Hire Alert ("we", "us") operates the Hire Alert platform at hire-alert.vercel.app.
            This policy explains what personal data we collect, why, and what rights you have.
          </p>
        </Section>

        <Section title="2. Data we collect">
          <p><strong className="text-foreground">Account data:</strong> your name, email address, and profile picture when you sign in with Google or GitHub, or your email and a hashed password when you register directly. We never store plaintext passwords.</p>
          <p><strong className="text-foreground">Professional profile:</strong> skills, education, experience, preferences, and optional links (portfolio, GitHub, LinkedIn) that you choose to provide.</p>
          <p><strong className="text-foreground">Resume file:</strong> only if you upload one. It is stored and used solely to support your profile.</p>
          <p><strong className="text-foreground">Activity data:</strong> opportunities you save, apply to, or dismiss, and your notification history.</p>
        </Section>

        <Section title="3. How we use your data">
          <p>Your profile data is used exclusively to compute fit scores and eligibility for opportunities, and to deliver alerts you have enabled. We do not sell personal data, and we do not share it with employers or third-party platforms. Aggregated, non-identifiable statistics may be used to improve the service.</p>
        </Section>

        <Section title="4. Third-party sources">
          <p>Opportunity listings are aggregated from publicly available sources. These listings contain no personal data about you; they are public information about employers and events.</p>
        </Section>

        <Section title="5. Email communications">
          <p>We send deadline alerts and digests only for opportunities you have saved or that match your profile, when email alerts are enabled. Every email includes a way to manage or stop notifications.</p>
        </Section>

        <Section title="6. Storage and security">
          <p>Data is stored in managed PostgreSQL databases with access restricted to the application. Passwords are hashed with bcrypt. OAuth tokens are stored encrypted at rest. We apply industry-standard safeguards but cannot guarantee absolute security.</p>
        </Section>

        <Section title="7. Retention and deletion">
          <p>We retain your data while your account is active. You can edit or delete any profile field at any time. To close your account and erase your data, contact us at hello@hire-alert.com; we will delete your account, profile, resume, applications, and notifications within 30 days.</p>
        </Section>

        <Section title="8. Your rights">
          <p>Depending on your jurisdiction, you may have rights to access, correct, export, or delete your personal data, and to object to certain processing. Contact us to exercise any of these rights.</p>
        </Section>

        <Section title="9. Changes">
          <p>If we make material changes to this policy, we will notify you by email or in-app before they take effect.</p>
        </Section>

        <Section title="10. Contact">
          <p>Questions about this policy: hello@hire-alert.com.</p>
        </Section>
      </div>
    </section>
  );
}
