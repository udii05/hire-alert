import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — Hire Alert" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold font-heading mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-mono-label text-primary mb-3">Company</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: October 2026</p>

        <div className="mb-10 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-muted-foreground">
          Draft notice: these terms are a working draft for the beta and should be reviewed by a
          legal professional before public launch.
        </div>

        <Section title="1. Acceptance of terms">
          <p>
            By creating an account or using Hire Alert, you agree to these terms. If you do not
            agree, please do not use the service.
          </p>
        </Section>

        <Section title="2. The service">
          <p>
            Hire Alert aggregates publicly available opportunity listings (jobs, internships,
            hackathons, scholarships, competitions, freelance engagements), scores them against
            your profile, and surfaces recommendations and deadline alerts. We are a discovery
            and tracking tool — we are not a recruiter, an employment agency, or the source of
            any listing.
          </p>
        </Section>

        <Section title="3. No guarantee of accuracy">
          <p>
            Listings are aggregated from third-party sources and may change, expire, or contain
            errors. Fit scores are algorithmic estimates, not endorsements. Always verify
            opportunity details, deadlines, and eligibility on the original source before
            applying. We are not responsible for the content, availability, or outcomes of any
            third-party listing.
          </p>
        </Section>

        <Section title="4. Your account">
          <p>
            You must provide accurate information, keep your credentials secure, and are
            responsible for activity under your account. One person per account — do not share
            logins.
          </p>
        </Section>

        <Section title="5. Acceptable use">
          <p>You agree not to:</p>
          <p>• Use the service for any unlawful purpose or to post fraudulent content.</p>
          <p>• Attempt to disrupt, reverse-engineer, or circumvent rate limits and access controls.</p>
          <p>• Scrape or bulk-download our aggregated data without written permission.</p>
          <p>• Impersonate others or misrepresent your affiliation with employers or events.</p>
        </Section>

        <Section title="6. Your data and content">
          <p>
            You own the profile data and content you provide. You grant us a limited license to
            store and process it solely to operate the service as described in our Privacy
            Policy. You may request deletion at any time.
          </p>
        </Section>

        <Section title="7. Intellectual property">
          <p>
            The Hire Alert platform, including its software, design, and matching system, is
            owned by us and protected by applicable law. Source code available in our public
            repository is governed by its license.
          </p>
        </Section>

        <Section title="8. Beta disclaimer">
          <p>
            The service is provided "as is" during beta. We do not warrant uninterrupted or
            error-free operation, and features may change or disappear without notice.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the maximum extent permitted by law, we are not liable for indirect or
            consequential damages arising from your use of the service, including missed
            deadlines or decisions made based on aggregated listings.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            You may close your account at any time. We may suspend or terminate accounts that
            violate these terms, with notice where reasonable.
          </p>
        </Section>

        <Section title="11. Changes">
          <p>
            We may update these terms; material changes will be announced by email or in-app
            notice before taking effect.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>Questions about these terms: hello@hire-alert.com.</p>
        </Section>
      </div>
    </section>
  );
}
