// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { Link, useLocation, useParams, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { Switch, Route } from "react-router";
import { useQuery } from "react-query";
import { Helmet } from "react-helmet";
import { authService, dbService, storageService } from "../fbase";
import { useEffect, useState } from "react";
import EditProfile from "./EditProfile";
import TradeRecord from "./TradeRecord";
import { v4 as uuidv4 } from "uuid";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedPostingAtom, userObjectAtom, postingsObject } from "../atoms";

const Container = styled.div`
	padding: 0px 20px;
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
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
	color: ${(props) => props.theme.displayNameColor};
	margin-left: 20px;
`;

const TitleImage = styled.img`
	width: 60px;
	height: 60px;
	border-radius: 50%;
	margin-top: 5px;
	line-height: 60px;
	text-align: center;
	background-color: ${(props) => props.theme.textColor};
`;

const Overview = styled.div`
	display: flex;
	justify-content: space-between;
	background-color: ${(props) => props.theme.secondColor};
	padding: 10px 20px;
	border-radius: 10px;
`;
const OverviewItem = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	span:first-child {
		font-size: 10px;
		font-weight: 400;
		text-transform: uppercase;
		margin-bottom: 5px;
	}
`;
const Description = styled.p`
	margin: 20px 0px;
`;

const Tabs = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	margin: 15px 0px;
	gap: 10px;
`;

const Tab = styled.span<{ isActive: boolean }>`
	text-align: center;
	text-transform: uppercase;
	font-size: 12px;
	font-weight: 400;
	background-color: ${(props) => props.theme.textColor};
	padding: 7px 0px;
	border-radius: 10px;
	color: ${(props) =>
			props.isActive ? props.theme.secondColor : props.theme.textColor}
		a {
		display: block;
	}
`;

const GoHome = styled.span`
	text-align: center;
	text-transform: uppercase;
	font-size: 15px;
	font-weight: 400;
	background-color: ${(props) => props.theme.mainColor};
	padding: 7px 0px;
	border-radius: 10px;
	a {
		display: block;
		margin-top: 20px;
		padding: 15px;
		background-color: ${(props) => props.theme.textColor};
		border-radius: 10px;
	}
`;

const PostingContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(3, 100px);
	grid-auto-rows: 100px;
`;

const Posting = styled.div`
	border: 1px solid black;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
`;

const PostingPreviewImg = styled.img`
	min-width: 100%;
	min-height: 100%;
