import PocketBase from 'pocketbase';
import Anthropic from '@anthropic-ai/sdk';
import { OPERATION_COSTS, type AIOperation } from '@paintpile/shared';

const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

export function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  return new Anthropic({ apiKey });
}

export async function validatePBAuth(pbToken: string): Promise<{ pb: PocketBase; userId: string; user: Record<string, unknown> }> {
  const pb = new PocketBase(pbUrl);
  pb.authStore.save(pbToken, null);

  try {
    const result = await pb.collection('users').authRefresh();
    return { pb, userId: result.record.id, user: result.record as unknown as Record<string, unknown> };
  } catch {
    throw new Error('Invalid auth token');
  }
}

export async function validateAndDeductCredits(
  pb: PocketBase,
  userId: string,
  operation: AIOperation
): Promise<{ creditsUsed: number }> {
  const cost = OPERATION_COSTS[operation];

  // Get or create ai_quota record for this user
  let quota;
  try {
    const quotas = await pb.collection('ai_quota').getFullList({
      filter: `user="${userId}"`,
    });
    quota = quotas[0];
  } catch {
    // Collection might not exist yet — skip quota check
    return { creditsUsed: cost };
  }

  if (quota) {
    const monthKey = getMonthKey();
    const monthlyUsage = quota.monthly_usage || {};
    const currentMonthUsage = monthlyUsage[monthKey] || 0;
    // Pro users get 2000 credits, free users get 500
    const user = await pb.collection('users').getOne(userId);
    const defaultLimit = user.subscription === 'pro' ? 2000 : 500;
    const limit = quota.monthly_limit || defaultLimit;

    if (currentMonthUsage + cost > limit) {
      const isPro = user.subscription === 'pro';
      const upgradeHint = isPro ? '' : ' Upgrade to Pro for 4x more credits!';
      throw new Error(`Insufficient credits. ${limit - currentMonthUsage} remaining, ${cost} needed.${upgradeHint}`);
    }

    // Deduct credits
    monthlyUsage[monthKey] = currentMonthUsage + cost;
    await pb.collection('ai_quota').update(quota.id, {
      monthly_usage: monthlyUsage,
      total_used: (quota.total_used || 0) + cost,
    });
  }

  // Log usage
  try {
    await pb.collection('ai_usage').create({
      user: userId,
      operation,
      credits: cost,
      month_key: getMonthKey(),
    });
  } catch {
    // ai_usage collection might not exist yet
  }

  return { creditsUsed: cost };
}

const ALLOWED_IMAGE_HOSTS = [
  'thepaintpile.com',
  '127.0.0.1',
  'localhost',
];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mediaType: string }> {
  // SSRF prevention: only allow HTTPS (or HTTP for local dev) from known hosts
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new Error('Invalid image URL');
  }

  const isLocal = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  if (!isLocal && parsed.protocol !== 'https:') {
    throw new Error('Only HTTPS image URLs are allowed');
  }

  const pbHost = process.env.POCKETBASE_URL ? new URL(process.env.POCKETBASE_URL).hostname : null;
  const allowed = [...ALLOWED_IMAGE_HOSTS, ...(pbHost ? [pbHost] : [])];
  if (!allowed.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
    throw new Error('Image host not allowed');
  }

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Failed to fetch image');

  // Guard against huge responses
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_BYTES) {
    throw new Error('Image too large');
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_IMAGE_BYTES) throw new Error('Image too large');

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const base64 = Buffer.from(buffer).toString('base64');

  // Map content type to Anthropic's expected media types
  let mediaType = contentType.split(';')[0].trim();
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mediaType)) {
    mediaType = 'image/jpeg';
  }

  return { base64, mediaType };
}

/** Strip markdown code fences (```json ... ```) that Claude sometimes wraps around JSON responses */
export function parseAIJson(text: string): unknown {
  let cleaned = text.trim();
  // Remove ```json or ``` prefix and trailing ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}
