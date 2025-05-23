/**
 * This file was auto-generated by Fern from our API Definition.
 */

/**
 * The health status of the service
 */
export type HealthServiceStatus = "healthy" | "degraded" | "down" | "unknown";
export const HealthServiceStatus = {
    Healthy: "healthy",
    Degraded: "degraded",
    Down: "down",
    Unknown: "unknown",
} as const;
