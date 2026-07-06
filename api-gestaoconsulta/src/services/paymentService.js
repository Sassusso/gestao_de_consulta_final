import Stripe from "stripe";
import paymentRepository from "../repositories/paymentRepository.js";
import appointmentRepository from "../repositories/appointmentRepository.js";
import notificationService from "./notificationService.js";
import prisma from "../config/prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async create(data) {
    return paymentRepository.create(data);
  }

  async createPaymentIntent(paymentId) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Pagamento não encontrado");
    if (payment.status !== "PENDING") throw new Error("Pagamento já foi processado");

    const appointment = await appointmentRepository.findById(payment.appointmentId);
    if (!appointment) throw new Error("Consulta não encontrada");

    const patient = await prisma.patient.findUnique({
      where: { id: appointment.patientId },
      include: { user: true }
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(payment.amount * 100),
      currency: "usd",
      metadata: {
        paymentId: payment.id,
        appointmentId: appointment.id,
        patientEmail: patient?.user?.email || "",
      },
      receipt_email: patient?.user?.email,
    });

    await paymentRepository.update(payment.id, {
      transactionRef: paymentIntent.id,
      method: "stripe",
    });

    return { clientSecret: paymentIntent.client_secret };
  }

  async confirmPayment(paymentIntentId) {
    let payment = await paymentRepository.findByTransactionRef(paymentIntentId);
    if (!payment) {
      payment = await paymentRepository.findById(paymentIntentId);
    }
    if (!payment) throw new Error("Pagamento não encontrado");
    if (payment.status !== "PENDING") return payment;

    const updated = await paymentRepository.update(payment.id, {
      status: "PAID",
      paidAt: new Date(),
    });

    const appointment = await appointmentRepository.findById(payment.appointmentId);
    const patient = await prisma.patient.findUnique({
      where: { id: appointment.patientId },
      include: { user: true }
    });

    if (patient?.userId) {
      await notificationService.create({
        userId: patient.userId,
        appointmentId: appointment.id,
        type: "PAGAMENTO_CONFIRMADO",
        title: "Pagamento Confirmado",
        message: `Olá ${patient.user.name}, o pagamento da consulta com ${appointment.doctor?.user?.name} foi confirmado no valor de USD $ ${payment.amount}.`,
      });
    }

    return updated;
  }

  async findById(id) {
    return paymentRepository.findById(id);
  }
}

export default new PaymentService();