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
import {
	selectedPostingAtom,
	userObjectAtom,
	postingsObject,
	selectedCommentAtom,
} from "../atoms";
import { flexbox } from "@mui/system";
import { Prev } from "react-bootstrap/esm/PageItem";

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
	const [follower, setFollower] = useState<any>([]);
	const [following, setFollowing] = useState<any>([]);
	const [showPosting, setShowPosting] = useState(true);
	const [showEdit, setShowEdit] = useState(false);
	const [showRecord, setShowRecord] = useState(false);
	const [userData, setUserData] = useState<any>(null);
	const [followInfo, setFollowInfo] = useState<any>(null);
	const [isFollowing, setIsFollowing] = useState(false);
	const [photoURL, setPhotoURL] = useState("");
	const [displayName, setDisplayName] = useState("");

	// current user
	const userObject = useRecoilValue(userObjectAtom);
	// clicked posting
	const [selectedPostingInfo, setSelectedPostingInfo] =
		useRecoilState(selectedPostingAtom);
	// clicked Comment
	const [selectedComment, setSelectedComment] =
		useRecoilState(selectedCommentAtom);

	// console.log(uid);
	const [postings, setPostings] = useRecoilState(postingsObject);

	async function fetchPosting(userId) {
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

	const isOwnerChange = (flag) => {
		setIsOwner(flag);
	};

	const PostingIconClicked = (postingInfo) => {
		setSelectedPostingInfo(postingInfo);
		setSelectedComment(null);
	};

	const followClicked = async () => {
		console.log("follow clicked");
		if (selectedPostingInfo?.creatorUid) {
		}
		const follow = {
			followerUid: userObject.uid,
			followerPhotoURL: userObject.photoURL,
			followerDisplayName: userObject.displayName,
			followingUid:
				selectedPostingInfo?.creatorUid || selectedComment?.commenterUid,
			followingPhotoURL:
				selectedPostingInfo?.creatorImgUrl ||
				selectedComment?.commenterPhotoURL,
			followingDisplayName:
				selectedPostingInfo?.creatorDisplayName ||
				selectedComment?.commeterDisplayName,
		};

		await dbService.collection("Follow").add(follow);
		setIsFollowing(true);
		// 레코드 저장하고 setFollowInfo로 현재 저장된 기록을 갖고 있어야 함.

		// retrieveFollowInfo(
		// 	selectedPostingInfo?.creatorUid || selectedComment?.commenterUid
		// );
	};

	const unFollowClicked = async () => {
		setFollowInfoCheck();
		console.log("unfollow clicked");

		console.log(followInfo);
		await dbService.doc(`Follow/${followInfo.id}`).delete();
		setIsFollowing(false);
		setFollowInfo(null);
	};

	const setFollowInfoCheck = () => {
		console.log(follower);
		follower.forEach((element) => {
			if (element.followerUid === userObject.uid) {
				console.log("following true");
				console.log(element);
				setFollowInfo(element);
			}
		});
	};

	const setDisplayNameAndPhotoURL = (name, url) => {
		setDisplayName(name);
		setPhotoURL(url);
	};

	const retrieveFollowInfo = async (uid) => {
		// retrieve people who is followed by user
		// 주체
		dbService
			.collection("Follow")
			.where("followerUid", "==", uid)
			.onSnapshot((snapshot) => {
				const followSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setFollowing(followSnapshot);
			});

		// retrieve people who follow this user
		// 대상
		dbService
			.collection("Follow")
			.where("followingUid", "==", uid)
			.onSnapshot((snapshot) => {
				const followSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setFollower(followSnapshot);
			});

		const isFollowCheck = await dbService
			.collection("Follow")
			.where("followerUid", "==", userObject.uid)
			.get();
		// console.log(isFollowCheck.docs[0].data().followerDisplayName);
		if (isFollowCheck.docs[0].data().followerUid === userObject.uid) {
			setIsFollowing(true);
		} else {
			setIsFollowing(false);
		}
	};

	useEffect(async () => {
		console.log(selectedPostingInfo);
		console.log(selectedComment);
		if (
			userObject?.uid === selectedPostingInfo?.creatorUid ||
			userObject?.uid === selectedComment?.commenterUid
		) {
			setSelectedPostingInfo(null);
			setSelectedComment(null);

			// console.log("true is running");
		} else {
			isOwnerChange(false);
		}
		// 본인
		if (selectedPostingInfo === null && selectedComment === null) {
			console.log("I'm owner");
			isOwnerChange(true);

			const userInfo = await dbService
				.collection("UserInfo")
				.where("uid", "==", userObject.uid)
				.get();
			setRank(userInfo.docs[0].data().rank);
			setUserData(userInfo);

			setDisplayNameAndPhotoURL(userObject.displayName, userObject.photoURL);

			retrieveFollowInfo(userObject.uid);

			fetchPosting(userObject.uid);
		}
		// 남의 페이지(본인 아님)
		else if (selectedPostingInfo !== null) {
			console.log("from posting link");
			if (selectedPostingInfo.creatorUid === userObject.uid) {
				isOwnerChange(true);
			}

			const userInfo = await dbService
				.collection("UserInfo")
				.where("uid", "==", selectedPostingInfo.creatorUid)
				.get();
			setRank(userInfo.docs[0].data().rank);
			setUserData(userInfo);

			setDisplayName(selectedPostingInfo.creatorDisplayName);
			setPhotoURL(selectedPostingInfo.creatorImgUrl);

			setDisplayNameAndPhotoURL(
				selectedPostingInfo.creatorDisplayName,
				selectedPostingInfo.creatorImgUrl
			);

			retrieveFollowInfo(selectedPostingInfo.creatorUid);

			// follower.map(
			// 	(doc) => doc.followerUid === userObject.uid && { setFollowInfo(doc); }
			// );

			fetchPosting(selectedPostingInfo.creatorUid);
		} else if (selectedComment !== null) {
			console.log("from comment link");
			if (selectedComment.commenterUid === userObject.uid) {
				isOwnerChange(true);
			}
			const userInfo = await dbService
				.collection("UserInfo")
				.where("uid", "==", selectedComment.commenterUid)
				.get();
			setRank(userInfo.docs[0].data().rank);
			setUserData(userInfo);

			setDisplayNameAndPhotoURL(
				selectedComment.commeterDisplayName,
				selectedComment.commenterPhotoURL
			);

			retrieveFollowInfo(selectedComment.commenterUid);

			// follower.map(
			// 	(doc) => doc.followerUid === userObject.uid && { setFollowInfo(doc); }
			// );

			fetchPosting(selectedComment.commenterUid);
		}
		setIsLoading(false);
	}, [uid]);

	// console.log(followInfo);
	// console.log(follower);

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
							<span>{follower.length}</span>
						</OverviewItem>
						<OverviewItem>
							<span>Following</span>
							<span>{following.length}</span>
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
							<Tab isActive={true} onMouseEnter={() => setFollowInfoCheck()}>
								{!isFollowing ? (
									<a href="#" onClick={followClicked}>
										Follow
									</a>
								) : (
									<a href="#" onClick={unFollowClicked}>
										UnFollow
									</a>
								)}
							</Tab>
							<Tab isActive={true}>
								<Link to={`/${userObject.uid}/profile/message`}>Message</Link>
							</Tab>
						</Tabs>
					)}

					{showPosting && !showEdit && !showRecord ? (
						<PostingContainer>
							{postings?.map((posting, index) => (
								<Posting key={index}>
									<Link
										to={`/postingDetail/${posting?.id}`}
										onClick={() => PostingIconClicked(posting)}
										onMouseEnter={() => PostingIconClicked(posting)}
									>
										<PostingPreviewImg src={posting.photoUrl[0]} />
									</Link>
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
					<div style={{ width: 300, height: 150 }}></div>
				</Container>
			)}
		</>
	);
}

export default Profile;
