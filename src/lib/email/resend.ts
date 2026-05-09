import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM = process.env.EMAIL_FROM ?? "Mar Boutique <hola@marboutique.co>";
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").filter(Boolean);
