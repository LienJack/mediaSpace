import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确初始化', () => {
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });

  describe('getHello', () => {
    it('应该返回 "Hello World!"', () => {
      // 模拟 AppService 的 getHello 方法
      (appService.getHello as jest.Mock).mockReturnValue('Hello World!');

      const result = appController.getHello();
      expect(result).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalled();
    });

    it('当服务抛出异常时应该捕获并抛出', () => {
      // 模拟 AppService 的 getHello 方法抛出异常
      (appService.getHello as jest.Mock).mockImplementation(() => {
        throw new Error('服务异常');
      });

      expect(() => appController.getHello()).toThrow('服务异常');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });
});
