// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import { authService, dbService, storageService } from "../fbase";
import SocialLogin from "./SocialLogin";
import CheckIcon from "@mui/icons-material/Check";
import ToggleButton from "@mui/material/ToggleButton";
import { photoURLAtom, postingInfoAtom, Ranks, userObjectAtom } from "../atoms";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { pink } from "@mui/material/colors";

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

const GoBackBtn = styled.button`
	text-align: center;
	background: #04aaff;
	color: white;
	margin-top: 10px;
	pointer
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

const PreviewImg = styled.img`
	border-radius: 10%;
	width: 150px;
	height: 150px;
`;

interface IForm {
	text: string;
	forSale: boolean;
	price: number;
	category: string;
	itemName: string;
}

interface IPosting {
	creatorUid: string;
	creatorImgUrl: string;
	photoUrl: string;
	createdAt: number;
	text: string;
	forSale: boolean;
	soldOut: boolean;
	price: number;
	category: string;
	itemName: string;
}

function PostingForm() {
	const history = useHistory();
	const [isLoading, setIsLoading] = useState(false);
	const [forSale, setForSale] = useState(true);
	const userObject = useRecoilValue(userObjectAtom);
	const [photoURL, setPhotoURLAtom] = useRecoilState(photoURLAtom); // posting images url
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		setError,
	} = useForm<IForm>();

	useEffect(() => {
		// console.log(userObject);
		// console.log(photoURL);
	}, []);

	const onGoBackClicked = () => {
		history.push("/addposting");
	};

	const onUploadClicked = (event) => {
		event.stopPropagation();
	};

	const onValid = async (data: IForm) => {
		console.log(data);
		// console.log(photoURL);
		if (data.price > 9999) {
			setError(
				"price",
				{ message: "Too Expensive! Enter Less Than 9999$" },
				{ shouldFocus: true }
			);
			throw "too expensive";
		}
		if (data.price < 0) {
			setError(
				"price",
				{ message: "Negative Number is not Allowed!" },
				{ shouldFocus: true }
			);
			throw "negative number";
		}
		try {
			setIsLoading(true);
			let imgFileUrl = "";
			let postingImgArr = [];
			for (let i = 0; i < photoURL.length; i++) {
				const imgFileRef = storageService
					.ref()
					.child(`${userObject.uid}/${uuidv4()}`);
				const response = await imgFileRef.putString(photoURL[i], "data_url");
				imgFileUrl = await response.ref.getDownloadURL();
				postingImgArr.push(imgFileUrl);
			}

			console.log(postingImgArr);

			if (forSale) {
				const posting = {
					creatorUid: userObject.uid,
					creatorDisplayName: userObject.displayName,
					creatorImgUrl: userObject.photoURL,
					photoUrl: postingImgArr,
					createdAt: Date.now(),
					text: data.text,
					forSale: forSale,
					soldOut: false,
					itemName: data.itemName,
					price: data.price,
					category: data.category,
					likes: [],
				};
				await dbService.collection("Posting").add(posting);
				console.log("forSale success");
				// data.username
			} else {
				const posting = {
					creatorUid: userObject.uid,
					creatorDisplayName: userObject.displayName,
					creatorImgUrl: userObject.photoURL,
					photoUrl: postingImgArr,
					createdAt: Date.now(),
					text: data.text,
					forSale: forSale,
					soldOut: false,
					itemName: "",
					price: 0,
					category: data.category,
					likes: [],
				};
				await dbService.collection("Posting").add(posting);
				console.log("not forSale success");
			}
			setPhotoURLAtom("");
			alert("Posting Uploaded!");
			history.push("/");
			// console.log(user);
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<>
			{photoURL && (
				<div>
					{photoURL.map((item, index) => (
						<PreviewImg key={index} src={item}></PreviewImg>
					))}
				</div>
			)}

			<FormGroup>
				<FormControlLabel
					control={
						<Checkbox
							defaultChecked
							sx={{
								color: pink[800],
								"&.Mui-checked": {
									color: pink[600],
								},
							}}
						/>
					}
					label="For Sale?"
					onChange={(event) => {
						if (event.target.checked) {
							setForSale(true);
						} else {
							setForSale(false);
						}
					}}
				/>
			</FormGroup>
			{!forSale ? (
				<>
					<PageTitle></PageTitle>
					<SignUpForm onSubmit={handleSubmit(onValid)}>
						<InputField
							type="text"
							{...register("text", {})}
							placeholder="Enter Text"
						/>
						<ErrorMessage>{errors?.text?.message}</ErrorMessage>
						<InputField
							type="text"
							{...register("category", {})}
							placeholder="Enter Category"
						/>
						<ErrorMessage>{errors?.category?.message}</ErrorMessage>
						{isLoading ? (
							<>
								<SubmitBtn disabled style={{ cursor: "wait" }}>
									Uploading...
								</SubmitBtn>
								<GoBackBtn disabled>Go Back</GoBackBtn>
							</>
						) : (
							<>
								<SubmitBtn onClick={onUploadClicked}>Upload Posting</SubmitBtn>
								<GoBackBtn onClick={onGoBackClicked}>Go Back</GoBackBtn>
							</>
						)}
					</SignUpForm>
				</>
			) : (
				<>
					<PageTitle></PageTitle>
					<LoginForm onSubmit={handleSubmit(onValid)}>
						<InputField
							type="text"
							{...register("text", {})}
							placeholder="*Enter Text"
						/>
						<ErrorMessage>{errors?.text?.message}</ErrorMessage>
						<InputField
							type="text"
							{...register("category", {})}
							placeholder="*Enter Category"
						/>
						<ErrorMessage>{errors?.category?.message}</ErrorMessage>

						<InputField
							type="text"
							{...register("itemName", {})}
							placeholder="*Enter Item Name"
						/>
						<ErrorMessage>{errors?.itemName?.message}</ErrorMessage>

						<InputField
							type="number"
							step="0.01"
							{...register("price", { required: "Price is Required" })}
							placeholder="*Enter Price"
						/>
						<ErrorMessage>{errors?.price?.message}</ErrorMessage>
						{isLoading ? (
							<>
								<SubmitBtn disabled style={{ cursor: "wait" }}>
									Uploading...
								</SubmitBtn>
								<GoBackBtn disabled>Go Back</GoBackBtn>
							</>
						) : (
							<>
								<SubmitBtn onClick={onUploadClicked}>Upload Posting</SubmitBtn>
								<GoBackBtn onClick={onGoBackClicked}>Go Back</GoBackBtn>
							</>
						)}
					</LoginForm>
				</>
			)}
		</>
	);
}

export default PostingForm;
