import { useEffect, useRef } from 'react';

export default function RazorpayButton() {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!formRef.current) return;

        // Prevent duplicate network calls or rendering loops in React StrictMode
        if (formRef.current.children.length > 0) return;

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        
        // This is your unique button ID
        script.setAttribute('data-payment_button_id', 'pl_SfQMYm5C96fBpm');
        script.async = true;

        formRef.current.appendChild(script);
    }, []);

    return (
        <div className="w-full flex items-center justify-center py-4">
            <form ref={formRef} className="m-0" />
        </div>
    );
}
