export class UnknownError extends Error {
  constructor(error?: unknown) {
    super(
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error on the server!",
    );
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
