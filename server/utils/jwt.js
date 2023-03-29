const jwt = require('jsonwebtoken');
const createJWT = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = (res, user, refreshToken) => {
  const accessTokenJWT = createJWT({ user });
  const refreshTokenJWT = createJWT({ user, refreshToken });
  // (payload = { name: user.name, id: user.id, role: user.role })

  const oneDay = 1000 * 60 * 60 * 24;
  const expiration = 1000 * 60 * 60 * 24 * 30;

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + expiration),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
  return;
};

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
