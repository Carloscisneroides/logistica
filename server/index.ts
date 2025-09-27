/*
 * YCore SaaS Ecosystem - Backend Server
 * Copyright © 2025 YCore SRL Innovativa - All Rights Reserved
 * 
 * WATERMARK: ycore-server-d7e8f9a0-1b2c-3d4e-5f6a-7b8c9d0e1f2a
 * BUILD: 2025-09-27T22:08:15.000Z
 * MODULE: Express API Server & Authentication
 * 
 * THIS IS PROPRIETARY SOFTWARE CONTAINING TRADE SECRETS AND CONFIDENTIAL
 * INFORMATION. UNAUTHORIZED ACCESS, USE, OR DISCLOSURE IS PROHIBITED.
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import crypto from "crypto";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// **IP PROTECTION & DEMO SECURITY LOGGING** - YCore SRL Innovativa
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const requestId = crypto.randomUUID().slice(0, 8); // Short request ID

  // **SECURITY LOGGING**: Track all access attempts for IP protection
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const isDemo = process.env.NODE_ENV === 'development';
  
  // Log access attempts with IP tracking for security monitoring (NO response data)
  const securityLog = `[IP_TRACKING] ${requestId} | ${clientIP} | ${req.method} ${path} | ${userAgent.slice(0, 50)}`;
  console.log(securityLog);
  
  // **DEMO PROTECTION**: Enhanced logging for demo sessions
  if (isDemo && (path.startsWith('/api/auth') || path.includes('login'))) {
    console.log(`[DEMO_ACCESS] ${requestId} | AUTHENTICATION ATTEMPT | IP: ${clientIP} | Path: ${path} | Time: ${new Date().toISOString()}`);
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // **UNAUTHORIZED ACCESS LOGGING**: Track failed authentication attempts (NO response data)
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.log(`[SECURITY_ALERT] ${requestId} | UNAUTHORIZED ACCESS | IP: ${clientIP} | Path: ${path} | Status: ${res.statusCode} | Time: ${new Date().toISOString()}`);
    }
    
    // **SECURE API LOGGING**: Only metadata, NO response body to prevent PII leakage
    if (path.startsWith("/api")) {
      const logLine = `[API] ${requestId} | ${req.method} ${path} | ${res.statusCode} | ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
