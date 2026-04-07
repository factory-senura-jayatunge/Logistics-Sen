/**
 * Structured logging configuration using pino.
 *
 * This module provides a configured logger for the Acme Logistics frontend
 * with structured JSON output for better observability.
 */

import pino from "pino"

const isServer = typeof window === "undefined"
const isDevelopment = process.env.NODE_ENV === "development"

/**
 * Create a pino logger instance with appropriate configuration
 * for both server and client environments.
 */
const logger = pino({
  name: "acme-logistics-frontend",
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  browser: {
    asObject: true,
  },
  base: {
    env: process.env.NODE_ENV || "development",
    ...(isServer && { pid: process.pid }),
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

/**
 * Create a child logger with additional context
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context)
}

/**
 * Log API request/response for observability
 */
export function logApiCall(method: string, url: string, status: number, durationMs: number) {
  logger.info(
    {
      event: "api_call",
      method,
      url,
      status,
      duration_ms: durationMs,
    },
    `${method} ${url} - ${status} (${durationMs}ms)`
  )
}

/**
 * Log user actions for analytics
 */
export function logUserAction(action: string, details?: Record<string, unknown>) {
  logger.info(
    {
      event: "user_action",
      action,
      ...details,
    },
    `User action: ${action}`
  )
}

/**
 * Log errors with stack trace
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error(
    {
      event: "error",
      error_name: error.name,
      error_message: error.message,
      stack: error.stack,
      ...context,
    },
    error.message
  )
}

export default logger
