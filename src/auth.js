module.exports = function (req, res, next) {
  	const token = req.header("x-auth-token");
  	if (!token) {
		return res.status(401).json({
			message: 'Access denied.',
		});
  	}
  
  	if (token !== process.env.AUTHTOKEN){
		return res.status(401).json({
			message: 'Access denied. Invalid Token',
		});
 	}
	
 	next();
};