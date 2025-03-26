import { useEffect } from 'react';

const PaymentModal = ({ url, onClose }) => {
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === 'paymentCompleted') {
                onClose();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onClose]);

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <button className="close-button" onClick={onClose}>×</button>
                <iframe 
                    src={url} 
                    title="Payment Gateway"
                    className="payment-iframe"
                />
            </div>
        </div>
    );
};

export default PaymentModal;