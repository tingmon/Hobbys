// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { authService, dbService } from "../fbase";
import SocialLogin from "./SocialLogin";
import CheckIcon from "@mui/icons-material/Check";
import ToggleButton from "@mui/material/ToggleButton";
import { Ranks } from "../atoms";

const SignUpForm = styled.form`
	width: 100%;
	max-width: 320px;
	display: flex;
	flex-direction: column;
`;

const LoginForm = styled.form`
	width: 100%;
	max-width: 320px;
	display: flex;
	flex-direction: column;
`;

const InputField = styled.input`
	max-width: 295px;
	width: 100%;
	padding: 10px;
	border-radius: 30px;
	background-color: rgba(255, 255, 255, 1);
	margin-bottom: 10px;
	font-size: 12px;
	color: black;
	font-weight: bold;
`;

const SubmitBtn = styled.button`
	text-align: center;
	background: #04aaff;
	color: white;
	margin-top: 10px;
	cursor: pointer;

	max-width: 320px;
	width: 100%;
	padding: 10px;
	border-radius: 30px;
	background-color: rgba(255, 255, 255, 1);
	margin-bottom: 10px;
	font-size: 12px;
	color: black;
	font-weight: bold;
`;

const ErrorMessage = styled.span`
	color: red;
`;

const PageTitle = styled.span`
	margin: 5px 0px 5px 0px;
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

interface IForm {
	email: string;
	password: string;
	passwordConfirm: string;
	userName?: string;
	streetName?: string;
	city?: string;
	province?: string;
	postalCode?: string;
}

function AuthForm() {
	const [newAccount, setNewAccount] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		setError,
	} = useForm<IForm>();

	const onValid = async (data: IForm) => {
		console.log(data);
		// make your own error conditions(address validation)
		// one address input filled? -> every address inputs required
		// 		if (data.password !== data.passwordConfirm) {
		// 			setError(
		// 				"passwordConfirm",
		// 				{ message: "password inputs are not same" },
		// 				{ shouldFocus: true }
		// 			);
		// 		}
		//
		if (newAccount && data.password !== data.passwordConfirm) {
			setError(
				"passwordConfirm",
				{ message: "password inputs are not same" },
				{ shouldFocus: true }
			);
		}
		try {
			let user;
			let email = data.email;
			let password = data.password;
			if (newAccount) {
				// create account
				user = await authService.createUserWithEmailAndPassword(
					email,
					password
				);
				console.log(user);
				// Additional User Information to track

				const userInfo: IAdditionalUserInfo = {
					uid: user.user?.uid,
					displayName: data.userName,
					sellerPoint: 0,
					buyerPoint: 0,
					cashback: 0,
					rank: Ranks.Bronze,
					photoURL: "",
					isPromoted: false,
				};
				console.log(userInfo);
				await dbService.collection("UserInfo").add(userInfo);
				// data.username
			} else {
				// login
				user = await authService.signInWithEmailAndPassword(email, password);
			}
			console.log(user);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			<ToggleButton
				size="small"
				color="standard"
				value="check"
				selected={true}
				onChange={() => {
					setNewAccount((prev) => !prev);
				}}
			>
				<span>{newAccount ? "I Have Account" : "I Don't Have Account"}</span>
				<CheckIcon />
			</ToggleButton>

			{newAccount ? (
				<>
					<PageTitle>* required</PageTitle>
					<SignUpForm onSubmit={handleSubmit(onValid)}>
						<InputField
							type="email"
							{...register("email", {
								required: "Email is Required",
								pattern: {
									value:
										/^[a-zA-Z0-9.!#$%&’*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
									message: "Invalid Email Pattern",
								},
							})}
							placeholder="*Enter Email"
						/>
						<ErrorMessage>{errors?.email?.message}</ErrorMessage>
						<InputField
							type="password"
							{...register("password", {
								required: "Password is Required",
								minLength: { value: 5, message: "Password is too Short" },
							})}
							placeholder="*Enter Password"
						/>
						<ErrorMessage>{errors?.password?.message}</ErrorMessage>
						<InputField
							type="password"
							{...register("passwordConfirm", {
								required: "Confirm is Required",
								minLength: { value: 5, message: "Password is too Short" },
							})}
							placeholder="*Confirm Password"
						/>
						<ErrorMessage>{errors?.passwordConfirm?.message}</ErrorMessage>
						<InputField
							type="text"
							{...register("userName", {
								required: "User Name is Required",
								minLength: { value: 2, message: "User Name is too Short" },
							})}
							placeholder="*Enter User Name"
						/>
						<ErrorMessage>{errors?.userName?.message}</ErrorMessage>
						<SubmitBtn>Sign Up</SubmitBtn>
					</SignUpForm>
				</>
			) : (
				<>
					<PageTitle></PageTitle>
					<LoginForm onSubmit={handleSubmit(onValid)}>
						<InputField
							type="email"
							{...register("email", {
								required: "Email is Required",
								pattern: {
									value:
										/^[a-zA-Z0-9.!#$%&’*+=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
									message: "Invalid Email Pattern",
								},
							})}
							placeholder="Enter Email"
						/>
						<ErrorMessage>{errors?.email?.message}</ErrorMessage>
						<InputField
							type="password"
							{...register("password", {
								required: "Password is Required",
								minLength: { value: 5, message: "Password is too Short" },
							})}
							placeholder="Enter Password"
						/>
						<ErrorMessage>{errors?.password?.message}</ErrorMessage>
						<SubmitBtn>Log In</SubmitBtn>
					</LoginForm>
					<SocialLogin />
				</>
			)}
		</>
	);
}

export default AuthForm;
