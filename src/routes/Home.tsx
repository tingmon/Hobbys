// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useHistory } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchPosting } from "../api";
import { postingsObject } from "../atoms";
import { authService, dbService } from "../fbase";
import styled from "styled-components";

const PreviewImg = styled.img`
	border-radius: 10%;
	width: 150px;
	height: 150px;
`;

function Home({ userObject }) {
	const history = useHistory();
	const [postings, setPostings] = useRecoilState(postingsObject);

	async function fetchPosting() {
		dbService
			.collection("Posting")
			.orderBy("createdAt", "desc")
			.onSnapshot((snapshot) => {
				console.log(snapshot);
				const postingSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setPostings(postingSnapshot);
			});
	}

	useEffect(() => {
		fetchPosting();
	}, []);

	const onLogOutClick = () => {
		authService.signOut();
		history.push("/");
	};

	return (
		<div>
			{postings && (
				<div>
					<h1>Welcome {userObject?.displayName}</h1>
					<button onClick={onLogOutClick}>Log out</button>
					{postings.map((item, index) => (
						<PreviewImg src={item.creatorImgUrl}></PreviewImg>
					))}
				</div>
			)}
		</div>
	);
}

export default Home;
