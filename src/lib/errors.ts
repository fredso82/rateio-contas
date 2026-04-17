import { logger } from "@/lib/logger";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code = "APP_ERROR",
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function serializeErrorForLog(error: unknown) {
  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }

  return {
    value: String(error),
  };
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Algo saiu do trilho. Tente novamente em instantes.",
) {
  if (error instanceof AppError) {
    return error.message;
  }

  return fallbackMessage;
}

export function logServerError(context: string, error: unknown) {
  logger.error(context, serializeErrorForLog(error));
}
