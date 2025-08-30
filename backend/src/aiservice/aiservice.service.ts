import { Injectable } from '@nestjs/common';
import { CreateAiserviceDto } from './dto/create-aiservice.dto';
import { UpdateAiserviceDto } from './dto/update-aiservice.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private httpService: HttpService) {}

  async onModuleInit() {
    // Optional: Verify connection on startup
    await this.healthCheck();
  }

  private async healthCheck() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/health`),
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to connect to Visa Processing Service');
    }
  }

  async getCountries() {
    const response = await firstValueFrom(
      this.httpService.get<string[]>(`${this.baseUrl}/countries`),
    );
    return response.data;
  }

  async getServices() {
    const response = await firstValueFrom(
      this.httpService.get<string[]>(`${this.baseUrl}/services`),
    );
    return response.data;
  }

  async getEstimate(estimateData: {
    country: string;
    quantity: number;
    selected_services: string[];
  }) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/estimate`, estimateData),
    );
    return response.data;
  }

  async createTransaction(transactionData: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/transactions`, transactionData),
    );
    return response.data;
  }
}
