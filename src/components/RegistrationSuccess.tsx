import React from 'react';
import './RegistrationSuccess.css';

interface RegistrationData {
  transid: number;
  ordercode: string;
  invoice_url: string;
}

interface RegistrationSuccessProps {
  registrationData: RegistrationData;
  onOpenInvoice: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  registrationData,
  onOpenInvoice,
}) => {
  console.log('✅ Registration successful with data:', registrationData);
  const hasCompleteData =
    registrationData.transid && registrationData.ordercode && registrationData.invoice_url;
  return (
    <div className="registration-success">
      <div className="registration-success-header">
        <span className="success-icon">✅</span>
        <h4 className="success-title">Registration Completed</h4>
      </div>

      {hasCompleteData && (
        <>
          <div className="registration-details">
            <div className="detail-row">
              <span className="detail-label">Transaction ID:</span>
              <span className="detail-value">{registrationData.transid}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Order Code:</span>
              <span className="detail-value">{registrationData.ordercode}</span>
            </div>
          </div>

          <button className="invoice-button" onClick={onOpenInvoice}>
            <div className="invoice-button-content">
              <span className="invoice-icon">💳</span>
              <span>Open Payment Invoice</span>
            </div>
          </button>
        </>
      )}
    </div>
  );
};

export default RegistrationSuccess;
