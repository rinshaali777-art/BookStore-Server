const users = require('../Models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// regiter logic
exports.registerController = async (req, res) => {
    console.log("inside registration logic");

    // console.log(req.body);
    const { username, email, password } = req.body
    // check email is. in db
    const exisitingUser = await users.findOne({ email })
    if (exisitingUser) {
        res.status(400).json("User already exist.. Please Login!")
    } else {
        const encryptedPassword = await bcrypt.hash(password, 10)
        const newUser = await users.create({ username, email, password: encryptedPassword })
        res.status(200).json(newUser)
    }

    // res.status(200).json("register request recieved")

}

// login logic
exports.loginController = async (req, res) => {

    const { email, password } = req.body
    const exisitingUser = await users.findOne({ email })

    if (exisitingUser) {

        const isPswdMatch = await bcrypt.compare(password, exisitingUser.password)
        if (isPswdMatch) {

            const token = jwt.sign({ userEmail: email, role: exisitingUser.role }, process.env.JWTSECRET)
            res.status(200).json({ user: exisitingUser, token })

        } else {
            res.status(409).json("Invalid Password!")
        }

    }
    else {
        res.status(409).json("invalid email...! please register")
    }

}


// google login logic
exports.googleController = async (req, res) => {
    console.log("inside google logic");

    const { username, email, password, picture } = req.body

    const existingUser = await users.findOne({ email })
    if (existingUser) {
        if (!existingUser.picture && picture) {
            existingUser.picture = picture
            await existingUser.save()
        }
        const token = jwt.sign({ userEmail: existingUser.email, role: existingUser.role }, process.env.JWTSECRET)
        res.status(200).json({ user: existingUser, token })


    } else {

        const encryptedPassword = await bcrypt.hash(password, 10)
        const newUser = await users.create({
            username,
            email,
            password: encryptedPassword,
            picture
        })
        const token = jwt.sign({ userEmail: newUser.email, role: newUser.role }, process.env.JWTSECRET)
        res.status(200).json({ user: newUser, token })


    }


}

exports.userEditController = async (req, res) => {
    console.log("inside user edit!!!");

    console.log(req.body);
    const { username, picture, password, bio } = req.body

    console.log(req.params);
    const { id } = req.params

    console.log(req.file);
    const updatedFile = req.file ? req.file.filename : picture

    // console.log(req.payload);
    if (password != "") {

        const encryptedPassword = await bcrypt.hash(password, 10)

        const updatedUser = await users.findByIdAndUpdate(id, { username, password:encryptedPassword, bio, picture: updatedFile }, { returnDocument: 'after' })
        res.status(200).json(updatedUser)
    } else {
        const updatedUser = await users.findByIdAndUpdate(id, { username, bio, picture: updatedFile }, { returnDocument: 'after' })
        res.status(200).json(updatedUser)


    }


}


exports.adminEditController = async (req, res) => {
    console.log("inside adminEditController !!!");

    console.log(req.body);
    const { username, password } = req.body

    console.log(req.params);
    const { id } = req.params

    // console.log(req.payload);
    if (password != "") {

        const encryptedPassword = await bcrypt.hash(password, 10)

        const updatedAdmin = await users.findByIdAndUpdate(id, { username, password:encryptedPassword }, { returnDocument: 'after' })
        res.status(200).json(updatedAdmin)
    } else {
        const updatedAdmin = await users.findByIdAndUpdate(id, { username }, { returnDocument: 'after' })
        res.status(200).json(updatedAdmin)


    }


}


//users list for admin
exports.getAllUsersController = async (req, res) => {
    console.log("inside getAllUsersController");

    const userList = await users.find({ role: 'user' })
    res.status(200).json(userList)

}
