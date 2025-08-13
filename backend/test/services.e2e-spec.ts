import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ServiceType } from '@prisma/client';

describe('Services (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let clientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@visa-office.com',
        password: 'admin123',
      });

    authToken = loginResponse.body.access_token;

    // Create a test client
    const clientResponse = await request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientType: 'INDIVIDUAL',
        fullName: 'Test Client for Services',
        address: '123 Test St',
        email: 'test-services@example.com',
        destination: 'France',
        visaType: 'Tourist',
        passportNumber: 'TESTSERV123',
      });

    clientId = clientResponse.body.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (clientId) {
      await prismaService.serviceItem.deleteMany({
        where: { clientId },
      });
      await prismaService.client.delete({
        where: { id: clientId },
      });
    }
    await app.close();
  });

  describe('/api/v1/meta/service-types (GET)', () => {
    it('should return service types', () => {
      return request(app.getHttpServer())
        .get('/api/v1/meta/service-types')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toContain('Translation');
          expect(res.body).toContain('Dossier Treatment');
          expect(res.body).toContain('Assurance');
          expect(res.body).toContain('Visa Application');
          expect(res.body).toContain('Consultation');
          expect(res.body).toContain('Other');
        });
    });
  });

  describe('/api/v1/clients/:id/services (GET)', () => {
    it('should return empty services list for new client', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/clients/${clientId}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(0);
        });
    });

    it('should return 404 for non-existent client', () => {
      return request(app.getHttpServer())
        .get('/api/v1/clients/non-existent-id/services')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/api/v1/clients/:id/service (POST)', () => {
    it('should create a single service', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/service`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'TRANSLATION',
          quantity: 2,
          unitPrice: 50.00,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.clientId).toBe(clientId);
          expect(res.body.serviceType).toBe('TRANSLATION');
          expect(res.body.quantity).toBe(2);
          expect(res.body.unitPrice).toBe('50');
        });
    });

    it('should reject invalid service data', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/service`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'INVALID_TYPE',
          quantity: -1,
          unitPrice: -10,
        })
        .expect(400);
    });

    it('should reject request without auth token', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/service`)
        .send({
          serviceType: 'TRANSLATION',
          quantity: 1,
          unitPrice: 25.00,
        })
        .expect(401);
    });
  });

  describe('/api/v1/clients/:id/services (POST) - Bulk', () => {
    it('should create multiple services', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              serviceType: 'DOSSIER_TREATMENT',
              quantity: 1,
              unitPrice: 120.00,
            },
            {
              serviceType: 'ASSURANCE',
              quantity: 3,
              unitPrice: 15.50,
            },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
          expect(res.body[0].serviceType).toBe('DOSSIER_TREATMENT');
          expect(res.body[1].serviceType).toBe('ASSURANCE');
        });
    });

    it('should reject empty items array', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/services`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [],
        })
        .expect(400);
    });
  });

  describe('/api/v1/services/:serviceId (PATCH)', () => {
    let serviceId: string;

    beforeEach(async () => {
      // Create a service to update
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/service`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'CONSULTATION',
          quantity: 1,
          unitPrice: 75.00,
        });

      serviceId = response.body.id;
    });

    it('should update a service', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 2,
          unitPrice: 85.00,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.quantity).toBe(2);
          expect(res.body.unitPrice).toBe('85');
        });
    });

    it('should return 404 for non-existent service', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/services/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 2,
          unitPrice: 85.00,
        })
        .expect(404);
    });
  });

  describe('/api/v1/services/:serviceId (DELETE)', () => {
    let serviceId: string;

    beforeEach(async () => {
      // Create a service to delete
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/service`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'OTHER',
          quantity: 1,
          unitPrice: 25.00,
        });

      serviceId = response.body.id;
    });

    it('should delete a service', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 404 for non-existent service', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/services/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Role-based access control', () => {
    let userToken: string;

    beforeAll(async () => {
      // Login as user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@visa-office.com',
          password: 'user123',
        });

      userToken = loginResponse.body.access_token;
    });

    it('should allow user to read services', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/clients/${clientId}/services`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('should reject user from creating services', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/clients/${clientId}/service`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          serviceType: 'TRANSLATION',
          quantity: 1,
          unitPrice: 25.00,
        })
        .expect(403);
    });

    it('should reject user from updating services', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/services/some-service-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 2,
          unitPrice: 30.00,
        })
        .expect(403);
    });

    it('should reject user from deleting services', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/services/some-service-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
