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
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

// const Item = styled.div`
// 	display: flex;
// 	justify-content: start;
// 	align-items: center;
// 	margin-bottom: 10px;
// 	width: 100%;
// 	background-color: ${(props) => props.theme.postingBgColor};
	
// `;

const PostingContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(1, 250px);
	grid-auto-rows: 250px;
	z-index: 0;
	
`;
const Posting = styled.div`
	border: 1px solid #ffffff;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	// overflow: hidden;
	// a {
	// 	width: 100%;
	// 	height: 100%;
	// }
	
`;

const PostingPreviewImg = styled.img`
	width: 150px;
	height:180px;
`;
const Text = styled.span`
	
`;
function LikeList() {
	const [postingArr, setPostingArr] = useState<any>([]);
	const [isEmpty, setIsEmpty] = useState(true);

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
				console.log(likeSnapshot);
				if(likeSnapshot.length !== 0){
					setIsEmpty(false);
				}
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
		console.log(likes.length);

		fetchLikes(userObject.uid).then(() => {
			fetchLikePostings(userObject.uid);
		});

		setIsLoading(false);

	}, []);

	console.log(isEmpty);


	return (
		<Container>
		{isLoading ? (
				"Loading..."
			) : (
				<>
				{isEmpty ? (
					"Your Like List is Empty!"
				) : (
					<PostingContainer>
						{postingArr?.map((posting, index) => (
							<Posting key={index}>
								<Link
									to={`/postingDetail/${posting?.id}`}
									onClick={() => PostingClicked(posting)}
									onMouseEnter={() => PostingClicked(posting)}
								>
								<PostingPreviewImg src={posting.photoUrl[0]} />
								
								</Link>

								<Text >{posting.creatorDisplayName}</Text>
								<Text>{posting.category}</Text>
								{posting.forSale ? <Text>for sale</Text> : <Text>not for sale</Text>}
							</Posting>

						))}
							
					</PostingContainer>
					
				)}
				</>
			)}
			<div style={{ width: 300, height: 150 }}></div>
		</Container>
	);
}

export default LikeList;
