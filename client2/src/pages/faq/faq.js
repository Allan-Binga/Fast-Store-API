import React, { useState } from "react";
import TopHeader from "../../components/topHeader/TopHeader";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Add items to your cart, proceed to checkout, and follow the steps to complete payment.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Visa, MasterCard, PayPal, and more.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes! Once shipped, you'll receive an email with tracking information.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Returns are accepted within 30 days. Items must be unused and in original packaging.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState(null);

  const toggleIndex = (index) => {
    setOpen(open === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopHeader />
      <Header />

      {/*Main Content*/}
      <div className="flex-grow px-4 py-10 md:px-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg bg-white shadow-sm">
              <button
                className="w-full px-4 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleIndex(index)}
              >
                <span className="text-lg font-medium text-gray-700">
                  {faq.question}
                </span>
                <span className="text-2xl text-gray-500">
                  {open === index ? "−" : "+"}
                </span>
              </button>
              {open === index && (
                <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Faq;
