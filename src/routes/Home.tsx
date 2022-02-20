// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
import { useEffect } from "react";
import { useQuery } from "react-query";
import { Link, useHistory } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchPosting } from "../api";
import { postingsObject, selectedPostingAtom } from "../atoms";
import { authService, dbService } from "../fbase";
import styled from "styled-components";
import Carousel from "react-material-ui-carousel";
import { Paper, Button } from "@mui/material";
import carouselStyle from "../styles/Carousel.module.css";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import CommentIcon from "@mui/icons-material/Comment";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

const PreviewImg = styled.img`
	border-radius: 50%;
	width: 50px;
	height: 50px;
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

const PostingContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	grid-template-rows: repeat(1, 500px);
	grid-auto-rows: 500px;
	z-index: 0;
`;

const Posting = styled.div`
	border: 1px solid black;
	margin-bottom: 10px;
	max-width: 330px;
`;

const PostingHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const SaleTag = styled.div`
	display: flex;
	align-items: center;
	span {
		margin-left: 5px;
	}
`;

const ProfileTag = styled.div`
	display: flex;
	align-items: center;
	img {
		margin-right: 5px;
	}
`;

const PostingFooter = styled.div``;

const LikeAndComment = styled.div``;

const TextBox = styled.div`
	word-wrap: break-word;
	overflow: auto;
`;

function Home({ userObject }) {
	const [postings, setPostings] = useRecoilState(postingsObject);
	const [selectedPosting, setSelectedPosting] =
		useRecoilState(selectedPostingAtom);

	async function fetchPosting() {
		dbService
			.collection("Posting")
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

	useEffect(() => {
		fetchPosting();
	}, []);

	function Item(props) {
		// console.log(props);
		return (
			<Paper>
				<img style={{ height: 330, width: 330 }} src={props.item} />
			</Paper>
		);
	}

	const PostingIconClicked = (postingInfo) => {
		console.log(postingInfo);
		setSelectedPosting(postingInfo);
	};

	return (
		<div>
			{postings && (
				<Container>
					<h1>Welcome {userObject?.displayName}</h1>
					<PostingContainer>
						{postings.map((item, index) => (
							<Posting key={index}>
								<PostingHeader>
									<ProfileTag>
										<Link
											to={`/${item?.creatorUid}/profile`}
											onClick={() => PostingIconClicked(item)}
										>
											<PreviewImg
												key={index}
												src={item.creatorImgUrl}
											></PreviewImg>
										</Link>
										{item.creatorDisplayName}
									</ProfileTag>
									{item.soldOut ? (
										<SaleTag>
											<LoyaltyIcon />
											<span>Sold out</span>
										</SaleTag>
									) : item.onSale ? (
										<SaleTag>
											<LoyaltyIcon />
											<span>On Sale / </span>
											<span>Price: {item.price}</span>
										</SaleTag>
									) : (
										<SaleTag>
											<LoyaltyIcon />
											<span>Not for Sale</span>
										</SaleTag>
									)}
								</PostingHeader>

								<Carousel
									className={carouselStyle.homeCarousel}
									navButtonsAlwaysVisible={true}
									autoPlay={false}
								>
									{/* {console.log(photo)} */}
									{item.photoUrl.map((photo) => (
										<Item key={index} item={photo}></Item>
									))}
								</Carousel>

								<PostingFooter>
									<LikeAndComment>
										<FavoriteBorderIcon />
										<CommentIcon />

										{item.creatorUid !== userObject.uid &&
											item.onSale === true && (
												<Link
													to="/editposting"
													onClick={() => PostingIconClicked(item)}
												>
													<AddShoppingCartIcon />
												</Link>
											)}
									</LikeAndComment>
									<TextBox>
										<span>{item.text}</span>
									</TextBox>
								</PostingFooter>
							</Posting>
						))}
					</PostingContainer>
				</Container>
			)}
		</div>
	);
}

export default Home;
