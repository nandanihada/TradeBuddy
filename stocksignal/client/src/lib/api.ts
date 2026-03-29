/**
 * TradeBuddy API client.
 * All calls go through Vite's proxy to the Python backend at :8000.
 */
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Market
export const getMarketOverview = () => api.get("/market/overview").then((r) => r.data);
export const getIndices = () => api.get("/market/indices").then((r) => r.data);
export const getTopMovers = (limit = 10) =>
  api.get(`/market/movers?limit=${limit}`).then((r) => r.data);

// Stock Analysis
export const getStockAnalysis = (symbol: string) => {
  const lang = localStorage.getItem("tradebuddy_lang") || "en";
  return api.get(`/analysis/${symbol}?lang=${lang}`).then((r) => r.data);
}
export const getQuickVerdict = (symbol: string) => {
  const lang = localStorage.getItem("tradebuddy_lang") || "en";
  return api.get(`/analysis/${symbol}/quick?lang=${lang}`).then((r) => r.data);
}
export const getStockDetail = (symbol: string) =>
  api.get(`/analysis/${symbol}/detail`).then((r) => r.data);
export const getStockTechnicals = (symbol: string) =>
  api.get(`/analysis/${symbol}/technicals`).then((r) => r.data);
export const getStockHistory = (symbol: string, period = "6mo") =>
  api.get(`/analysis/${symbol}/history?period=${period}`).then((r) => r.data);

// Signals (Opportunity Radar)
export const getAllSignals = () => api.get("/signals/").then((r) => r.data);
export const getBulkDealSignals = () => api.get("/signals/bulk-deals").then((r) => r.data);
export const getTechnicalSignals = () => api.get("/signals/technical").then((r) => r.data);
export const getFiiDiiSignals = () => api.get("/signals/fii-dii").then((r) => r.data);

// Tracker
export const getFiiDiiData = () => api.get("/tracker/fii-dii").then((r) => r.data);
export const getBulkDeals = () => api.get("/tracker/bulk-deals").then((r) => r.data);
export const getInstitutionalActivity = () =>
  api.get("/tracker/institutional").then((r) => r.data);

// Chat
export const sendChatMessage = (message: string, history?: any[], portfolio?: any[]) =>
  api.post("/chat/", { message, history, portfolio }).then((r) => r.data);
