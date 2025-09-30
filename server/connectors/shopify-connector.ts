import type { MarketplaceConnection, ExternalCourierProvider } from "@shared/schema";

export interface ShopifyOrder {
  id: string;
  order_number: string;
  email: string;
  created_at: string;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone: string;
  };
  line_items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
    sku: string;
    variant_title: string;
  }>;
}

export interface ShopifyWebhookPayload {
  id: string;
  topic: string;
  shop_domain: string;
  payload: ShopifyOrder | any;
  created_at: string;
}

export class ShopifyConnector {
  private connection: MarketplaceConnection;
  private apiVersion = '2024-01';

  constructor(connection: MarketplaceConnection) {
    this.connection = connection;
  }

  private get shopUrl(): string {
    return this.connection.storeUrl || '';
  }

  private get apiKey(): string {
    return (this.connection.apiCredentials as any)?.apiKey || '';
  }

  private get accessToken(): string {
    return (this.connection.apiCredentials as any)?.accessToken || '';
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.accessToken
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.shopUrl}/admin/api/${this.apiVersion}/shop.json`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Shopify API error: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: `Connected to shop: ${data.shop.name}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  async syncOrders(since?: Date): Promise<{ orders: ShopifyOrder[]; count: number }> {
    try {
      let url = `${this.shopUrl}/admin/api/${this.apiVersion}/orders.json?status=any&limit=250`;
      
      if (since) {
        url += `&created_at_min=${since.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        orders: data.orders || [],
        count: data.orders?.length || 0
      };
    } catch (error: any) {
      throw new Error(`Failed to sync Shopify orders: ${error.message}`);
    }
  }

  async getOrder(orderId: string): Promise<ShopifyOrder | null> {
    try {
      const response = await fetch(
        `${this.shopUrl}/admin/api/${this.apiVersion}/orders/${orderId}.json`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      return data.order || null;
    } catch (error: any) {
      throw new Error(`Failed to get Shopify order: ${error.message}`);
    }
  }

  async createFulfillment(orderId: string, trackingNumber: string, trackingCompany: string) {
    try {
      const response = await fetch(
        `${this.shopUrl}/admin/api/${this.apiVersion}/orders/${orderId}/fulfillments.json`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            fulfillment: {
              tracking_number: trackingNumber,
              tracking_company: trackingCompany,
              notify_customer: true
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to create fulfillment: ${error.message}`);
    }
  }

  async registerWebhook(topic: string, callbackUrl: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.shopUrl}/admin/api/${this.apiVersion}/webhooks.json`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            webhook: {
              topic,
              address: callbackUrl,
              format: 'json'
            }
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to register webhook:', error);
      return false;
    }
  }

  async handleWebhook(payload: ShopifyWebhookPayload): Promise<{
    success: boolean;
    action: string;
    data: any;
  }> {
    const { topic } = payload;

    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
        return {
          success: true,
          action: 'order_sync',
          data: this.mapShopifyOrderToInternal(payload.payload)
        };

      case 'orders/cancelled':
        return {
          success: true,
          action: 'order_cancelled',
          data: { orderId: payload.id }
        };

      case 'orders/fulfilled':
        return {
          success: true,
          action: 'order_fulfilled',
          data: { orderId: payload.id }
        };

      default:
        return {
          success: true,
          action: 'unknown',
          data: payload
        };
    }
  }

  private mapShopifyOrderToInternal(shopifyOrder: ShopifyOrder) {
    return {
      externalOrderId: shopifyOrder.id.toString(),
      orderNumber: shopifyOrder.order_number.toString(),
      customerEmail: shopifyOrder.email,
      totalAmount: parseFloat(shopifyOrder.total_price),
      currency: shopifyOrder.currency,
      status: this.mapOrderStatus(shopifyOrder.financial_status, shopifyOrder.fulfillment_status),
      shippingAddress: {
        name: `${shopifyOrder.shipping_address.first_name} ${shopifyOrder.shipping_address.last_name}`,
        address1: shopifyOrder.shipping_address.address1,
        address2: shopifyOrder.shipping_address.address2,
        city: shopifyOrder.shipping_address.city,
        province: shopifyOrder.shipping_address.province,
        zip: shopifyOrder.shipping_address.zip,
        country: shopifyOrder.shipping_address.country,
        phone: shopifyOrder.shipping_address.phone
      },
      items: shopifyOrder.line_items.map(item => ({
        externalItemId: item.id.toString(),
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price),
        sku: item.sku,
        variant: item.variant_title
      })),
      createdAt: new Date(shopifyOrder.created_at)
    };
  }

  private mapOrderStatus(financialStatus: string, fulfillmentStatus: string | null): string {
    if (fulfillmentStatus === 'fulfilled') return 'fulfilled';
    if (fulfillmentStatus === 'partial') return 'partially_fulfilled';
    if (financialStatus === 'paid') return 'paid';
    if (financialStatus === 'pending') return 'pending';
    if (financialStatus === 'refunded') return 'refunded';
    return 'new';
  }
}

export async function createShopifyConnector(connection: MarketplaceConnection): Promise<ShopifyConnector> {
  return new ShopifyConnector(connection);
}
