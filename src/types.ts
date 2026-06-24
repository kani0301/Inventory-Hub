/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categoriesSupplied: string[];
  rating: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  cost: number;
  supplierId: string;
  imageUrl: string;
  description: string;
  location: string;
}

export interface Movement {
  id: string;
  productId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  userId: string;
  date: string;
}

export interface ForecastItem {
  id: string;
  name: string;
  sku: string;
  currentDailyDemand: number;
  nextMonthExpectedQty: number;
  confidenceRate: number;
  trendState: string;
}

export interface RestockingRecommendation {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minQuantity: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "STABLE";
  recommendation: string;
  supplierName: string;
  leadTimeDays: number;
}

export interface AIInsights {
  forecasts: ForecastItem[];
  restockingRecommendations: RestockingRecommendation[];
  businessSuggestions: string[];
  meta: {
    generatedBy: string;
    timestamp: string;
  };
}
