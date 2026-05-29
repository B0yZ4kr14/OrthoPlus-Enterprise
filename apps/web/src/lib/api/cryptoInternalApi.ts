/**
 * Crypto Internal API Client
 *
 * Cliente para endpoints internos do backend relacionados a crypto.
 * Usa apiClient (axios com auth interceptors) em vez de fetch raw.
 *
 * Constitution AP-3: Toda comunicacao HTTP deve usar abstracoes centralizadas.
 */

import { apiClient } from "./apiClient";

export interface CreatePSBTPayload {
  recipient: string;
  amount: number;
  coinType?: string;
}

export interface CreatePSBTResponse {
  psbt: string;
  txId?: string;
}

export async function createPSBT(
  payload: CreatePSBTPayload,
): Promise<CreatePSBTResponse> {
  return apiClient.post<CreatePSBTResponse>("/crypto/create-psbt", payload);
}

export interface BroadcastPayload {
  signedPsbt: string;
  network?: string;
}

export interface BroadcastResponse {
  txId: string;
  status: "broadcasted" | "pending";
}

export async function broadcastTransaction(
  payload: BroadcastPayload,
): Promise<BroadcastResponse> {
  return apiClient.post<BroadcastResponse>("/crypto/broadcast", payload);
}

export interface WhatsAppNotificationPayload {
  to: string;
  message: string;
  agendamentoId?: string;
}

export interface WhatsAppNotificationResponse {
  ok: boolean;
  messageId?: string;
}

export async function sendWhatsAppNotification(
  payload: WhatsAppNotificationPayload,
): Promise<WhatsAppNotificationResponse> {
  return apiClient.post<WhatsAppNotificationResponse>(
    "/rest/notifications/whatsapp",
    payload,
  );
}
