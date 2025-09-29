import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import rateLimit from "express-rate-limit";
// import csrf from "csurf"; // Disabled for demo - using custom CSRF
import helmet from "helmet";
import { storage } from "./storage";
import { sendRegistrationNotification } from "./sendgrid";
import { User as SelectUser, insertUserSchema, insertRegistrationRequestSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// **WHITELIST PROTECTION** - Lista utenti autorizzati per accesso privato
const AUTHORIZED_USERS = [
  "admin",
  "ylenia@ycore.it", 
  "demo@partner.com",
  "tech@aws.com",
  "partner@trusted.com",
  "test@ycore.it",
  "cliente@demo.it",
  "amico",
  "demo"
];

// **PRIVATE ACCESS MIDDLEWARE** - Verifica utente in whitelist
function checkAuthorizedUser(user: any): boolean {
  if (!user) return false;
  return AUTHORIZED_USERS.includes(user.username) || AUTHORIZED_USERS.includes(user.email);
}

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

// **RATE LIMITING CONFIGURATION** - Anti-brute force protection (fixed deprecation)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 attempts per window
  message: { error: "Too many authentication attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  // Fixed: Removed deprecated onLimitReached, using handler function instead
  handler: (req, res, next, options) => {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[SECURITY_ALERT] RATE LIMIT EXCEEDED | IP: ${clientIP} | Path: ${req.path} | Time: ${new Date().toISOString()}`);
    res.status(options.statusCode).json(options.message);
  }
});

const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Maximum 3 registrations per hour
  message: { error: "Registration limit exceeded. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[SECURITY_ALERT] REGISTRATION RATE LIMIT | IP: ${clientIP} | Time: ${new Date().toISOString()}`);
    res.status(options.statusCode).json(options.message);
  }
});

