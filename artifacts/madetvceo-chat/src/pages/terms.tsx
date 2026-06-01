import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export function TermsPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to app
          </span>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          © {year} MadeTVProducts. All rights reserved. Last updated{" "}
          {new Date().toLocaleDateString()}.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Made Super AI (the "Service"), a product of
              MadeTVProducts, you agree to be bound by these Terms &amp;
              Conditions and our{" "}
              <Link href="/privacy">
                <span className="text-primary hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </Link>
              . If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              2. Ownership &amp; Copyright
            </h2>
            <p>
              The Service, including its software, design, branding, text,
              graphics, and all related materials, is owned by MadeTVProducts and
              protected by copyright, trademark, and other intellectual property
              laws. © {year} MadeTVProducts. All rights reserved. You may not
              copy, reproduce, distribute, modify, or create derivative works
              from any part of the Service without prior written permission from
              MadeTVProducts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              3. Accounts &amp; Registration
            </h2>
            <p>
              You must create an account to use the Service. Authentication is
              provided through our identity provider (Clerk). You are responsible
              for maintaining the confidentiality of your account and for all
              activity that occurs under it. You must provide accurate
              information and be at least the age of majority in your
              jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Use of the Service</h2>
            <p>
              You agree to use the Service lawfully and responsibly. You are
              responsible for any content you create, generate, or download using
              the Service, including apps, videos, and other output. You retain
              ownership of content you create, while MadeTVProducts retains all
              rights to the underlying platform and tools. You may not misuse the
              Service, attempt to circumvent usage limits, or use it to generate
              unlawful, infringing, or harmful content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              5. Subscriptions, Plans &amp; Billing
            </h2>
            <p>
              The Service is offered on paid subscription plans —{" "}
              <strong>Basic ($19.99/month)</strong>,{" "}
              <strong>Pro ($29/month)</strong>, and{" "}
              <strong>Business ($79/month)</strong>. All prices are in U.S.
              dollars and billed on a recurring monthly basis. Payments are
              processed securely by Stripe; we do not store your full card
              details. By subscribing, you authorize us and Stripe to charge your
              payment method on each renewal date until you cancel. Subscriptions
              renew automatically unless canceled before the renewal date. We may
              change plan pricing or features with reasonable notice; changes
              apply to subsequent billing periods.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              6. Usage Limits &amp; Fair Use
            </h2>
            <p>
              The Basic plan includes a monthly allowance of{" "}
              <strong>100 AI actions</strong> (each AI chat message, video
              generation step, and app build counts as one action). When the
              allowance is reached, AI features pause until your allowance resets
              at the start of the next calendar month or until you upgrade. The
              Pro and Business plans include unlimited AI actions, subject to
              fair-use and anti-abuse safeguards. We may apply reasonable
              technical limits to protect the Service and other users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              7. Cancellation &amp; Refunds
            </h2>
            <p>
              You can cancel at any time from the Account page via the Stripe
              billing portal. When you cancel, you keep access to paid features
              until the end of your current billing period; your subscription
              will not renew thereafter. Except where required by law, payments
              are non-refundable and we do not provide prorated refunds for
              partial billing periods or unused usage allowances. If you believe
              you were charged in error, contact us and we will review your
              request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              8. User Control &amp; AI Conduct
            </h2>
            <p>
              You have full control over the AI at all times. The AI is designed
              to assist you and will never attempt to override, take over, or
              alter your computer, accounts, or systems without your explicit
              consent. The AI acts only within this application and provides
              guidance for any actions performed outside it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              9. AI-Generated Content
            </h2>
            <p>
              Output produced by the Service is generated by artificial
              intelligence and is provided "as is." While we strive for high
              quality, MadeTVProducts does not guarantee the accuracy,
              completeness, or fitness of any generated content for a particular
              purpose. Review all output before relying on it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              10. Third-Party Services
            </h2>
            <p>
              The Service relies on third-party providers, including Stripe (for
              payments), Clerk (for authentication), and third-party AI model
              providers (for content generation). Your use of those features is
              also subject to those providers' terms and privacy practices.
              MadeTVProducts is not responsible for third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              11. Disclaimers &amp; Limitation of Liability
            </h2>
            <p>
              The Service is provided "as is" and "as available" without
              warranties of any kind. To the maximum extent permitted by law,
              MadeTVProducts shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of the
              Service. Our total liability for any claim relating to the Service
              shall not exceed the amount you paid us in the twelve months before
              the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              12. Changes to These Terms
            </h2>
            <p>
              MadeTVProducts may update these Terms &amp; Conditions from time to
              time. Continued use of the Service after changes constitutes
              acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">13. Governing Law</h2>
            <p>
              These Terms are governed by the laws applicable at MadeTVProducts'
              principal place of business, without regard to conflict-of-laws
              rules. Any disputes will be resolved in the courts of that
              jurisdiction, unless otherwise required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">14. Contact</h2>
            <p>
              For questions about these Terms &amp; Conditions, please contact
              MadeTVProducts.
            </p>
          </section>
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          © {year} MadeTVProducts. All rights reserved.
        </p>
      </div>
    </div>
  );
}
