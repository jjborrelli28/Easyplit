import prisma from "@/lib/prisma";

interface RateLimitOptions {
    actorId: string;
    action: string;
    limit: number;
    windowMs: number;
}

/**
 * Simple DB-backed rate limiter (no Redis in this project). There is a
 * known count-then-create race under high concurrency that can let one
 * request over the limit through; acceptable as defense-in-depth, not as
 * a hard limit.
 */
export const consumeRateLimit = async ({
    actorId,
    action,
    limit,
    windowMs,
}: RateLimitOptions): Promise<boolean> => {
    const windowStart = new Date(Date.now() - windowMs);

    const attemptsInWindow = await prisma.rateLimitAttempt.count({
        where: { actorId, action, createdAt: { gte: windowStart } },
    });

    if (attemptsInWindow >= limit) return false;

    await prisma.rateLimitAttempt.create({ data: { actorId, action } });

    return true;
};
