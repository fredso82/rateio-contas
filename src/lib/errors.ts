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

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Algo saiu do trilho. Tente novamente em instantes.",
) {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export function logServerError(context: string, error: unknown) {
  logger.error(context, error);
}
