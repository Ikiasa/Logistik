import { Test, TestingModule } from "@nestjs/testing";
import { OutboxWorker } from "./outbox.worker";
import { OutboxService } from "./outbox.service";

// Mock Service
const mockOutboxService = {
  processBatch: jest.fn(),
};

describe("OutboxWorker", () => {
  let worker: OutboxWorker;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxWorker,
        { provide: OutboxService, useValue: mockOutboxService },
      ],
    }).compile();

    worker = module.get<OutboxWorker>(OutboxWorker);
  });

  it("should start polling on bootstrap", () => {
    jest.useFakeTimers();

    worker.onApplicationBootstrap();

    // Fast-forward time
    jest.advanceTimersByTime(250);

    expect(mockOutboxService.processBatch).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it("should stop polling on destroy", () => {
    jest.useFakeTimers();

    worker.onApplicationBootstrap();
    worker.onModuleDestroy();

    jest.clearAllMocks();
    jest.advanceTimersByTime(500);

    expect(mockOutboxService.processBatch).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
