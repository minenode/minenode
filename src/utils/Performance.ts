export class Performance {
  public readonly samples: { [i: number]: bigint | number | undefined };
  public readonly n: number;

  public constructor(n: number) {
    this.samples = new Array(n);
    this.n = n;
  }

  public start(): void {
    this.samples[this.n - 1] = process.hrtime.bigint();
  }

  public tick(): void {
    // Shift samples
    for (let i = 0; i < this.n - 1; i++) {
      this.samples[i] = this.samples[i + 1];
    }
    // Record diff to last sample
    if (typeof this.samples[this.n - 2] === "bigint") {
      this.samples[this.n - 2] = Number(process.hrtime.bigint() - (this.samples[this.n - 2] as bigint));
    }
    this.samples[this.n - 1] = process.hrtime.bigint();
  }

  public get average(): number {
    let sum: number | undefined = undefined;
    let count = 0;
    for (let i = 0; i < this.n - 1; i++) {
      if (typeof this.samples[i] !== "number") {
        continue;
      } else if (typeof sum === "undefined") {
        sum = this.samples[i] as number;
        count++;
      } else {
        sum += this.samples[i] as number;
        count++;
      }
    }
    if (typeof sum === "undefined") {
      return 0;
    }
    return sum / count;
  }
}
