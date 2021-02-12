const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
	cors({
		//because the frontend and backend are running on different servers
		credentials: true,
		//frontend path
		origin: "http://localhost:3000",
	})
);

const db = mongoose.createConnection(
	"mongodb://localhost:27017/OTPverification",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);
db.on("connected", () => {
	console.log("connected to database.");
});

// defining the schema
const userSchema = new mongoose.Schema({
	userName: String,
	email: String,
});
const userModel = db.model("user", userSchema);

// function to check if a value is null or undefined
const nullOrUnd = (val) => val === null || val === undefined;

// APIs
//signup
app.post("/signup", async (req, res) => {
	const { userName, email } = req.body;
	if (userName.trim() !== "" && email.trim() !== "") {
		// in the model find a user with same name
		const existingUser = await userModel.findOne({ userName });
		// null or undefined means not found
		if (nullOrUnd(existingUser)) {
			// we can create a new user
			const newUser = new userModel({
				userName: userName.trim().toLowerCase(),
				email: email.trim().toLowerCase(),
			});
			await newUser.save();
			res.status(201).send({ success: "Signed up" });
		} else {
			res.status(401).send({ error: "Username already exists" });
		}
	} else {
		res.status(401).send({ error: "Please enter all fields" });
	}
});

//login
app.post("/login", async (req, res) => {
	const { userName, email } = req.body;

	if (userName.trim() !== "" && email.trim() !== "") {
		const existingUser = await userModel.findOne({
			userName: userName.trim().toLowerCase(),
		});
		if (nullOrUnd(existingUser)) {
			res.status(404).send({ error: "Username not found" });
		} else {
			if (
				existingUser.email === email.trim().toLowerCase() &&
				existingUser.userName === userName.trim().toLowerCase()
			) {
				res.status(201).send({ success: "Signed in" });
			} else {
				res.status(401).send({ error: "Incorrect email" });
			}
		}
	} else {
		res.status(401).send({ error: "Please enter all fields" });
	}
});

app.listen(8080, () => {
	console.log("app listening on port 8080");
});
