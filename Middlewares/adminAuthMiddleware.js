const jwt = require('jsonwebtoken')

const adminauthMiddleware = async (req, res, next) => {
    console.log("inside authentication middleware");

    const token = req.headers['authorization']?.split(' ')[1]
    console.log(token);

    if (token) {

        try {

            const jwtResponse = jwt.verify(token, process.env.JWTSECRET)
            console.log(jwtResponse);
            req.payload = jwtResponse.userEmail
            const role= jwtResponse.role
            if (role == 'admin') {

                next()
            }
            else {
                res.status(403).json("Authorization failed...un-authorised access ")
            }

        }
        catch {
            res.status(401).json("invalid Token..Please Login")
        }

    } else {
        res.status(401).json("Authorization failed... Token is missing")

    }

}

module.exports = adminauthMiddleware