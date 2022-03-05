// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
// import firebase from "../fbase";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Link, useHistory } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchPosting } from "../api";
import { postingsObject, selectedPostingAtom } from "../atoms";
import { authService, dbService, firebaseInstance } from "../fbase";
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
	max-hight: 490px;
	background-color: ${(props) => props.theme.postingBgColor};
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
	max-height: 50px;
`;

function Home({ userObject }) {
	const [postings, setPostings] = useRecoilState(postingsObject);
	const [selectedPosting, setSelectedPosting] =
		useRecoilState(selectedPostingAtom);
	const [likeList, setLikeList] = useState([]);
	const [isLike, setIsLike] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const [testing, setTesting] = useState("");
	let arr = [];

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

		dbService
			.collection("Like")
			.where("likerUid", "==", userObject.uid)
			.onSnapshot((snapshot) => {
				const likeSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setLikeList(likeSnapshot);
			});
	}

	useEffect(() => {
		fetchPosting();
		setIsLoading(false);
		// arr = likeList;
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

	const LikeIconClicked = async (event, postingInfo) => {
		event.preventDefault();
		setSelectedPosting(postingInfo);
		let isCancel = false;
		const like = {
			likerUid: userObject.uid,
			postingId: postingInfo.id,
			timeStamp: Date.now(),
		};

		const checkCancel = await dbService
			.collection("Like")
			.where("likerUid", "==", userObject.uid)
			.where("postingId", "==", postingInfo.id)
			.get();

		if (checkCancel.docs[0]) isCancel = true;

		if (isCancel) {
			console.log("like cancel true");
			await dbService.doc(`Like/${checkCancel.docs[0].id}`).delete();
			dbService.doc(`Posting/${postingInfo.id}`).update({
				"likes.likerUid": firebaseInstance.firestore.FieldValue.arrayRemove(
					userObject.uid
				),
			});
		} else {
			await dbService.collection("Like").add(like);

			dbService.doc(`Posting/${postingInfo.id}`).update({
				"likes.likerUid": firebaseInstance.firestore.FieldValue.arrayUnion(
					userObject.uid
				),
			});
		}
	};

	// const Testing = (likeItem, postingItem, index) => {
	// 	console.log(postingItem.id);
	// 	if (!arr.includes(postingItem.id) && likeItem.postingId == postingItem.id) {
	// 		arr.push(postingItem.id);
	// 		console.log("like", arr);
	// 		return (
	// 			<>
	// 				<a
	// 					key={index}
	// 					href="#"
	// 					onClick={(event) => LikeIconClicked(event, postingItem)}
	// 				>
	// 					<FavoriteBorderIcon style={{ backgroundColor: "red" }} />
	// 				</a>
	// 			</>
	// 		);
	// 	} else if (arr.includes(postingItem.id)) {
	// 		console.log("null", arr);
	// 		return null;
	// 	} else if (!likeList.includes(postingItem.id)) {
	// 		arr.push(postingItem.id);
	// 		console.log("not like", arr);
	// 		console.log(likeList);
	// 		return (
	// 			<>
	// 				<a
	// 					key={index}
	// 					href="#"
	// 					onClick={(event) => LikeIconClicked(event, postingItem)}
	// 				>
	// 					<FavoriteBorderIcon />
	// 				</a>
	// 			</>
	// 		);
	// 	}
	// };

	const Testing = (postingInfo) => {
		const likeInfo = postingInfo.likes.likerUid.map((uid) => uid);

		// console.log(likeInfo, postingInfo.id);

		if (likeInfo.length !== 0) {
			for (var i = 0; i < likeInfo.length; i++) {
				if (likeInfo[i] == userObject.uid) {
					console.log("true for ", postingInfo.id);
					return true;
				}
			}
		}
		console.log("false for ", postingInfo.id);
		return false;
	};

	return (
		<div>
			{isLoading ? (
				"Loading..."
			) : (
				<>
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
													<span>Price: ${item.price}</span>
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
											navButtonsAlwaysVisible={false}
											autoPlay={false}
										>
											{/* {console.log(photo)} */}
											{item.photoUrl.map((photo) => (
												<Item key={index} item={photo}></Item>
											))}
										</Carousel>
										<PostingFooter>
											<LikeAndComment>
												{likeList.length !== 0 && item.likes.likerUid ? (
													Testing(item) == true ? (
														<>
															<a
																href="#"
																onClick={(event) =>
																	LikeIconClicked(event, item)
																}
															>
																<FavoriteBorderIcon
																	style={{ backgroundColor: "red" }}
																/>
															</a>
														</>
													) : (
														<>
															<a
																href="#"
																onClick={(event) =>
																	LikeIconClicked(event, item)
																}
															>
																<FavoriteBorderIcon />
															</a>
														</>
													)
												) : (
													<>
														<a
															href="#"
															onClick={(event) => LikeIconClicked(event, item)}
														>
															<FavoriteBorderIcon />
														</a>
													</>
												)}

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
				</>
			)}
		</div>
	);
}

export default Home;
