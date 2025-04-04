import React from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

const Policy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />

      {/* Main Content */}
      <div className="flex-grow px-4 py-10 md:px-10 max-w-4xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>

        <section className="space-y-6 text-sm md:text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p>
              This Privacy Policy explains how we collect, use, and protect your
              personal information when you use our e-commerce platform. By
              accessing our website, you consent to the data practices described
              in this policy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              2. Information We Collect
            </h2>
            <p>
              We may collect the following types of information:
              <ul className="list-disc list-inside mt-2">
                <li>Personal details (name, email, phone number)</li>
                <li>Billing and shipping addresses</li>
                <li>
                  Payment information (processed securely via third-party
                  services)
                </li>
                <li>Order history and customer service interactions</li>
                <li>Browser cookies and IP addresses for analytics</li>
              </ul>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              3. How We Use Your Information
            </h2>
            <p>
              We use your information to:
              <ul className="list-disc list-inside mt-2">
                <li>Process and ship orders</li>
                <li>Provide customer support</li>
                <li>Send updates, offers, and newsletters (if subscribed)</li>
                <li>Improve user experience through analytics</li>
              </ul>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Data Protection</h2>
            <p>
              We implement security measures to protect your personal data.
              However, no method of transmission over the internet is 100%
              secure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              5. Sharing Information
            </h2>
            <p>
              We do not sell your personal information. We may share data with
              trusted third parties for order processing, email delivery, or
              marketing analytics. These partners are contractually obligated to
              keep your data secure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
            <p>
              We use cookies to improve your shopping experience and collect
              usage data. You can manage cookie preferences through your browser
              settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your
              personal data by contacting us. You also have the right to opt out
              of marketing communications at any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy occasionally. Changes will be
              posted on this page, and we encourage you to review it
              periodically.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy
              Policy, please contact us at{" "}
              <a
                href="mailto:privacy@example.com"
                className="text-blue-600 underline"
              >
                privacy@example.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Policy;
