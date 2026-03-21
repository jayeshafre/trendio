import { createPayment, verifyPayment, recordFailedPayment } from '../api/paymentApi';
import toast from 'react-hot-toast';

/**
 * Custom hook to handle Razorpay payment flow.
 * Returns a function that opens the Razorpay popup.
 */
export const useRazorpay = () => {

    const initiatePayment = async ({
        orderNumber,
        onSuccess,
        onFailure,
    }) => {
        try {
            // Step 1 — Create Razorpay order from backend
            const paymentData = await createPayment(orderNumber);

            // Step 2 — Configure Razorpay options
            const options = {
                key:         paymentData.razorpay_key_id,
                amount:      paymentData.amount,
                currency:    paymentData.currency,
                name:        'Trendio',
                description: paymentData.description,
                order_id:    paymentData.razorpay_order_id,

                // ── Prefill customer info ────────────────────
                prefill: {
                    name:    paymentData.name,
                    email:   paymentData.email,
                    contact: paymentData.phone,
                },

                // ── Trendio brand colors ─────────────────────
                theme: {
                    color: '#ff3f6c',
                },

                // ── On Payment Success ───────────────────────
                handler: async (response) => {
                    try {
                        const verifyData = await verifyPayment({
                            razorpay_order_id:   response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature:  response.razorpay_signature,
                        });

                        toast.success('Payment successful! 🎉');
                        if (onSuccess) onSuccess(verifyData);
                    } catch (error) {
                        toast.error('Payment verification failed. Contact support.');
                        if (onFailure) onFailure(error);
                    }
                },

                // ── On Modal Close / Dismiss ─────────────────
                modal: {
                    ondismiss: async () => {
                        await recordFailedPayment(paymentData.razorpay_order_id);
                        toast.error('Payment cancelled.');
                        if (onFailure) onFailure({ message: 'Payment cancelled by user.' });
                    }
                }
            };

            // Step 3 — Open Razorpay popup
            const razorpay = new window.Razorpay(options);

            // Handle payment failure inside popup
            razorpay.on('payment.failed', async (response) => {
                await recordFailedPayment(paymentData.razorpay_order_id);
                toast.error(`Payment failed: ${response.error.description}`);
                if (onFailure) onFailure(response.error);
            });

            razorpay.open();

        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to initiate payment.';
            toast.error(msg);
            if (onFailure) onFailure(error);
        }
    };

    return { initiatePayment };
};