import { useState } from "react";
import "./App.css";
import firebase from "./firebase";

function App() {
	//States
	const [phoneNumber, setPhoneNumber] = useState("");
	const [userName, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [verified, setVerified] = useState(false);
	const [signedIn, setSignedIn] = useState(false);
	const [error, setError] = useState("");

	const signinHandler = () => {
		signInOrUp("http://localhost:8080/login", userName, email);
	};

	const signupHandler = () => {
		signInOrUp("http://localhost:8080/signup", userName, email);
	};

	//SignUp/SignIn Handler
	const signInOrUp = (url, userName, email) => {
		fetch(url, {
			method: "POST",
			body: JSON.stringify({ userName, email }),
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		})
			.then((r) => {
				if (r.ok) {
					return { success: true };
				} else {
					return r.json();
				}
			})
			.then((r) => {
				if (r.success === true) {
					// return getusername();
					setSignedIn(true);
				} else {
					setError(r.error);
				}
			});
	};

	//Button Click Handler - otp verification method
	const handleClick = () => {
		var recaptcha = new firebase.auth.RecaptchaVerifier("recaptcha");
		var number = "+91" + phoneNumber; //Have to use the country code
		firebase
			.auth()
			.signInWithPhoneNumber(number, recaptcha)
			.then(function (e) {
				var code = prompt("Enter the otp", "");

				if (code === null) return;

				e.confirm(code)
					.then(function (result) {
						// document.querySelector("label").textContent +=
						// 	result.user.phoneNumber + "Number verified";
						setVerified(true);
					})
					.catch(function (error) {
						document.querySelector("p").textContent += "OTP not correct";
						console.error(" first error");
						setVerified(false);
					});
			})
			.catch(function (error) {
				console.error("second error", error);
			});
	};

	return (
		<div className="App">
			{verified ? (
				signedIn ? (
					<h1>Success</h1>
				) : (
					<>
						<input
							type="text"
							style={{ marginTop: "50px" }}
							placeholder="Username"
							value={userName}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<br />
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<br />
						<p style={{ color: "red" }}>{error}</p>
						<button style={{ margin: "5px" }} onClick={signinHandler}>
							Sign In
						</button>
						<button onClick={signupHandler}>Sign Up</button>
					</>
				)
			) : (
				<>
					<h1 style={{ fontFamily: "monospace", color: "blueviolet" }}>
						OTP Verification
					</h1>
					<input
						placeholder="Enter Mobile Number"
						type="number"
						value={phoneNumber}
						onChange={(e) => setPhoneNumber(e.target.value)}
						style={{ marginTop: "50px" }}
					/>
					<div
						id="recaptcha"
						style={{
							display: "flex",
							justifyContent: "center",
							margin: "3px 0px",
						}}
					></div>
					<p style={{ color: "red", margin: "5px 0px" }}></p>
					<br />
					<button onClick={handleClick}>Get OTP</button>
				</>
			)}
		</div>
	);
}

export default App;
