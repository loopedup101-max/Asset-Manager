import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export function PrivacyPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to app
          </span>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          © {year} MadeTVProducts. All rights reserved. Last updated{" "}
          {new Date().toLocaleDateString()}.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
            <p>
              This Privacy Policy explains how MadeTVProducts ("we", "us")
              collects, uses, and protects your information when you use Made
              Super AI (the "Service"). By using the Service, you agree to the
              practices described here and in our{" "}
              <Link href="/terms">
                <span className="text-primary hover:underline cursor-pointer">
                  Terms &amp; Conditions
                </span>
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account information.</strong> Your email address and
                authentication details, provided through our identity provider
                (Clerk).
              </li>
              <li>
                <strong>Content you submit.</strong> Prompts, messages, and
                inputs you provide to generate apps, videos, and other output.
              </li>
              <li>
                <strong>Usage data.</strong> Records of AI actions used to
                operate features and enforce plan allowances, plus basic logs and
                diagnostics.
              </li>
              <li>
                <strong>Payment information.</strong> Subscription and billing
                details handled by Stripe. We do not collect or store your full
                payment card numbers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              3. How We Use Your Information
            </h2>
            <p>
              We use your information to provide and maintain the Service,
              authenticate your account, process subscriptions and payments,
              enforce usage allowances, generate AI output you request, improve
              and secure the Service, and communicate with you about your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. AI Processing</h2>
            <p>
              To generate content, the prompts and inputs you submit are sent to
              third-party AI model providers. Please avoid submitting sensitive
              personal information in your prompts. AI providers process this data
              according to their own terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Payment Processing</h2>
            <p>
              Payments are processed by Stripe. Stripe collects and processes
              your payment details directly and in accordance with its privacy
              policy. We receive limited information such as your subscription
              status and a customer identifier, but not your full card details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Authentication</h2>
            <p>
              Account sign-in and management are provided by Clerk. Clerk
              processes your authentication data (such as your email and login
              sessions) on our behalf in accordance with its privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              7. Cookies &amp; Local Storage
            </h2>
            <p>
              We and our providers use cookies and similar technologies (for
              example, to keep you signed in and to operate the Service). You can
              control cookies through your browser settings, though some features
              may not work without them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or
              as needed to provide the Service, comply with legal obligations,
              resolve disputes, and enforce our agreements. You may request
              deletion of your account as described below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Your Rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct,
              export, or delete your personal information, and to object to or
              restrict certain processing. To exercise these rights, contact us
              and we will respond as required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              10. Children's Privacy
            </h2>
            <p>
              The Service is not directed to children under the age required by
              applicable law, and we do not knowingly collect personal
              information from them. If you believe a child has provided us
              personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Continued use
              of the Service after changes constitutes acceptance of the revised
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">12. Contact</h2>
            <p>
              For questions about this Privacy Policy or your data, please contact
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
