const jwt = require('jsonwebtoken');

const secret = '#secureAuthawesoem$@'; 

function generateToken(user)
{
    const payload={
        name:user.name,
        email:user.email,
        role:user.role,
        verified:user.verified,
    };
    const token=jwt.sign(payload,secret);

    return token;
}

function verifyToken(token){

    const payload = jwt.verify(token,secret);
    return payload;
}

module.exports ={generateToken,verifyToken};

