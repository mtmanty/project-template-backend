import express from 'express';
import { userInfo } from 'os';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleKeys } from './config/keys';
import cookieSession from 'cookie-session';

var app = express();
let mockDatabase: string[] = [];
const port = 5000;

passport.use(
    new GoogleStrategy(
        {
            clientID: googleKeys.clientID,
            clientSecret: googleKeys.clientSecret,
            callbackURL: '/auth/google/redirect',
        },
        (accessToken, refreshToken, profile, done) => {
            // passport callback function
            //check if user already exists in our db with the given profile ID
            let currentUser = profile.id;
            let isUserAlreadyInDb = mockDatabase.find((element: string) => element == currentUser);

            if (isUserAlreadyInDb) {
                done(null, currentUser);
                console.log(mockDatabase);
            } else {
                mockDatabase.push(currentUser);
                done(null, currentUser);
                console.log(mockDatabase);
            }
        }
    )
);
passport.serializeUser((user: any, done) => {
    console.log(user);
    done(null, user[0]);
});

passport.deserializeUser((id, done) => {
    const user = mockDatabase.find((element: string) => element == id);

    done(null, user);
});
app.use(
    cookieSession({
        // milliseconds of a day
        maxAge: 24 * 60 * 60 * 1000,
        keys: ['coockiekkeyy'],
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);
app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
    res.send(req.user);
    res.send('you reached the redirect URI');
});

app.get('/auth/logout', (req, res) => {
    req.logout();
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
