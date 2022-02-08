import react, { useState } from "react";
import { authService, firebaseInstance } from "../fbase";
// import AuthForm from "components/AuthForm";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTwitter,
	faGoogle,
	faGithub,
} from "@fortawesome/free-brands-svg-icons";
import styled from "styled-components";

const AuthBtns = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	max-width: 320px;
`;

const AuthBtn = styled.button`
	cursor: pointer;
	border-radius: 20px;
	border: none;
	padding: 10px 0px;
	font-size: 12px;
	text-align: center;
	width: 150px;
	background: white;
	cursor: pointer;
`;

function SocialLogin() {
	const onSocialClick = async (event: any) => {
		const {
			target: { name },
		} = event;
		let provider: any;
		if (name === "google") {
			provider = new firebaseInstance.auth.GoogleAuthProvider();
		} else if (name === "github") {
			provider = new firebaseInstance.auth.GithubAuthProvider();
		}
		const data = await authService.signInWithPopup(provider);
		console.log(data);
	};
	return (
		<AuthBtns>
			<AuthBtn onClick={onSocialClick} name="google" className="authBtn">
				Continue with Google <FontAwesomeIcon icon={faGoogle} />
			</AuthBtn>
			<AuthBtn onClick={onSocialClick} name="github" className="authBtn">
				Continue with Github <FontAwesomeIcon icon={faGithub} />
			</AuthBtn>
		</AuthBtns>
	);
}

export default SocialLogin;
