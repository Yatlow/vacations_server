function verifyAdmin(request, response, next) {
    console.log(request.headers.role)
    if (request.headers.role=="admin")
        next();
    else {
        return response.status(401).send("Unauthorized (admin)");
    }
}

module.exports = verifyAdmin;
