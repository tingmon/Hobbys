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
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedPostingAtom, userObjectAtom, postingsObject } from "../atoms";

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
	margin-left:0px;
`;
const Description = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: start;
	margin-left:3px;
	background-color: ${(props) => props.theme.postingBgColor};
`;

function LikeList({ refreshUser }) {
	const { uid } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [isOwner, setIsOwner] = useState(false);
	const [following, setFollowing] = useState(0);
	const [showPosting, setShowPosting] = useState(true);
	const [showRecord, setShowRecord] = useState(false);
	const [userData, setUserData] = useState<any>(null);
	const [photoURL, setPhotoURL] = useState("");

	const userObject = useRecoilValue(userObjectAtom);
	const [selectedPostingInfo, setSelectedPostingInfo] =
		useRecoilState(selectedPostingAtom);
	const [postings, setPostings] = useRecoilState(postingsObject);

	
	async function fetchPosting(uid) {
		dbService
			.collection("Posting")
			.where("forSale", "==", true)
			.onSnapshot((snapshot) => {
				const postingSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setPostings(postingSnapshot);
			});

	}

	useEffect(async () => {
		if (
			userObject?.uid === selectedPostingInfo?.creatorUid ||
			selectedPostingInfo === null
		) {
			setSelectedPostingInfo(null);
			setIsOwner(true);
			console.log("true is running");
		} else {
			setIsOwner(false);
		}
		if (selectedPostingInfo === null) {
			const userInfo = await dbService
				.collection("UserInfo")
				.where("uid", "==", userObject.uid)
				.get();

			setUserData(userInfo);

			setPhotoURL(userObject.photoURL);


			fetchPosting(userObject.uid);
		}
		setIsLoading(false);
	}, [uid]);

	return (
		<>
			{isLoading ? (
				"Loading..."
			) : (
				<Container>
					<Header>
						Like List
					</Header>
					{showPosting && !showRecord ? (

						<PostingContainer>
							<Item>
							{postings?.map((posting, index) => (
								<Posting key={index}>
									<PostingPreviewImg src={posting.photoUrl[0]} />
									<Description>
									<Text>{posting.creatorDisplayName}</Text>
									<Text>{posting.category}</Text>
									</Description>
								</Posting>
							))}
							</Item>
					
						</PostingContainer>
					) : (
						<Switch>
				
						</Switch>
					)}
				</Container>
			)}
		</>
	);
}

export default LikeList;
