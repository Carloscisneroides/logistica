import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// **RATE LIMITING CONFIGURATION** - Anti-brute force protection
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 attempts per window
  message: { error: "Too many authentication attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  // Enhanced logging for security monitoring
  onLimitReached: (req, res, options) => {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[SECURITY_ALERT] RATE LIMIT EXCEEDED | IP: ${clientIP} | Path: ${req.path} | Time: ${new Date().toISOString()}`);
  },
  skip: (req) => {
    // Skip rate limiting for trusted internal IPs (optional)
    return false;
  }
});

const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Maximum 3 registrations per hour
  message: { error: "Registration limit exceeded. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res, options) => {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[SECURITY_ALERT] REGISTRATION RATE LIMIT | IP: ${clientIP} | Time: ${new Date().toISOString()}`);
  }
});

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    // **SESSION SECURITY HARDENING**
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  // **PROTECTED REGISTRATION** - Rate limited and validated
  app.post("/api/register", registerRateLimit, async (req, res, next) => {
    try {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`[AUTH] REGISTRATION ATTEMPT | IP: ${clientIP} | Username: ${req.body.username} | Time: ${new Date().toISOString()}`);
      
      // Basic input validation
      if (!req.body.username || !req.body.password || req.body.username.length < 3 || req.body.password.length < 6) {
        return res.status(400).json({ error: "Invalid username or password format" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log(`[AUTH] REGISTRATION FAILED | IP: ${clientIP} | Reason: Username exists | Time: ${new Date().toISOString()}`);
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        console.log(`[AUTH] REGISTRATION SUCCESS | IP: ${clientIP} | UserID: ${user.id} | Time: ${new Date().toISOString()}`);
        res.status(201).json(user);
      });
    } catch (error: any) {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`[AUTH] REGISTRATION ERROR | IP: ${clientIP} | Error: ${error.message} | Time: ${new Date().toISOString()}`);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // **PROTECTED LOGIN** - Rate limited with enhanced logging
  app.post("/api/login", authRateLimit, (req, res, next) => {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[AUTH] LOGIN ATTEMPT | IP: ${clientIP} | Username: ${req.body.username} | Time: ${new Date().toISOString()}`);
    
    passport.authenticate("local", (err: any, user: any) => {
      if (err) {
        console.log(`[AUTH] LOGIN ERROR | IP: ${clientIP} | Error: ${err.message} | Time: ${new Date().toISOString()}`);
        return next(err);
      }
      
      if (!user) {
        console.log(`[AUTH] LOGIN FAILED | IP: ${clientIP} | Username: ${req.body.username} | Time: ${new Date().toISOString()}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.log(`[AUTH] LOGIN SESSION ERROR | IP: ${clientIP} | Error: ${loginErr.message} | Time: ${new Date().toISOString()}`);
          return next(loginErr);
        }
        console.log(`[AUTH] LOGIN SUCCESS | IP: ${clientIP} | UserID: ${user.id} | Time: ${new Date().toISOString()}`);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    // **IP PROTECTION**: Secure user endpoint - NO hardcoded access
    if (!req.user) {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`[SECURITY_ALERT] UNAUTHORIZED USER ENDPOINT ACCESS | IP: ${clientIP} | Time: ${new Date().toISOString()}`);
      return res.status(401).json({ error: "Authentication required" });
    }
    res.json(req.user);
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.user) {
    // **IP PROTECTION**: Enhanced logging for authenticated sessions
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[AUTH_SUCCESS] User ${req.user.id} | IP: ${clientIP} | Path: ${req.path} | Time: ${new Date().toISOString()}`);
    next();
  } else {
    // **DEMO PROTECTION**: Log unauthorized access attempts with IP tracking  
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    console.log(`[AUTH_FAILED] UNAUTHORIZED ACCESS ATTEMPT | IP: ${clientIP} | Path: ${req.path} | UserAgent: ${userAgent} | Time: ${new Date().toISOString()}`);
    res.status(401).json({ error: "Authentication required - Contact Reply/AWS for access" });
  }
}
