/**
 * Value Object: Period
 * Representa um período financeiro com validações
 */
export class Period {
  private readonly _startDate: Date;
  private readonly _endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error("Datas inválidas");
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Datas inválidas");
    }

    if (startDate > endDate) {
      throw new Error("Data inicial não pode ser posterior à data final");
    }

    this._startDate = new Date(startDate);
    this._endDate = new Date(endDate);
  }

  get startDate(): Date {
    return new Date(this._startDate);
  }

  get endDate(): Date {
    return new Date(this._endDate);
  }

  getDurationInDays(): number {
    const diff = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  contains(date: Date): boolean {
    return date >= this._startDate && date <= this._endDate;
  }

  overlaps(other: Period): boolean {
    return (
      this._startDate <= other._endDate && this._endDate >= other._startDate
    );
  }

  equals(other: Period): boolean {
    return (
      this._startDate.getTime() === other._startDate.getTime() &&
      this._endDate.getTime() === other._endDate.getTime()
    );
  }

  toString(): string {
    return `${this._startDate.toISOString().split("T")[0]} - ${this._endDate.toISOString().split("T")[0]}`;
  }

  toJSON(): { startDate: string; endDate: string } {
    return {
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
    };
  }

  static currentMonth(): Period {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return new Period(start, end);
  }

  static lastMonth(): Period {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return new Period(start, end);
  }

  static currentYear(): Period {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return new Period(start, end);
  }

  static custom(startDate: Date, endDate: Date): Period {
    return new Period(startDate, endDate);
  }
}
