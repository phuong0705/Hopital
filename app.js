const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const routes = require('./routes');
const { exposeUser } = require('./middlewares/auth.middleware');
const formatters = require('./services/formatters');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

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
