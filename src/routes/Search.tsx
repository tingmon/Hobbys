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

import { faUtensils } from "@fortawesome/free-solid-svg-icons";
import { faChair } from "@fortawesome/free-solid-svg-icons";
import { faMitten } from "@fortawesome/free-solid-svg-icons";
import { faHandMiddleFinger } from "@fortawesome/free-solid-svg-icons";

import SkateboardingIcon from "@mui/icons-material/Skateboarding";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import { IoMdCellular, IoMdFlower } from "react-icons/io";
import { IoPaw } from "react-icons/io5";

import { GiDropEarrings, GiWinterGloves } from "react-icons/gi";

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
	background-color: ${(props) => props.theme.postingBgColor};
	margin: 2px;
	width: 100%;
	display: flex;
`;
const InputField = styled.input`
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

const SubmitBtn = styled.button`
	text-align: center;
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
	font-weight: bold;
`;
const IconContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-template-rows: repeat(4, 40px);
	grid-auto-rows: 40px;
	height: 80px;
	width: 100vw;
	border: 2px solid #000;
`;
const Icons = styled.button`
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
`;
const PostingContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(3, 100px);
	grid-auto-rows: 100px;
	width: 100vw;
`;

const CategoryContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(3, 100px);
	grid-auto-rows: 100px;
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
	font-weight: bold;
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
		dbService
			.collection("Posting")
			.where("creatorDisplayName", "array-contains", text)
			.onSnapshot((snapshot) => {
				const postingSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(postingSnapshot);
				setPostings(postingSnapshot);
			});
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

	return (
		<Container>
			<Item>
				<InputField
					onChange={InputOnChange}
					type="text"
					placeholder="enter user name"
				/>
				<SubmitBtn
					onClick={() => {
						SubmitClicked(input);
					}}
				>
					Enter
				</SubmitBtn>
			</Item>
			<Item>
				<IconContainer>
					<Icons onClick={() => Clicked("Cooking")}>
						<FontAwesomeIcon icon={faUtensils} size="1x" />{" "}
						<Text> Cooking </Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Woodwork")}>
						<FontAwesomeIcon icon={faChair} size="1x" /> <Text> Woodwork</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Outdoor")}>
						<SkateboardingIcon /> <Text> Outdoor</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Painting")}>
						<ColorLensIcon font-size="samll" />
						<Text>Painting</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Knitting")}>
						<FontAwesomeIcon icon={faMitten} size="1x" />
						<Text> Knitting </Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Gardening")}>
						<IoMdFlower size="2x" />
						<Text> Gardening</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Accessory")}>
						<GiDropEarrings size="1x" />
						<Text> Accessory</Text>{" "}
					</Icons>
					<Icons onClick={() => Clicked("Others")}>
						<IoMdCellular font-size="samll" /> <Text> Others</Text>{" "}
					</Icons>
				</IconContainer>
			</Item>
			<Item>
				<PostingContainer>
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
				</PostingContainer>
			</Item>
		</Container>
	);
}

export default Search;
