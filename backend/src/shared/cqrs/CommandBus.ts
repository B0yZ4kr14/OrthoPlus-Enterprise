export interface ICommand {}

export interface ICommandHandler<T extends ICommand, R = unknown> {
  execute(command: T): Promise<R>;
}

export class CommandBus {
  private handlers = new Map<string, ICommandHandler<ICommand, unknown>>();

  public register(commandName: string, handler: ICommandHandler<ICommand, unknown>): void {
    if (this.handlers.has(commandName)) {
      throw new Error(`CommandHandler for ${commandName} is already registered.`);
    }
    this.handlers.set(commandName, handler);
  }

  /**
   * Execute a command by inferring the handler key from `command.constructor.name`.
   *
   * NOTE: This approach only works reliably when class names are not mangled by
   * a minifier. Prefer `executeByKey` for new code.
   */
  public async execute<T extends ICommand, R = void>(command: T): Promise<R> {
    const commandName = command.constructor.name;
    const handler = this.handlers.get(commandName);

    if (!handler) {
      throw new Error(`No CommandHandler registered for ${commandName}`);
    }

    return handler.execute(command) as Promise<R>;
  }

  /**
   * Execute a command by an explicit string key.
   *
   * This is the preferred dispatch method because it is not affected by class
   * name mangling and makes the routing relationship explicit and searchable.
   *
   * @example
   *   commandBus.register("CreatePatient", new CreatePatientHandler(repo));
   *   const result = await commandBus.executeByKey("CreatePatient", dto);
   */
  public async executeByKey<R = void>(commandName: string, payload: unknown): Promise<R> {
    const handler = this.handlers.get(commandName);

    if (!handler) {
      throw new Error(`No CommandHandler registered for "${commandName}"`);
    }

    return handler.execute(payload as ICommand) as Promise<R>;
  }
}
