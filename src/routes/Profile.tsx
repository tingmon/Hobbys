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
	color: ${(props) => props.theme.textColor};
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
`;

interface IRouteParam {
	uid: string;
}

function Profile({ userObject, refreshUser }) {
	// const { uid } = useParams<IRouteParam>();
	const [rank, setRank] = useState("");
	const [follower, setFollower] = useState(0);
	const [following, setFollowing] = useState(0);
	const [showPosting, setShowPosting] = useState(true);
	const [showEdit, setShowEdit] = useState(false);
	const [showRecord, setShowRecord] = useState(false);
	const [userData, setUserData] = useState(null);

	useEffect(async () => {
		const userInfo = await dbService
			.collection("UserInfo")
			.where("uid", "==", userObject?.uid)
			.get();
		setRank(userInfo.docs[0].data().rank);
		setUserData(userInfo);

		// retrieve people I follow
		const followerInfo = await dbService
			.collection("Follow")
			.where("agent", "==", userObject?.uid)
			.get();
		setFollower(followerInfo.docs.length);
		// retrieve people who follow me
		const followingInfo = await dbService
			.collection("Follow")
			.where("passive", "==", userObject?.uid)
			.get();
		setFollowing(followingInfo.docs.length);
		console.log(follower, following);
		// retrieve user posting, use reactQuery later.
		// const postings = await dbService
		// 	.collection("Postings")
		// 	.where("creatorId", "==", userObject.uid)
		// 	.orderBy("createdAt", "desc")
		// 	.get();
		// console.log(postings.docs.map((doc) => doc.id));
		// console.log(postings.docs.map((doc) => doc.data().creatorImgUrl));
	}, []);

	return (
		<Container>
			<Header>
				<label>
					<TitleImage src={userObject?.photoURL} alt="No Img" />
				</label>
				<Title>{userObject?.displayName}</Title>
			</Header>

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
						to={`/profile/${userObject.uid}/edit`}
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
						to={`/profile/${userObject.uid}/record`}
					>
						Record
					</Link>
				</Tab>
			</Tabs>

			{showPosting && !showEdit && !showRecord ? (
				<PostingContainer>
					<Posting style={{ backgroundColor: "red" }}>1</Posting>
					<Posting style={{ backgroundColor: "blue" }}>2</Posting>
					<Posting style={{ backgroundColor: "green" }}>3</Posting>
					<Posting style={{ backgroundColor: "orange" }}>5</Posting>
					<Posting style={{ backgroundColor: "white" }}>6</Posting>
					<Posting style={{ backgroundColor: "yellow" }}>7</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
					<Posting style={{ backgroundColor: "purple" }}>8</Posting>
				</PostingContainer>
			) : (
				<Switch>
					<Route path={`/profile/${userObject.uid}/edit`}>
						<EditProfile
							userObject={userObject}
							refreshUser={refreshUser}
							userInfo={userData}
						/>
					</Route>
					<Route path={`/profile/${userObject.uid}/record`}>
						<TradeRecord />
					</Route>
				</Switch>
			)}
		</Container>
	);
}
export default Profile;
