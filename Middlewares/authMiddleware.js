const jwt = require('jsonwebtoken')

const authMiddleware = async (req, res, next) => {
    console.log("inside authentication middleware");

    const token = req.headers['authorization']?.split(' ')[1]
    console.log(token);

    if (token) {

        try {

            const jwtResponse = jwt.verify(token, process.env.JWTSECRET)
            console.log(jwtResponse);
            req.payload = jwtResponse.userEmail
                next()
        
            
            

        }
        catch {
            res.status(401).json("invalid Token..Please Login")
        }

    }else{
            res.status(401).json("Authorization failed... Token is missing")
    
}

}

module.exports = authMiddleware