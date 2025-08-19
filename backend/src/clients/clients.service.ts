import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, PhoneNumberDto, EmployerDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { CreatePhoneCallClientDto } from './dto/create-phone-call-client.dto';
import { ClientType, PaymentOption } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    // Business rule: passportNumber is required for non-PHONE_CALL clients
    if (createClientDto.clientType !== ClientType.PHONE_CALL && !createClientDto.passportNumber) {
      throw new BadRequestException('Passport number is required for non-phone call clients');
    }

    const { phoneNumbers, employers, familyMembers, ...clientData } = createClientDto;

    // Validate familyMembers for FAMILY and GROUP types
    if ((createClientDto.clientType === ClientType.FAMILY || createClientDto.clientType === ClientType.GROUP)) {
      if (!familyMembers || familyMembers.length === 0) {
        throw new BadRequestException('Family members are required for FAMILY and GROUP client types');
      }
    }

    return this.prisma.client.create({
      data: {
        ...clientData,
        phoneNumbers: {
          create: phoneNumbers || [],
        },
        employers: {
          create: employers || [],
        },
        familyMembers: {
          create: familyMembers || [],
        },
      },
      include: {
        phoneNumbers: true,
        employers: true,
        attachments: true,
        familyMembers: true,
      },
    });
  }

  async findAll(query: QueryClientDto) {
    const { page = 1, limit = 10, search, status, clientType } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (clientType) {
      where.clientType = clientType;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { passportNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          phoneNumbers: true,
          employers: true,
          attachments: true,
          familyMembers: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        phoneNumbers: true,
        employers: true,
        attachments: true,
        familyMembers: true,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    // Business rule: passportNumber is required for non-PHONE_CALL clients
    if (updateClientDto.clientType !== ClientType.PHONE_CALL && !updateClientDto.passportNumber) {
      throw new BadRequestException('Passport number is required for non-phone call clients');
    }

    const { phoneNumbers, employers, familyMembers, ...clientData } = updateClientDto;

    // Validate familyMembers for FAMILY and GROUP types
    if (updateClientDto.clientType === ClientType.FAMILY || updateClientDto.clientType === ClientType.GROUP) {
      if (familyMembers !== undefined && familyMembers.length === 0) {
        throw new BadRequestException('Family members are required for FAMILY and GROUP client types');
      }
    }

    // Handle phone numbers update
    if (phoneNumbers !== undefined) {
      await this.prisma.phoneNumber.deleteMany({
        where: { clientId: id },
      });
    }

    // Handle employers update
    if (employers !== undefined) {
      await this.prisma.employer.deleteMany({
        where: { clientId: id },
      });
    }

    // Handle family members update
    if (familyMembers !== undefined) {
      await this.prisma.familyMember.deleteMany({
        where: { clientId: id },
      });
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        ...clientData,
        ...(phoneNumbers !== undefined && {
          phoneNumbers: {
            create: phoneNumbers,
          },
        }),
        ...(employers !== undefined && {
          employers: {
            create: employers,
          },
        }),
        ...(familyMembers !== undefined && {
          familyMembers: {
            create: familyMembers,
          },
        }),
      },
      include: {
        phoneNumbers: true,
        employers: true,
        attachments: true,
        familyMembers: true,
      },
    });
  }

  async remove(id: string) {
    const client = await this.findOne(id);
    
    // Hard delete for MVP
    await this.prisma.client.delete({
      where: { id },
    });

    return { message: 'Client deleted successfully' };
  }

  async addFamilyMember(clientId: string, createFamilyMemberDto: CreateFamilyMemberDto) {
    // Verify client exists
    await this.findOne(clientId);

    return this.prisma.familyMember.create({
      data: {
        ...createFamilyMemberDto,
        clientId,
      },
    });
  }

  async removeFamilyMember(id: string) {
    const familyMember = await this.prisma.familyMember.findUnique({
      where: { id },
    });

    if (!familyMember) {
      throw new NotFoundException(`Family member with ID ${id} not found`);
    }

    await this.prisma.familyMember.delete({
      where: { id },
    });

    return { message: 'Family member deleted successfully' };
  }

  async createPhoneCallClient(dto: CreatePhoneCallClientDto) {
    const { services, paymentConfig, phoneNumbers, employers, ...clientData } = dto;

    // Validate that client type is PHONE_CALL
    if (clientData.clientType !== ClientType.PHONE_CALL) {
      throw new BadRequestException('This endpoint is only for Phone Call clients');
    }

    // Validate payment installments sum to 100%
    const totalPercentage = paymentConfig.installments.reduce((sum, inst) => sum + inst.percentage, 0);
    if (totalPercentage !== 100) {
      throw new BadRequestException('Payment installments must sum to 100%');
    }

    // Validate transfer code if payment is due today and payment option is bank transfer
    const today = new Date().toISOString().split('T')[0];
    const hasDueToday = paymentConfig.installments.some(inst => {
      const dueDate = new Date(inst.dueDate).toISOString().split('T')[0];
      return dueDate === today;
    });

    if (hasDueToday && paymentConfig.paymentOption === PaymentOption.BANK_TRANSFER && !paymentConfig.transferCode) {
      throw new BadRequestException('Transfer code is required for bank transfers due today');
    }

    // Use a transaction to ensure all or nothing
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the client
      const client = await tx.client.create({
        data: {
          ...clientData,
          phoneNumbers: {
            create: phoneNumbers || [],
          },
          employers: {
            create: employers || [],
          },
        },
        include: {
          phoneNumbers: true,
          employers: true,
        },
      });

      // 2. Create services
      const createdServices = await tx.serviceItem.createMany({
        data: services.map(service => ({
          clientId: client.id,
          serviceType: service.serviceType,
          quantity: service.quantity,
          unitPrice: service.unitPrice,
        })),
      });

      // 3. Create payment with installments
      const payment = await tx.payment.create({
        data: {
          clientId: client.id,
          totalAmount: paymentConfig.totalAmount,
          paymentOption: paymentConfig.paymentOption,
          paymentModality: paymentConfig.paymentModality,
          transferCode: paymentConfig.transferCode,
          installments: {
            create: paymentConfig.installments.map(inst => ({
              description: inst.description,
              percentage: inst.percentage,
              amount: inst.amount,
              dueDate: new Date(inst.dueDate),
            })),
          },
        },
        include: {
          installments: true,
        },
      });

      // 4. Fetch complete client with all relations
      const completeClient = await tx.client.findUnique({
        where: { id: client.id },
        include: {
          phoneNumbers: true,
          employers: true,
          attachments: true,
          familyMembers: true,
          serviceItems: true,
          payments: {
            include: {
              installments: true,
            },
          },
        },
      });

      return completeClient;
    });
  }
}
