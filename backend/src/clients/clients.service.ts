import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, PhoneNumberDto, EmployerDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { ClientType } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    // Business rule: passportNumber is required for non-PHONE_CALL clients
    if (createClientDto.clientType !== ClientType.PHONE_CALL && !createClientDto.passportNumber) {
      throw new BadRequestException('Passport number is required for non-phone call clients');
    }

    const { phoneNumbers, employers, ...clientData } = createClientDto;

    return this.prisma.client.create({
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

    const { phoneNumbers, employers, ...clientData } = updateClientDto;

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
}
