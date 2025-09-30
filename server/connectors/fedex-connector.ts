import type { ExternalCourierProvider } from "@shared/schema";

export interface FedExRateRequest {
  accountNumber: string;
  shipDate: string;
  serviceType: string;
  packagingType: string;
  shipper: FedExAddress;
  recipient: FedExAddress;
  weight: {
    units: 'LB' | 'KG';
    value: number;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    units: 'IN' | 'CM';
  };
}

export interface FedExAddress {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential: boolean;
}

export interface FedExShipRequest extends FedExRateRequest {
  labelSpecification: {
    imageType: 'PDF' | 'PNG' | 'ZPL';
    labelStockType: 'PAPER_4X6' | 'PAPER_LETTER';
  };
  requestedPackageLineItems: Array<{
    weight: {
      units: 'LB' | 'KG';
      value: number;
    };
  }>;
}

export interface FedExRateResponse {
  transactionId: string;
  output: {
    rateReplyDetails: Array<{
      serviceType: string;
      serviceName: string;
      ratedShipmentDetails: Array<{
        totalNetCharge: number;
        totalBaseCharge: number;
        currency: string;
        rateType: string;
      }>;
      operationalDetail: {
        deliveryDate: string;
        transitTime: string;
      };
    }>;
  };
}

export interface FedExShipResponse {
  transactionId: string;
  output: {
    transactionShipments: Array<{
      masterTrackingNumber: string;
      serviceName: string;
      shipDatestamp: string;
      pieceResponses: Array<{
        trackingNumber: string;
        packageDocuments: Array<{
          url: string;
          contentType: string;
          encodedLabel: string;
        }>;
      }>;
    }>;
  };
}

export interface FedExTrackResponse {
  transactionId: string;
  output: {
    completeTrackResults: Array<{
      trackingNumber: string;
      trackResults: Array<{
        trackingNumberInfo: {
          trackingNumber: string;
          carrierCode: string;
        };
        latestStatusDetail: {
          statusByLocale: string;
          scanLocation: {
            city: string;
            stateOrProvinceCode: string;
            countryCode: string;
          };
          ancillaryDetails: Array<{
            reason: string;
            reasonDescription: string;
          }>;
        };
        dateAndTimes: Array<{
          type: string;
          dateTime: string;
        }>;
        scanEvents: Array<{
          date: string;
          eventType: string;
          eventDescription: string;
          scanLocation: {
            city: string;
            stateOrProvinceCode: string;
            countryCode: string;
          };
        }>;
      }>;
    }>;
  };
}

export class FedExConnector {
  private provider: ExternalCourierProvider;
  private apiUrl = 'https://apis.fedex.com';
  private sandboxUrl = 'https://apis-sandbox.fedex.com';

  constructor(provider: ExternalCourierProvider) {
    this.provider = provider;
  }

  private get baseUrl(): string {
    const isSandbox = (this.provider.apiCredentials as any)?.sandbox === true;
    return isSandbox ? this.sandboxUrl : this.apiUrl;
  }

  private get apiKey(): string {
    return (this.provider.apiCredentials as any)?.apiKey || '';
  }

  private get secretKey(): string {
    return (this.provider.apiCredentials as any)?.secretKey || '';
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.secretKey
        })
      });

      if (!response.ok) {
        throw new Error(`FedEx auth failed: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error: any) {
      throw new Error(`Failed to get FedEx access token: ${error.message}`);
    }
  }

  private async makeRequest<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-locale': 'en_US'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`FedEx API error: ${response.status} - ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getAccessToken();
      return {
        success: true,
        message: 'FedEx API connection successful'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `FedEx connection failed: ${error.message}`
      };
    }
  }

  async getRates(request: FedExRateRequest): Promise<FedExRateResponse> {
    try {
      const response = await this.makeRequest<FedExRateResponse>(
        '/rate/v1/rates/quotes',
        'POST',
        {
          accountNumber: {
            value: request.accountNumber
          },
          requestedShipment: {
            shipper: {
              address: request.shipper
            },
            recipient: {
              address: request.recipient
            },
            shipDateStamp: request.shipDate,
            serviceType: request.serviceType,
            packagingType: request.packagingType,
            rateRequestType: ['ACCOUNT', 'LIST'],
            requestedPackageLineItems: [{
              weight: request.weight,
              dimensions: request.dimensions
            }]
          }
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(`Failed to get FedEx rates: ${error.message}`);
    }
  }

  async purchaseLabel(request: FedExShipRequest): Promise<{
    success: boolean;
    trackingNumber?: string;
    labelUrl?: string;
    cost?: number;
    error?: string;
  }> {
    try {
      const response = await this.makeRequest<FedExShipResponse>(
        '/ship/v1/shipments',
        'POST',
        {
          accountNumber: {
            value: request.accountNumber
          },
          requestedShipment: {
            shipper: {
              address: request.shipper
            },
            recipients: [{
              address: request.recipient
            }],
            shipDateStamp: request.shipDate,
            serviceType: request.serviceType,
            packagingType: request.packagingType,
            labelSpecification: request.labelSpecification,
            requestedPackageLineItems: request.requestedPackageLineItems
          }
        }
      );

      const shipment = response.output.transactionShipments[0];
      const piece = shipment.pieceResponses[0];
      const label = piece.packageDocuments[0];

      return {
        success: true,
        trackingNumber: piece.trackingNumber,
        labelUrl: label.url || `data:${label.contentType};base64,${label.encodedLabel}`,
        cost: 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to purchase FedEx label: ${error.message}`
      };
    }
  }

  async trackShipment(trackingNumber: string): Promise<{
    success: boolean;
    tracking: any;
  }> {
    try {
      const response = await this.makeRequest<FedExTrackResponse>(
        '/track/v1/trackingnumbers',
        'POST',
        {
          includeDetailedScans: true,
          trackingInfo: [{
            trackingNumberInfo: {
              trackingNumber
            }
          }]
        }
      );

      const trackResult = response.output.completeTrackResults[0]?.trackResults[0];
      
      if (!trackResult) {
        return {
          success: false,
          tracking: null
        };
      }

      return {
        success: true,
        tracking: {
          trackingNumber: trackResult.trackingNumberInfo.trackingNumber,
          status: trackResult.latestStatusDetail.statusByLocale,
          location: trackResult.latestStatusDetail.scanLocation,
          events: trackResult.scanEvents.map(event => ({
            date: event.date,
            type: event.eventType,
            description: event.eventDescription,
            location: event.scanLocation
          }))
        }
      };
    } catch (error: any) {
      return {
        success: false,
        tracking: { error: error.message }
      };
    }
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    try {
      await this.makeRequest(
        '/ship/v1/shipments/cancel',
        'PUT',
        {
          accountNumber: {
            value: (this.provider.apiCredentials as any)?.accountNumber || ''
          },
          trackingNumber
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to cancel FedEx shipment:', error);
      return false;
    }
  }
}

export async function createFedExConnector(provider: ExternalCourierProvider): Promise<FedExConnector> {
  return new FedExConnector(provider);
}
