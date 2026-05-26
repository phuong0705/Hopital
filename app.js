const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const routes = require('./routes');
const authController = require('./controllers/auth.controller');
const { exposeUser, requireAuth, redirectIfAuthenticated } = require('./middlewares/auth.middleware');
const { requireRole } = require('./middlewares/role.middleware');
const formatters = require('./services/formatters');
const { proxyToReportsFrontend } = require('./services/frontendProxy');

const app = express();
const PORT = process.env.PORT || 3003;
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.REPORTS_FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3011'
]
  .filter(Boolean)
  .map((origin) => {
    try {
      return new URL(origin).origin;
    } catch (error) {
      return origin;
    }
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/framer-motion', express.static(path.join(__dirname, 'node_modules', 'framer-motion', 'dist')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8
  }
}));
app.use(flash());
app.use(exposeUser);

app.locals.format = formatters;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend dang hoat dong'
  });
});

app.get('/login', redirectIfAuthenticated, authController.showLogin);
app.post('/login', redirectIfAuthenticated, authController.login);
app.get('/register', redirectIfAuthenticated, authController.showRegister);
app.post('/register', redirectIfAuthenticated, authController.register);
app.get('/forgot-password', redirectIfAuthenticated, authController.showForgotPassword);
app.post('/forgot-password', redirectIfAuthenticated, authController.resetPassword);
app.post('/logout', authController.logout);

app.use('/_next', proxyToReportsFrontend);
app.use('/reports', requireAuth, requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), proxyToReportsFrontend);
app.use('/doctor-dashboard', requireAuth, requireRole(['DOCTOR']), proxyToReportsFrontend);
app.use(routes);

app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: 'Không tìm thấy',
    activeMenu: ''
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('errors/500', {
    title: 'Lỗi hệ thống',
    activeMenu: '',
    error: process.env.NODE_ENV === 'development' ? err : null,
    errorMessage: err.message || 'Không xác định được nguyên nhân lỗi.'
  });
});

app.listen(PORT, () => {
  console.log(`He thong dang chay tai http://localhost:${PORT}`);
});
