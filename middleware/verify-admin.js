function verifyAdmin(request, response, next) {
    console.log(request.user,request)
    if (request.user && request.user.role=="admin")
        next();
    else {
        return response.status(401).send("Unauthorized (admin)");
    }
}

module.exports = verifyAdmin;
