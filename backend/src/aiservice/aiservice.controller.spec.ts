import { Test, TestingModule } from '@nestjs/testing';
import { AiserviceController } from './aiservice.controller';
import { AiserviceService } from './aiservice.service';

describe('AiserviceController', () => {
  let controller: AiserviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiserviceController],
      providers: [AiserviceService],
    }).compile();

    controller = module.get<AiserviceController>(AiserviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
