export interface IQuery {}

export interface IQueryHandler<T extends IQuery, R = unknown> {
  execute(query: T): Promise<R>;
}

export class QueryBus {
  private handlers = new Map<string, IQueryHandler<IQuery, unknown>>();

  public register(queryName: string, handler: IQueryHandler<IQuery, unknown>): void {
    if (this.handlers.has(queryName)) {
      throw new Error(`QueryHandler for ${queryName} is already registered.`);
    }
    this.handlers.set(queryName, handler);
  }

  public async execute<T extends IQuery, R = unknown>(query: T): Promise<R> {
    const queryName = query.constructor.name;
    const handler = this.handlers.get(queryName);

    if (!handler) {
      throw new Error(`No QueryHandler registered for ${queryName}`);
    }

    return handler.execute(query) as Promise<R>;
  }

  /**
   * Execute a query by an explicit string key.
   * Preferred over `execute` to avoid reliance on class name inference.
   */
  public async executeByKey<R = unknown>(queryName: string, payload: unknown): Promise<R> {
    const handler = this.handlers.get(queryName);

    if (!handler) {
      throw new Error(`No QueryHandler registered for "${queryName}"`);
    }

    return handler.execute(payload as IQuery) as Promise<R>;
  }
}
