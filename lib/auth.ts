import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AuthRole = "admin" | "customer";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: AuthRole;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment variables");
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload;
}

export function getTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export function requireAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  
  // Special case: allow 'local-demo-token' for offline demo access
  if (token === 'local-demo-token') {
    return {
      payload: {
        userId: 'admin_local',
        email: 'admin@kitchenrahasya.com',
        role: 'admin' as AuthRole,
      },
      error: null,
    };
  }
  
  if (!token) {
    return { payload: null, error: "Unauthorized" };
  }

  try {
    const payload = verifyAuthToken(token);
    return { payload, error: null };
  } catch {
    return { payload: null, error: "Invalid or expired token" };
  }
}

export function requireAdmin(req: NextRequest) {
  const token = getTokenFromRequest(req);
  
  // Special case: allow 'local-demo-token' for offline demo access
  if (token === 'local-demo-token') {
    return {
      payload: {
        userId: 'admin_local',
        email: 'admin@kitchenrahasya.com',
        role: 'admin' as AuthRole,
      },
      error: null,
    };
  }
  
  const auth = requireAuth(req);
  if (auth.error || !auth.payload) {
    return auth;
  }
  if (auth.payload.role !== "admin") {
    return { payload: null, error: "Forbidden" };
  }
  return auth;
}
