const DEFAULT_EPOCH = 1577836800000n;

export class Snowflake {
  private readonly twepoch: bigint;
  private readonly workerIdBits = 5n;
  private readonly datacenterIdBits = 5n;
  private readonly sequenceBits = 12n;
  private readonly maxWorkerId = (1n << this.workerIdBits) - 1n;
  private readonly maxDatacenterId = (1n << this.datacenterIdBits) - 1n;
  private readonly workerIdShift = this.sequenceBits;
  private readonly datacenterIdShift = this.sequenceBits + this.workerIdBits;
  private readonly timestampLeftShift =
    this.sequenceBits + this.workerIdBits + this.datacenterIdBits;
  private readonly sequenceMask = (1n << this.sequenceBits) - 1n;

  private lastTimestamp = -1n;
  private sequence = 0n;

  constructor(
    private readonly workerId: bigint = 0n,
    private readonly datacenterId: bigint = 0n,
    epoch: bigint = DEFAULT_EPOCH,
  ) {
    if (workerId > this.maxWorkerId || workerId < 0n) {
      throw new Error('workerId out of range');
    }
    if (datacenterId > this.maxDatacenterId || datacenterId < 0n) {
      throw new Error('datacenterId out of range');
    }
    this.twepoch = epoch;
  }

  nextId(): string {
    let timestamp = this.currentTime();

    if (timestamp < this.lastTimestamp) {
      timestamp = this.lastTimestamp;
    }

    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1n) & this.sequenceMask;
      if (this.sequence === 0n) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.twepoch) << this.timestampLeftShift) |
      (this.datacenterId << this.datacenterIdShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence;
    return id.toString();
  }

  private tilNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.currentTime();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTime();
    }
    return timestamp;
  }

  private currentTime(): bigint {
    return BigInt(Date.now());
  }
}

export const defaultSnowflake = new Snowflake(0n, 0n);

export function generateSnowflakeId(): string {
  return defaultSnowflake.nextId();
}
