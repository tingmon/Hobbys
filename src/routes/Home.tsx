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
import Carousel from "react-material-ui-carousel";
import { Paper, Button } from "@mui/material";
import carouselStyle from "../styles/Carousel.module.css";

const PreviewImg = styled.img`
	border-radius: 10%;
	width: 150px;
	height: 150px;
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

function Home({ userObject }) {
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

	function Item(props) {
		console.log(props);
		return (
			<Paper>
				<img style={{ height: 350, width: 350 }} src={props.item} />
			</Paper>
		);
	}

	return (
		<div>
			{postings && (
				<Container>
					<h1>Welcome {userObject?.displayName}</h1>
					{postings.map((item, index) => (
						<>
							<PreviewImg key={index} src={item.creatorImgUrl}></PreviewImg>
							{item.photoUrl.map((photo) => (
								<Carousel
									className={carouselStyle.carousel}
									navButtonsAlwaysVisible={true}
									autoPlay={false}
								>
									{console.log(photo)}
									<Item key={index} item={photo}></Item>
								</Carousel>
							))}
						</>
					))}
				</Container>
			)}
		</div>
	);
}

export default Home;
