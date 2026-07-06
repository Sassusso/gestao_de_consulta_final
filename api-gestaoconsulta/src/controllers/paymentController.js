import paymentService from "../services/paymentService.js";
import Stripe from "stripe";
import express from "express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentController {
  async createPaymentIntent(req, res, next) {
    try {
      const { paymentId } = req.params;
      const result = await paymentService.createPaymentIntent(paymentId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // Webhook do Stripe
  async handleStripeWebhook(req, res) {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      await paymentService.confirmPayment(paymentIntent.id);
    }

    res.json({ received: true });
  }

  async verifyPaymentStatus(req, res, next) {
    try {
      const { paymentId } = req.params;
      
      // 1. Procura o pagamento na base de dados
      const payment = await paymentService.findById(paymentId); 
      if (!payment) return res.status(404).json({ message: "Pagamento não encontrado" });
      
      if (payment.status === "PAID") {
        return res.json({ success: true, message: "Pagamento já estava confirmado." });
      }

      // 2. Consulta o estado real diretamente no Stripe usando o ID que guardou (transactionRef)
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionRef);

      // 3. Se o Stripe disser que foi pago com sucesso
      if (paymentIntent.status === "succeeded") {
        // O seu serviço já muda o status na BD, cria a notificação e envia o email!
        await paymentService.confirmPayment(payment.id);
        return res.json({ success: true, message: "Pagamento verificado e confirmado!" });
      }

      res.json({ success: false, status: paymentIntent.status });
    } catch (err) {
      next(err);
    }
  }
}



export default new PaymentController();