
export interface PaymentHandlerState {
  isRefreshingPlan: boolean;
}

export interface PaymentSuccessParams {
  sessionId: string;
  paymentSuccess: string;
}
