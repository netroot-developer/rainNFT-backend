// Auto-sync: har request par latest user fields session me daal do
exports.syncUserSession = async function syncUserSession(req, res, next) {
    try {
        if (req.session && req.session.user && req.session.user.id) {
            const {user} = req.session;
            if (user) {
                req.session.user = {
                    id: user?._id.toString(),
                    username: user?.username,
                    email: user?.email,
                    mobile: user?.mobile,
                    lastLogin: user?.lastLogin,
                };
            }
        }
        next();
    } catch (e) {
        next(e);
    }
};