`;

function Profile({ refreshUser }) {
	const { uid } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [isOwner, setIsOwner] = useState(false);
	const [rank, setRank] = useState("");
	const [follower, setFollower] = useState(0);
	const [following, setFollowing] = useState(0);
	const [showPosting, setShowPosting] = useState(true);
	const [showEdit, setShowEdit] = useState(false);
	const [showRecord, setShowRecord] = useState(false);
	const [userData, setUserData] = useState<any>(null);
	const [photoURL, setPhotoURL] = useState("");
	const [displayName, setDisplayName] = useState("");

	// current user
	const userObject = useRecoilValue(userObjectAtom);
	// clicked posting
	const [selectedPostingInfo, setSelectedPostingInfo] =
		useRecoilState(selectedPostingAtom);
	const [postings, setPostings] = useRecoilState(postingsObject);
	// console.log(uid);

	async function fetchPosting(userId) {
		console.log(userId);
		dbService
			.collection("Posting")
			.where("creatorUid", "==", userId)
			.orderBy("createdAt", "desc")
			.onSnapshot((snapshot) => {
				// console.log(snapshot);
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
		// console.log(selectedPostingInfo);
		// console.log(userObject);
		if (selectedPostingInfo === null) {
			const userInfo = await dbService
				.collection("UserInfo")
				.where("uid", "==", userObject.uid)
				.get();

			setRank(userInfo.docs[0].data().rank);
			setUserData(userInfo);
			setDisplayName(userObject.displayName);
			setPhotoURL(userObject.photoURL);

			// retrieve people I follow
			const followerInfo = await dbService
				.collection("Follow")
				.where("follower", "==", userObject.uid)
				.get();

			setFollower(followerInfo.docs.length);

			// retrieve people who follow me
			const followingInfo = await dbService
				.collection("Follow")
				.where("following", "==", userObject.uid)
				.get();

			setFollowing(followingInfo.docs.length);
			console.log(follower, following);

			fetchPosting(userObject.uid);
		}
		// currentUser !== postingOwner
		else {
			console.log(selectedPostingInfo.creatorUid);
			const userInfo = await dbService
				.collection("UserInfo")
				.where("uid", "==", selectedPostingInfo.creatorUid)
				.get();
			setRank(userInfo.docs[0].data().rank);
			setUserData(userInfo);
			setDisplayName(selectedPostingInfo.creatorDisplayName);
			setPhotoURL(selectedPostingInfo.creatorImgUrl);

			// retrieve people I follow
			const followerInfo = await dbService
				.collection("Follow")
				.where("agent", "==", selectedPostingInfo.creatorUid)
				.get();
			setFollower(followerInfo.docs.length);
			// retrieve people who follow me
			const followingInfo = await dbService
				.collection("Follow")
				.where("passive", "==", selectedPostingInfo.creatorUid)
				.get();
			setFollowing(followingInfo.docs.length);
			console.log(follower, following);

			fetchPosting(selectedPostingInfo.creatorUid);
		}
		setIsLoading(false);
	}, [uid]);

	return (
		<>
			{isLoading ? (
				"Loading..."
			) : (
				<Container>
					{isOwner ? (
						<Header>
							<label>
								<TitleImage src={photoURL} alt="No Img" />
							</label>
							<Title>{displayName}</Title>
						</Header>
					) : (
						<Header>
							<label>
								<TitleImage src={photoURL} alt="No Img" />
							</label>
							<Title>{displayName}</Title>
						</Header>
					)}

					<Overview>
						<OverviewItem>
							<span>Rank</span>
							<span>{rank}</span>
						</OverviewItem>
						<OverviewItem>
							<span>Follower</span>
							<span>{follower}</span>
						</OverviewItem>
						<OverviewItem>
							<span>Following</span>
							<span>{following}</span>
						</OverviewItem>
					</Overview>
					{isOwner ? (
						<Tabs>
							<Tab isActive={true}>
								<Link
									onClick={() => {
										if (showRecord === true) {
											setShowRecord(false);
											setShowPosting(false);
											setShowEdit(true);
										} else {
											setShowEdit((prev) => !prev);
											setShowPosting((prev) => !prev);
										}
									}}
									to={`/${userObject.uid}/profile/edit`}
								>
									Edit
								</Link>
							</Tab>
							<Tab isActive={true}>
								<Link
									onClick={() => {
										if (showEdit === true) {
											setShowEdit(false);
											setShowPosting(false);
											setShowRecord(true);
										} else {
											setShowRecord((prev) => !prev);
											setShowPosting((prev) => !prev);
										}
									}}
									to={`/${userObject.uid}/profile/record`}
								>
									Record
								</Link>
							</Tab>
						</Tabs>
					) : (
						<Tabs>
							<Tab isActive={true}>
								<Link
									onClick={() => {
										if (showRecord === true) {
											setShowRecord(false);
											setShowPosting(false);
											setShowEdit(true);
										} else {
											setShowEdit((prev) => !prev);
											setShowPosting((prev) => !prev);
										}
									}}
									to={`/${userObject.uid}/profile/edit`}
								>
									Follow
								</Link>
							</Tab>
							<Tab isActive={true}>
								<Link
									onClick={() => {
										if (showEdit === true) {
											setShowEdit(false);
											setShowPosting(false);
											setShowRecord(true);
										} else {
											setShowRecord((prev) => !prev);
											setShowPosting((prev) => !prev);
										}
									}}
									to={`/${userObject.uid}/profile/record`}
								>
									Message
								</Link>
							</Tab>
						</Tabs>
					)}

					{showPosting && !showEdit && !showRecord ? (
						<PostingContainer>
							{postings?.map((posting, index) => (
								<Posting key={index}>
									<PostingPreviewImg src={posting.photoUrl[0]} />
								</Posting>
							))}
						</PostingContainer>
					) : (
						<Switch>
							<Route path={`/${userObject.uid}/profile/edit`}>
								<EditProfile
									userObject={userObject}
									refreshUser={refreshUser}
									userInfo={userData}
									uid={uid}
								/>
							</Route>
							<Route path={`/${userObject.uid}/profile/record`}>
								<TradeRecord uid={uid} />
							</Route>
						</Switch>
					)}
				</Container>
			)}
		</>
	);
}

export default Profile;
