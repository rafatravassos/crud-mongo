import {Strategy as LocalStrategy} from "passport-local"
import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import "../models/User.js"

const User = mongoose.model("users")

export default function configurePassport(passport) {
    passport.use("local", new LocalStrategy({usernameField: 'email', passwordField: "password"}, (email, password, done) => {
        User.findOne({email: email}).lean().then((user) => {
            if (!user) {
                return done(null, false, {message: "Account does not exists"})
            }

            bcrypt.compare(password, user.password, (error, checked) => {
                if (checked) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: "Invalid password"})
                }
            })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error); // Tratar erros ao encontrar o usuário
        }
    });
}
