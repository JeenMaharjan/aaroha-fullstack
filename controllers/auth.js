const User = require("../models/user.js");
const jwt = require("jsonwebtoken");


exports.register = async(req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;
    // validation
    if (!username) return res.status(400).send("Name is required");
    if (!password || password.length < 6)
        return res
            .status(400)
            .send("Password is required and should be min 6 characters long");
    let userExist = await User.findOne({ email });
    if (userExist) return res.status(400).send("Email is taken");
    // register
    const user = new User(req.body);
    try {
        await user.save();
        console.log("USER CREATED", user);
        return res.json({ ok: true });
    } catch (err) {
        console.log("CREATE USER FAILED", err);
        return res.status(400).send("Error. Try again.");
    }
};

exports.login = async(req, res) => {
    // console.log(req.body);
    const { username, password } = req.body;
    try {
        // check if user with that email exist
        let user = await User.findOne({ username });
        // console.log("USER EXIST", user);
        if (!user) return res.status(400).send(`${username} not found`);
        // compare password
        user.comparePassword(password, (err, match) => {
            console.log("COMPARE PASSWORD IN LOGIN ERR", err);
            if (!match || err) return res.status(400).send("Wrong password");
            // GENERATE A TOKEN THEN SEND AS RESPONSE TO CLIENT
            let token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });
            res.json({
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            });
        });
    } catch (err) {
        console.log("LOGIN ERROR", err);
        res.status(400).send("Signin failed");
    }
};