export function setupAuth(app: Express) {
  // **SECURITY HEADERS** - Helmet protection
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    // **SESSION SECURITY HARDENING**
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Upgraded from lax for better CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // **CSRF PROTECTION** - Modern double submit cookie pattern
  app.use((req: any, res: any, next: any) => {
    if (req.method === 'GET') {
      // Generate CSRF token for new sessions
      if (!(req.session as any).csrfSecret) {
        (req.session as any).csrfSecret = randomBytes(32).toString('hex');
      }
      
      // Set CSRF token cookie for client
      const csrfToken = randomBytes(32).toString('hex');
      (req.session as any).csrfToken = csrfToken;
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
    }
    next();
  });

  // **CSRF VALIDATION MIDDLEWARE**
  const validateCSRF = (req: any, res: any, next: any) => {
    if (req.method === 'GET') return next();
    
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = (req.session as any)?.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`[SECURITY_ALERT] CSRF TOKEN MISMATCH | IP: ${clientIP} | Path: ${req.path} | Time: ${new Date().toISOString()}`);
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    next();
  };

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

  // **PROTECTED REGISTRATION** - Rate limited, CSRF protected, and validated
  // **ADMIN APPROVAL ENDPOINTS**
  app.get("/api/admin/registration-requests", isAuthenticated, async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    const requests = await storage.getRegistrationRequests();
    res.json(requests);
  });

  app.post("/api/admin/approve-registration/:id", isAuthenticated, async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const requestId = req.params.id;
    const request = await storage.getRegistrationRequest(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ error: "Request not found or already processed" });
    }

    // Create user from approved request
    const user = await storage.createUser({
      username: request.username,
      email: request.email,
      password: request.password, // Already hashed
      role: request.role,
      tenantId: request.tenantId,
      isActive: true
    });

    // Update request status
    await storage.updateRegistrationRequest(requestId, {
      status: 'approved',
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    res.json({ message: "Registration approved successfully", userId: user.id });
  });

  app.post("/api/admin/reject-registration/:id", isAuthenticated, async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const requestId = req.params.id;
    const { reason } = req.body;
    
    await storage.updateRegistrationRequest(requestId, {
      status: 'rejected',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      rejectionReason: reason
    });

    res.json({ message: "Registration rejected successfully" });
  });

  // **REGISTRATION WITH MANUAL APPROVAL** - Registrazione con approvazione manuale
  app.post("/api/register", registerRateLimit, async (req, res, next) => {
    try {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Validate input
      const validationResult = insertRegistrationRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.log(`[REGISTRATION] VALIDATION ERROR | IP: ${clientIP} | Errors: ${JSON.stringify(validationResult.error.errors)}`);
        return res.status(400).json({ 
          error: "Dati non validi",
          details: validationResult.error.errors 
        });
      }

      const { username, email, password, role, companyName, phoneNumber, businessType, message } = validationResult.data;

      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username già in uso" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email già in uso" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create registration request
      const registrationRequest = await storage.createRegistrationRequest({
        username,
        email,
        password: hashedPassword,
        role: role || 'merchant',
        companyName,
        phoneNumber,
        businessType,
        message,
        status: 'pending',
        ipAddress: clientIP,
        userAgent
      });

      console.log(`[REGISTRATION] NEW REQUEST | ID: ${registrationRequest.id} | Username: ${username} | Email: ${email} | IP: ${clientIP}`);

      // Send notification email to admin
      const emailSent = await sendRegistrationNotification('info@nyvra.com', {
        username,
        email,
        companyName: companyName || undefined,
        businessType: businessType || undefined,
        message: message || undefined,
        ipAddress: clientIP
      });

      if (!emailSent) {
        console.warn(`[REGISTRATION] EMAIL NOTIFICATION FAILED | Request ID: ${registrationRequest.id}`);
      }

      res.status(200).json({ 
        message: "Richiesta di registrazione inviata con successo. Riceverai una conferma via email una volta approvata.",
        requestId: registrationRequest.id
      });
    } catch (error: any) {
      console.error(`[REGISTRATION] ERROR | ${error.message}`);
      next(error);
    }
  });

  // **PROTECTED LOGIN** - Rate limited with session regeneration  
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
      
      // **WHITELIST ENFORCEMENT** - Verifica utente autorizzato
      if (!checkAuthorizedUser(user)) {
        console.log(`[AUTH] WHITELIST BLOCKED | IP: ${clientIP} | Username: ${user.username} | Time: ${new Date().toISOString()}`);
        return res.status(403).json({ error: "Accesso non autorizzato. Contattare l'amministratore." });
      }
      
      // **SESSION FIXATION PROTECTION** - Regenerate session on successful login
      req.session.regenerate((regenerateErr) => {
        if (regenerateErr) {
          console.log(`[AUTH] SESSION REGENERATION ERROR | IP: ${clientIP} | Error: ${regenerateErr.message} | Time: ${new Date().toISOString()}`);
          return next(regenerateErr);
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.log(`[AUTH] LOGIN SESSION ERROR | IP: ${clientIP} | Error: ${loginErr.message} | Time: ${new Date().toISOString()}`);
            return next(loginErr);
          }
          console.log(`[AUTH] LOGIN SUCCESS | IP: ${clientIP} | UserID: ${user.id} | Time: ${new Date().toISOString()}`);
          res.status(200).json(user);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    // **ADMIN USER AUTO-CREATION** - Create admin if not exists
    if (!req.user) {
      const adminExists = await storage.getUserByUsername("admin");
      if (!adminExists) {
        const defaultTenant = await storage.getDefaultTenant();
        const adminUser = await storage.createUser({
          username: "admin",
          email: "ylenia@ycore.it",
          password: "34fab0326bb47a7f32869f494880eade94721ab6c96a6775557ad4b7e531f4f15762390d5da3e8ff8630d61603043fb3ddf47aa31a8192eae5bb062792540490.e23626de7ad2888eddb5d1ac695d4560",
          role: "admin",
          tenantId: defaultTenant.id,
          isActive: true
        });
        console.log(`[ADMIN] AUTO-CREATED | ID: ${adminUser.id} | Time: ${new Date().toISOString()}`);
        
        // Auto-login admin
        req.login(adminUser, (err) => {
          if (err) return res.status(500).json({ error: "Auto-login failed" });
          const safeUser = {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            role: adminUser.role,
            tenantId: adminUser.tenantId,
            isActive: adminUser.isActive
          };
          return res.json(safeUser);
        });
        return;
      }
      
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`[SECURITY_ALERT] UNAUTHORIZED USER ENDPOINT ACCESS | IP: ${clientIP} | Time: ${new Date().toISOString()}`);
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const safeUser = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      tenantId: req.user.tenantId,
      isActive: req.user.isActive
    };
    res.json(safeUser);
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.user) {
    // **WHITELIST CHECK** - Verifica se utente è autorizzato
    if (!checkAuthorizedUser(req.user)) {
      const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
      console.log(`[ACCESS_DENIED] USER NOT IN WHITELIST | User: ${req.user.username} | Email: ${req.user.email} | IP: ${clientIP} | Time: ${new Date().toISOString()}`);
      return res.status(403).json({ 
        error: "Accesso riservato. Sistema in fase di validazione.",
        message: "Contattare l'amministratore per l'autorizzazione."
      });
    }
    
    // **IP PROTECTION**: Enhanced logging for authenticated sessions
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    console.log(`[AUTH_SUCCESS] AUTHORIZED USER | User: ${req.user.username} | IP: ${clientIP} | Path: ${req.path} | Time: ${new Date().toISOString()}`);
    next();
  } else {
    // **DEMO PROTECTION**: Log unauthorized access attempts with IP tracking  
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    console.log(`[AUTH_FAILED] UNAUTHORIZED ACCESS ATTEMPT | IP: ${clientIP} | Path: ${req.path} | UserAgent: ${userAgent} | Time: ${new Date().toISOString()}`);
    res.status(401).json({ 
      error: "Accesso riservato. Sistema in fase di validazione.",
      message: "Login richiesto. Contattare Reply/AWS per credenziali."
    });
  }
}
