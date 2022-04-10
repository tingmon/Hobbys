// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { authService, dbService, storageService } from "../fbase";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import Carousel from "react-material-ui-carousel";
import { Paper, Button } from "@mui/material";
import carouselStyle from "../styles/Carousel.module.css";
import {
	postingInfoAtom,
	uidAtom,
	postingsObject,
	selectedPostingAtom,
} from "../atoms";
import { Link, Route, Switch } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { faMitten } from "@fortawesome/free-solid-svg-icons";
import { faHandMiddleFinger } from "@fortawesome/free-solid-svg-icons";

import SkateboardingIcon from "@mui/icons-material/Skateboarding";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import { IoMdCellular, IoMdFlower } from "react-icons/io";
import { IoPaw } from "react-icons/io5";

import { GiDropEarrings, GiWinterGloves } from "react-icons/gi";
import { text } from "stream/consumers";

const PostingCenter = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	height: 100%;
`;

const PostingPreviewImg = styled.img`
	min-width: 100%;
	min-height: 100%;
	max-width: 100%;
	max-height: 100%;
`;
const Container = styled.div`
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const Item = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: start;
	/* background-color: ${(props) => props.theme.postingBgColor}; */
	margin: 2px;
	width: 100%;
	display: flex;
`;
const InputField = styled.input`
	max-width: 300px;
	width: 100%;
	padding: 10px;
	border-radius: 3px;
	margin-top: 10px;
	margin-bottom: 10px;
	margin-left: 20px;
	font-size: 15px;
	color: black;
	box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 1px 0px,
		rgba(0, 0, 0, 0.1) 0px 4px 2px 0px;
	border-radius: 105px 5px 125px 5px/5px 125px 5px 155px;
	border: solid 3px ${(props) => props.theme.secondColor};
`;

const SubmitBtn = styled.button`
	/* text-align: center;
	color: white;
	margin-top: 10px;
	cursor: pointer;
	max-width: 80px;
	width: 80px;
	padding: 10px;
	border-radius: 15px;
	background-color: ${(props) => props.theme.postingBgColor};
	margin-bottom: 10px;
	margin-left: 10px;
	font-size: 12px;
	color: black;
	font-weight: bold; */
	text-align: center;
	padding: 3px;
	margin: 10px;
	background-color: ${(props) => props.theme.secondColor};
	letter-spacing: 2px;
	font-size: 20px;
	box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 1px 0px,
		rgba(0, 0, 0, 0.1) 0px 4px 2px 0px;
	border-radius: 205px 35px 180px 20px/15px 225px 10px 235px;
	border: solid 4px ${(props) => props.theme.secondColor};
	cursor: pointer;
`;
const IconContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-template-rows: repeat(4, 40px);
	grid-auto-rows: 40px;
	height: 80px;
	width: 100vw;
`;

const Icons = styled.button`
	font-family: "Sniglet", cursive;
	border: 1px solid #ffffff;
	display: flex;
	cursor: pointer;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	a {
		width: 100%;
		height: 100%;
	}
	margin: 2px;
	box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 1px 0px,
		rgba(0, 0, 0, 0.1) 0px 4px 2px 0px;
	border-radius: 205px 10px 180px 20px/15px 225px 15px 235px;
	border: solid 4px ${(props) => props.theme.secondColor};
	background-color: ${(props) => props.theme.secondColor}; ;
`;
const PostingContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(3, 150px);
	grid-auto-rows: 100px;
	z-index: 0;
`;

const Posting = styled.div`
	border: 1px solid #ffffff;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	a {
		width: 100%;
		height: 100%;
	}
`;

const Text = styled.span`
	margin: 5px 5px;
	/* font-weight: bold; */
	color: #000;
`;

const NameText = styled.span`
	max-width: 300px;
	width: 100%;
	padding: 10px;
	border-radius: 10px;
	background-color: ${(props) => props.theme.postingBgColor};
	margin-top: 10px;
	margin-left: 20px;
	font-size: 12px;
	color: black;
`;

function Search() {
	const [postings, setPostings] = useRecoilState(postingsObject);
	const [selectedPosting, setSelectedPosting] =
		useRecoilState(selectedPostingAtom);
	const [selectedPostingInfo, setSelectedPostingInfo] =
		useRecoilState(selectedPostingAtom);

	const [input, setInput] = useState("");
	async function fetchPosting(event) {
		dbService
			.collection("Posting")
			.where("category", "==", event)
			.onSnapshot((snapshot) => {
				console.log(snapshot);
				const postingSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(postingSnapshot);
				setPostings(postingSnapshot);
			});
	}

	const Clicked = async (event) => {
		fetchPosting(event);
		setSelectedPostingInfo(event);
		console.log(event);
	};

	const SubmitClicked = async (text) => {
		console.log(text);
		setPostings(null);
		dbService
			.collection("Posting")
			.where("creatorDisplayName", ">=", text)
			.where("creatorDisplayName", "<=", text + "\uf8ff")
			.onSnapshot((snapshot) => {
				const postingSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(postingSnapshot);
				setPostings(postingSnapshot);
			});

		console.log(postings);
	};

	const InputOnChange = (event) => {
		const {
			target: { value },
		} = event;
		setInput(value);
	};

	useEffect(async () => {
		setPostings(null);
	}, []);

	console.log(postings);

	return (
		<Container>
			<Item>
				<InputField
					onChange={InputOnChange}
					type="text"
					placeholder="Enter user name"
				/>
				<SubmitBtn
					onClick={() => {
						SubmitClicked(input);
					}}
				>
					<FontAwesomeIcon icon={faSearch} />
				</SubmitBtn>
			</Item>
			<Item>
				<IconContainer>
					<Icons onClick={() => Clicked("Cooking")}>
						<Text> Cooking </Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Woodwork")}>
						<Text> Woodwork</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Outdoor")}>
						<Text> Outdoor</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Art")}>
						<Text>Art</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Knitting")}>
						<Text> Knitting </Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Gardening")}>
						<Text> Gardening</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Accessory")}>
						<Text> Accessory</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Others")}>
						<Text> Others</Text>{" "}
					</Icons>
				</IconContainer>
			</Item>
			<Item>
				<PostingContainer>
					{postings !== null && (
						<>
							{postings?.map((posting, index) => (
								<Posting key={index}>
									<Link
										to={`/postingDetail/${posting?.id}`}
										onClick={() => Clicked(posting)}
									>
										<PostingCenter>
											<PostingPreviewImg src={posting.photoUrl[0]} />
										</PostingCenter>
									</Link>
								</Posting>
							))}
						</>
					)}
				</PostingContainer>
			</Item>
			<div style={{ width: 300, height: 150 }}></div>
		</Container>
	);
}

export default Search;
