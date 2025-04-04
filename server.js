const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
// Initialize Firebase Admin SDK
const serviceAccount = require('./key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userRef = db.collection('users').doc(email);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
            return res.send('<script>alert("User already exists!"); window.location.href = "/signup.html";</script>');
        }

        await userRef.set({ name, email, password });
        res.send('<script>alert("Signup successful!"); window.location.href = "/login.html";</script>');
    } catch (error) {
        res.send('<script>alert("Signup failed! Try again."); window.location.href = "/signup.html";</script>');
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRef = db.collection('users').doc(email);
        const userSnap = await userRef.get();

        if (!userSnap.exists || userSnap.data().password !== password) {
            return res.send('<script>alert("Invalid credentials!"); window.location.href = "/login.html";</script>');
        }

        res.send('<script>alert("Login successful!"); window.location.href = "/index.html";</script>');
    } catch (error) {
        res.send('<script>alert("Login failed! Try again."); window.location.href = "/login.html";</script>');
    }
});
app.listen(7878, () => console.log('Server running on http://localhost:7878'));