import react, { useState } from "react";
import { authService, dbService, firebaseInstance } from "../fbase";
// import AuthForm from "components/AuthForm";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTwitter,
	faGoogle,
	faGithub,
} from "@fortawesome/free-brands-svg-icons";
import styled from "styled-components";
import { isNewUserAtom, Ranks } from "../atoms";
import { useRecoilState } from "recoil";

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

interface IAdditionalUserInfo {
	uid?: string;
	displayName?: string;
	streetName?: string;
	city?: string;
	province?: string;
	postalCode?: string;
	sellerPoint: number;
	buyerPoint: number;
	cashback: number;
	rank: Ranks;
	photoURL?: string;
	isPromoted: boolean;
}

function SocialLogin() {
	const [isNewUser, setIsNewUser] = useRecoilState<any>(isNewUserAtom);
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
		const flag = data.additionalUserInfo?.isNewUser;
		console.log(data);
		console.log(data.additionalUserInfo);
		console.log(data.additionalUserInfo?.isNewUser);
		setIsNewUser(flag);

		if (data.additionalUserInfo?.isNewUser) {
			const userInfo: IAdditionalUserInfo = {
				uid: data.user?.uid,
				displayName: data.user?.displayName || undefined,
				sellerPoint: 0,
				buyerPoint: 0,
				cashback: 0,
				isPromoted: false,
				rank: Ranks.Bronze,
				photoURL: data.user?.photoURL || undefined,
			};
			await dbService.collection("UserInfo").add(userInfo);
		}
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
