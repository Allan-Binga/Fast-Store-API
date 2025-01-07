import React from "react";
import { FaCcStripe, FaCcVisa } from "react-icons/fa";
import "./payment.css";

const Payment = () => {
  return (
    <div className="payments">
      <FaCcStripe className="payment-icon stripe-icon" />
      <FaCcVisa className="payment-icon visa-icon" />
    </div>
  );
};

export default Payment;
