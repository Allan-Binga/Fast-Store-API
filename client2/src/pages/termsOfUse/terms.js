import React from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />

      {/* Main Content */}
      <div className="flex-grow px-4 py-10 md:px-10 max-w-4xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms of Use</h1>

        <section className="space-y-6 text-sm md:text-base leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p>
              Welcome to our e-commerce platform. By accessing or using our
              website, you agree to comply with and be bound by these Terms of
              Use. If you do not agree with any part of the terms, you may not
              access the site.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. Use of Website</h2>
            <p>
              You may use this site for personal, non-commercial purposes only.
              You agree not to misuse the site in any way that could harm the
              platform or its users.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              3. Product Information
            </h2>
            <p>
              We strive to provide accurate product information. However, we do
              not guarantee that descriptions, pricing, or other content is
              error-free or current. We reserve the right to correct errors at
              any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Orders & Payments</h2>
            <p>
              All orders are subject to availability and confirmation. Payment
              must be made in full before orders are processed. We reserve the
              right to refuse any order at our sole discretion.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5. Returns & Refunds</h2>
            <p>
              Our return and refund policy is available on our website. Please
              read it carefully before making a purchase.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              6. Intellectual Property
            </h2>
            <p>
              All content on this site, including text, images, logos, and
              designs, is the property of our platform and is protected by
              intellectual property laws. Unauthorized use is prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              7. Limitation of Liability
            </h2>
            <p>
              We are not liable for any direct, indirect, or incidental damages
              resulting from your use of the site or the purchase of any
              products from it.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">8. Changes to Terms</h2>
            <p>
              We may update these Terms of Use from time to time. Continued use
              of the website following changes constitutes your acceptance of
              those changes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              9. Contact Information
            </h2>
            <p>
              If you have any questions about these terms, please contact us at{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 underline"
              >
                support@example.com
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

export default Terms;
