// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
// import firebase from "../fbase";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Link, useHistory } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchPosting } from "../api";
import {
	postingsObject,
	selectedPostingAtom,
	isNewUserAtom,
	userObjectAtom,
	selectedCommentAtom,
	cartAtom,
} from "../atoms";
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

const InputField = styled.input`
	max-width: 255px;
	width: 100%;
	padding: 5px;
	border-radius: 30px;
	background-color: rgba(255, 255, 255, 1);
	margin-right: 10px;
	font-size: 12px;
	color: black;
	font-weight: bold;
`;

const PostingFooter = styled.div``;

const LikeAndComment = styled.div``;

const TextBox = styled.div`
	word-wrap: break-word;
	overflow: auto;
	max-height: 50px;
`;

function Home() {
	const history = useHistory();
	const [postings, setPostings] = useRecoilState(postingsObject);
	const userObject = useRecoilValue(userObjectAtom);
	const [selectedPosting, setSelectedPosting] =
		useRecoilState(selectedPostingAtom);
	const setSelectedComment = useSetRecoilState(selectedCommentAtom);
	const [cart, setCart] = useRecoilState(cartAtom);
	const [likeList, setLikeList] = useState([]);
	const [comment, setComment] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isCommenting, setIsCommenting] = useState(false);

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

	async function fetchCart() {
		dbService
			.collection("Cart")
			.where("cartOwnerUid", "==", userObject.uid)
			.onSnapshot((snapshot) => {
				const cartSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setCart(cartSnapshot);
			});
	}

	useEffect(() => {
		fetchPosting();
		fetchCart();
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
		setSelectedComment(null);
	};

	const AddCartIconClicked = async (postingInfo) => {
		// if user has no cart, create cart first.
		// after adding item, show message box and 'go to cart' button.
		setSelectedPosting(postingInfo);
		setSelectedComment(null);

		if (cart.length == 0) {
			console.log("???");
			const cart = {
				cartOwnerUid: userObject.uid,
				items: [
					{
						item: [
							{
								postingId: postingInfo.id,
								creatorUid: postingInfo.creatorUid,
								creatorDisplayName: postingInfo.creatorDisplayName,
								itemPhoto: postingInfo.photoUrl[0],
								itemName: postingInfo.itemName,
								itemCategory: postingInfo.category,
								itemPrice: postingInfo.price,
							},
						],
					},
				],
			};
			await dbService.collection("Cart").add(cart);
			console.log("cart added");
		} else {
			// await dbService.collection("Like").add(like);

			// dbService.doc(`Posting/${postingInfo.id}`).update({
			// 	"likes.likerUid": firebaseInstance.firestore.FieldValue.arrayUnion(
			// 		userObject.uid
			// 	),
			// });
			console.log(cart);
		}
	};

	const LikeIconClicked = async (event, postingInfo) => {
		event.preventDefault();
		setSelectedPosting(postingInfo);
		setSelectedComment(null);
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

	const PaintLikeIcon = (postingInfo) => {
		const likeInfo = postingInfo.likes.likerUid.map((uid) => uid);

		// console.log(likeInfo, postingInfo.id);

		if (likeInfo.length !== 0) {
			for (var i = 0; i < likeInfo.length; i++) {
				if (likeInfo[i] == userObject?.uid) {
					// console.log("true for ", postingInfo.id);
					return true;
				}
			}
		}
		// console.log("false for ", postingInfo.id);
		return false;
	};

	const CommentIconClicked = (event, postingInfo) => {
		event.preventDefault();
		if (postingInfo.id == selectedPosting?.id) {
			setIsCommenting((prev) => !prev);
		} else if (postingInfo.id !== selectedPosting?.id) {
			setIsCommenting(true);
			setSelectedPosting(postingInfo);
			setSelectedComment(null);
		}
	};

	const CommentOnChange = (event) => {
		const {
			target: { value },
		} = event;
		setComment(value);
	};

	const CommentSubmitClicked = async (event, postingInfo) => {
		if (comment !== "") {
			event.stopPropagation();
			console.log(comment);
			const newComment = {
				commenterUid: userObject.uid,
				commenterPhotoURL: userObject.photoURL,
				commeterDisplayName: userObject.displayName,
				postingId: postingInfo.id,
				text: comment,
				timeStamp: Date.now(),
			};
			await dbService.collection("Comment").add(newComment);
		} else {
			history.push("/");
		}
	};

	console.log(cart);

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
											) : item.forSale ? (
												<SaleTag>
													<LoyaltyIcon />
													<span>For Sale / </span>
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
											{item.photoUrl.map((photo) => (
												<>
													<Link
														to={`/postingDetail/${selectedPosting?.id}`}
														onClick={() => PostingIconClicked(item)}
														onMouseEnter={() => PostingIconClicked(item)}
													>
														<Item key={index} item={photo}></Item>
													</Link>
												</>
											))}
										</Carousel>
										<PostingFooter>
											<LikeAndComment>
												{likeList.length !== 0 && item.likes.likerUid ? (
													PaintLikeIcon(item) == true ? (
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
												<a
													href="#"
													onClick={(event) => CommentIconClicked(event, item)}
												>
													<CommentIcon />
												</a>

												{item.creatorUid !== userObject?.uid &&
													item.forSale === true && (
														<Link
															to="/cart"
															onClick={() => AddCartIconClicked(item)}
														>
															<AddShoppingCartIcon />
														</Link>
													)}
											</LikeAndComment>
											<TextBox>
												<span>{item.text}</span>
											</TextBox>
											{isCommenting && item.id == selectedPosting.id && (
												<>
													<p>add comment</p>
													<InputField onChange={CommentOnChange} type="text" />
													{comment && (
														<button>
															<Link
																to={`/postingDetail/${selectedPosting?.id}`}
																onClick={(event) =>
																	CommentSubmitClicked(event, item)
																}
															>
																submit
															</Link>
														</button>
													)}
												</>
											)}
										</PostingFooter>
										<div style={{ width: 300, height: 150 }}></div>
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
