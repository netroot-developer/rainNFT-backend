const jwt = require('jsonwebtoken');
// Compare password
exports.getToken = async function (user) {
    return await jwt.sign({_id:user?._id,email:user?.email,role:user?.role}, process.env.JWT_SECRET, {expiresIn: '30d' });
};
// Compare password
exports.verifyToken = async function (token) {
    return await jwt.verify(token, process.env.JWT_SECRET);
};

