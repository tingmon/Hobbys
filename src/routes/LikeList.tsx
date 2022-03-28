// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { Link, useLocation, useParams, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { Switch, Route } from "react-router";
import { authService, dbService, storageService } from "../fbase";
import { useEffect, useState } from "react";
import EditProfile from "./EditProfile";
import TradeRecord from "./TradeRecord";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
	selectedPostingAtom,
	userObjectAtom,
	postingsObject,
	selectedCommentAtom,
} from "../atoms";

const Container = styled.div`
	padding: 0px 20px;
	max-width: 450px;
	width: 450px;
	height: 90vh;
`;
const Text = styled.span`
	margin: 2px 5px;
`;
const Header = styled.header`
	height: 10vh;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	margin: 0px 10px 10px 10px;
`;

const Title = styled.h1`
	font-size: 30px;
	color: ${(props) => props.theme.textColor};
	margin-left: 20px;
`;

const Item = styled.div`
	margin: 0;
`;
const Overview = styled.div`
	display: flex;
	justify-content: space-between;
	background-color: ${(props) => props.theme.secondColor};
	padding: 10px 20px;
	border-radius: 10px;
`;
const OverviewItem = styled.div`
	flex-direction: column;
	align-items: center;
	span:first-child {
		font-size: 10px;
		font-weight: 400;
		text-transform: uppercase;
		margin-bottom: 5px;
	}
`;

const PostingContainer = styled.div`
	grid-template-columns: repeat(1, 1fr);
	grid-template-rows: repeat(1, 100px);
	grid-auto-rows: 100px;
	z-index: 0;
`;

const Posting = styled.div`
	display: flex;
	justify-content: start;
	align-items: center;
	margin-bottom: 10px;
	background-color: ${(props) => props.theme.postingBgColor};
`;


const PostingPreviewImg = styled.img`
	width: 100px;
	height: 100px;
	margin-left: 0px;
`;
const Description = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: start;
	margin-left: 3px;
	background-color: ${(props) => props.theme.postingBgColor};
`;

function LikeList() {
	const [postingArr, setPostingArr] = useState<any>([]);

	const [isLoading, setIsLoading] = useState(true);
	const [likes, setLikes] = useState<any>([]);
	const userObject = useRecoilValue(userObjectAtom);
	const [selectedPostingInfo, setSelectedPostingInfo] =
		useRecoilState(selectedPostingAtom);
	const setSelectedComment = useSetRecoilState(selectedCommentAtom);

	async function fetchLikes(uid) {
		dbService
			.collection("Like")
			.where("likerUid", "==", uid)
			.orderBy("timeStamp", "desc")
			.onSnapshot((snapshot) => {
				const likeSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setLikes(likeSnapshot);
			});
	}

	async function fetchLikePostings(uid) {
		dbService
			.collection("Posting")
			.where("likes.likerUid", "array-contains", uid)
			.orderBy("createdAt", "desc")
			.onSnapshot((snapshot) => {
				const postingSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setPostingArr(postingSnapshot);
			});
	}

	const PostingClicked = (postingInfo) => {
		console.log(postingInfo);
		setSelectedPostingInfo(postingInfo);
		setSelectedComment(null);
	};

	useEffect(async () => {
		fetchLikes(userObject.uid).then(() => {
			fetchLikePostings(userObject.uid);
		});

		setIsLoading(false);
	}, []);

	console.log(likes);
	// console.log(selectedPostingInfo);
	console.log(postingArr);

	return (
		<>
			{isLoading ? (
				"Loading..."
			) : (
				<Container>
					<Header>Like List</Header>

					<PostingContainer>
						<Item>
							{postingArr?.map((posting, index) => (
								<Posting key={index}>
									<Link
										to={`/postingDetail/${posting?.id}`}
										onClick={() => PostingClicked(posting)}
										onMouseEnter={() => PostingClicked(posting)}
									>
										<PostingPreviewImg src={posting.photoUrl[0]} />
										<Description>
											<Text>{posting.creatorDisplayName}</Text>
											<Text>{posting.category}</Text>
										</Description>
									</Link>
								</Posting>
							))}
						</Item>
						<div style={{ width: 300, height: 150 }}></div>
					</PostingContainer>
				</Container>
			)}
		</>
	);
}

export default LikeList;
