const bcrypt = require('bcryptjs');
const authRepository = require('../repositories/auth.repository');

function showLogin(req, res) {
  res.render('auth/login', {
    title: 'Đăng nhập',
    layout: false
  });
}

function showRegister(req, res) {
  res.render('auth/register', {
    title: 'Đăng ký tài khoản',
    layout: false,
    form: {}
  });
}

function showForgotPassword(req, res) {
  res.render('auth/forgot-password', {
    title: 'Quên mật khẩu',
    layout: false,
    form: {}
  });
}

async function login(req, res, next) {
  try {
    const { login, password } = req.body;
    const user = await authRepository.findUserByLogin(login);

    if (!user || user.status !== 'Hoạt động') {
      req.flash('error', 'Tài khoản không tồn tại hoặc đang bị khóa.');
      return res.redirect('/login');
    }

    const isBcryptHash = /^\$2[aby]\$/.test(user.passwordHash || '');
    const validPassword = isBcryptHash
      ? await bcrypt.compare(password, user.passwordHash)
      : password === user.passwordHash;

    if (!validPassword) {
      req.flash('error', 'Mật khẩu không chính xác.');
      return res.redirect('/login');
    }

    req.session.user = {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      patientId: user.patientId,
      departmentId: user.departmentId,
      departmentName: user.departmentName,
      roleCode: user.roleCode,
      roleName: user.roleName
    };

    req.flash('success', `Xin chào ${user.fullName}. Chúc bạn một ca làm việc hiệu quả.`);
    if (user.roleCode === 'PATIENT') return res.redirect('/patients/me');
    return res.redirect('/dashboard/home');
  } catch (error) {
    return next(error);
  }
}

async function register(req, res, next) {
  const form = req.body;

  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      fullName,
      dateOfBirth,
      gender,
      identityNumber,
      phone
    } = form;

    if (!username || !email || !password || !confirmPassword || !fullName || !dateOfBirth || !gender) {
      req.flash('error', 'Vui lòng nhập đầy đủ các thông tin bắt buộc.');
      return res.render('auth/register', { title: 'Đăng ký tài khoản', layout: false, form });
    }

    if (password.length < 6) {
      req.flash('error', 'Mật khẩu cần tối thiểu 6 ký tự.');
      return res.render('auth/register', { title: 'Đăng ký tài khoản', layout: false, form });
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Mật khẩu xác nhận không khớp.');
      return res.render('auth/register', { title: 'Đăng ký tài khoản', layout: false, form });
    }

    const existing = await authRepository.findUserByLogin(username) || await authRepository.findUserByLogin(email);
    if (existing) {
      req.flash('error', 'Username hoặc email đã được sử dụng.');
      return res.render('auth/register', { title: 'Đăng ký tài khoản', layout: false, form });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await authRepository.createPatientAccount({
      username,
      email,
      passwordHash,
      fullName,
      dateOfBirth,
      gender,
      identityNumber,
      phone
    });

    req.flash('success', 'Đăng ký thành công. Bạn có thể đăng nhập bằng tài khoản vừa tạo.');
    return res.redirect('/login');
  } catch (error) {
    if (error.number === 2627 || error.number === 2601) {
      req.flash('error', 'Username, email hoặc mã bệnh nhân đã tồn tại.');
      return res.render('auth/register', { title: 'Đăng ký tài khoản', layout: false, form });
    }

    return next(error);
  }
}

async function resetPassword(req, res, next) {
  const form = req.body;

  try {
    const { login, password, confirmPassword } = form;

    if (!login || !password || !confirmPassword) {
      req.flash('error', 'Vui lòng nhập tài khoản và mật khẩu mới.');
      return res.render('auth/forgot-password', { title: 'Quên mật khẩu', layout: false, form });
    }

    if (password.length < 6) {
      req.flash('error', 'Mật khẩu mới cần tối thiểu 6 ký tự.');
      return res.render('auth/forgot-password', { title: 'Quên mật khẩu', layout: false, form });
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Mật khẩu xác nhận không khớp.');
      return res.render('auth/forgot-password', { title: 'Quên mật khẩu', layout: false, form });
    }

    const user = await authRepository.findUserByLogin(login);
    if (!user) {
      req.flash('error', 'Không tìm thấy tài khoản phù hợp.');
      return res.render('auth/forgot-password', { title: 'Quên mật khẩu', layout: false, form });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await authRepository.updatePassword(login, passwordHash);

    req.flash('success', 'Đã cập nhật mật khẩu. Vui lòng đăng nhập lại.');
    return res.redirect('/login');
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

module.exports = {
  showLogin,
  showRegister,
  showForgotPassword,
  login,
  register,
  resetPassword,
  logout
};
