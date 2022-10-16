import { Job, Queue, QueueScheduler, Worker } from 'bullmq';
import { QueueBaseOptions } from 'bullmq/dist/esm/interfaces/queue-options';
import { GroupBookingRequestDBValue } from '../types';
import { groupDealWorker } from './GroupContractService';
import { redisHost, redisPassword, redisPort, redisUsername } from '../config';
import LogService from './LogService';
import groupBookingRequestRepository from '../repositories/GroupBookingRequestRepository';

const maxNbAttempts = 100;

export class GroupQueueService {
  private static _instance: GroupQueueService = new GroupQueueService();
  private connectionConfig: QueueBaseOptions = {
    connection: {
      host: redisHost,
      port: redisPort,
      username: redisUsername,
      password: redisPassword
    }
  };
  private dealQueue: Queue;
  private dealScheduler: QueueScheduler;
  private dealWorker: Worker;

  constructor() {
    if (GroupQueueService._instance) {
      throw new Error(
        'QueueService class instantiation failed. Use QueueService.getInstance() instead of new operator.'
      );
    }
    let backoffDelay = 5 * 1000; // Wait 5s before retry a failed job.
    // Reduce delay for tests.
    if (process.env.NODE_IS_TEST === 'true') {
      backoffDelay = 2 * 1000;
    }
    this.dealScheduler = new QueueScheduler('GroupDeal', this.connectionConfig);
    this.dealQueue = new Queue('GroupDeal', {
      defaultJobOptions: {
        attempts: maxNbAttempts,
        backoff: {
          delay: backoffDelay,
          type: 'fixed'
        },
        removeOnComplete: true
      },
      connection: this.connectionConfig.connection
    });
    GroupQueueService._instance = this;
  }

  public static getInstance(): GroupQueueService {
    return GroupQueueService._instance;
  }

  // Key here is an offerId for standard flow and a requestId for group flow
  public async addDealJob(
    key: string,
    value: GroupBookingRequestDBValue
  ): Promise<void> {
    let delay = 30 * 1000; // Start 30s after the booking request.
    if (process.env.NODE_IS_TEST === 'true') {
      delay = 1 * 1000; // Reduce delay for tests.
    }
    await this.dealQueue.add(key, value, {
      jobId: key,
      delay: delay
    });
  }

  public async runGroupDealWorker(): Promise<void> {
    this.dealWorker = new Worker('GroupDeal', groupDealWorker, {
      ...this.connectionConfig,
      concurrency: 3,
      autorun: true
    });

    this.dealWorker.on('completed', async (job: Job) => {
      LogService.green(`Job completed for Request: ${job.id}`);
    });

    this.dealWorker.on('failed', async (job: Job, error: Error) => {
      let newError = false;
      const data: GroupBookingRequestDBValue = job.data;

      if (!data.lastError || data.lastError.message !== error.message) {
        // If the error is the same, it has already been logged
        newError = true;
        data.lastError = error;
      }

      // Update the deal in db if it exists
      if (data.status !== 'pending' && newError) {
        try {
          await groupBookingRequestRepository.updateLastError(
            data.requestId,
            error
          );
          job.update(data);
        } catch (e) {
          LogService.yellow(
            `Groups: reqId: ${data.requestId}: mongodb: ${e.message}`
          );
        }
      }

      // If it is the last retry, we log that.
      if (job.attemptsMade === maxNbAttempts) {
        if (data.status === 'pending') {
          LogService.yellow(
            `Groups: reqId: ${data.requestId}: no payment received after ${maxNbAttempts} attempts`
          );
        } else if (data.status == 'dealError') {
          // If a payment has been made in blockchain, log in red.
          LogService.red(
            `Groups: reqId: ${data.requestId}: process stopped after ${maxNbAttempts} attempts with payment error: ${error.message}`
          );
        } else {
          LogService.yellow(
            `Groups: reqId: ${data.requestId}: process stopped after ${maxNbAttempts} attempts: ${error.message}`
          );
        }
        return;
      }

      // No deal created in blockchain yet, no need to log that.
      if (data.status === 'pending') {
        return;
      }

      // Error has already been logged in the past
      if (!newError) {
        return;
      }

      LogService.yellow(`Groups: reqId: ${data.requestId}: ${error.message}`);
    });
  }

  public async getDealJob(key: string): Promise<GroupBookingRequestDBValue> {
    const job = await this.dealQueue.getJob(key);
    if (!job) {
      throw new Error('JobID not in queue');
    }
    return job.data;
  }

  // TODO: handle blockchain event.
  // We should store the event in the pending Deals, and prioritize it in the queue (and put it back in the queue if it failed and is waiting a new attempt)

  // TODO: Log all exceptions returned by the worker...
  // The only exception that is not really interesting is the lack of deal, unless this is the last attempt...

  public async close(): Promise<void> {
    await this.dealWorker?.close();
    await this.dealScheduler.close();
    await this.dealQueue.close();
  }
}
