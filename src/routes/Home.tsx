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
import LoyaltyIcon from "@mui/icons-material/PaidRounded";
import EditIcon from "@mui/icons-material/Edit";
import FavoriteBorderIcon from "@mui/icons-material/Favorite";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import CommentIcon from "@mui/icons-material/ChatBubbleOutline";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Swal from "sweetalert2";

const PreviewImg = styled.img`
	border-radius: 50%;
	width: 50px;
	height: 50px;
`;

const Container = styled.div`
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 85vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const PostingContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(1, 450px);
	grid-template-rows: repeat(1, 600px);
	grid-auto-rows: 600px;
	z-index: 0;
	background-color: ${(props) => props.theme.postingBgColor};
`;

const Posting = styled.div`
	font-size: 15px;
	margin: 2px;
	// max-width: 475px;
	max-hight: 490px;
	width:100%
	background-color: ${(props) => props.theme.postingBgColor};
	border-bottom: 0.2px solid #c9cdd2 ;
`;

const PostingHeader = styled.div`
	font-family: "Hammersmith One", sans-serif;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 2px;
`;

const SaleTag = styled.div`
	display: flex;
	align-items: center;
	span {
		margin-left: 2px;
		margin-top: 2px;
	}
`;

const ProfileTag = styled.div`
	display: flex;
	align-items: center;
	img {
		margin-right: 7px;
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

const PostingFooter = styled.div`
	margin-left: 3px;
	display: flex;
	align-items: center;
	a {
		padding-left: 4px;
	}
`;

const LikeAndComment = styled.div``;

const TextBox = styled.div`
	padding: 3px;
	margin: 3px;
	word-wrap: break-word;
	overflow: auto;
	max-height: 50px;

	-ms-overflow-style: none;
	scrollbar-width: none;
	-webkit-scrollbar: none;
`;

const CartIcon = styled.a`
	cursor: pointer;
`;

function Home() {
	const history = useHistory();
	const [likeList, setLikeList] = useState<any>([]);
	const [comment, setComment] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isCommenting, setIsCommenting] = useState(false);

	// recoil
	const [postings, setPostings] = useRecoilState(postingsObject);
	const userObject = useRecoilValue(userObjectAtom);
	const [selectedPosting, setSelectedPosting] =
		useRecoilState(selectedPostingAtom);
	const setSelectedComment = useSetRecoilState(selectedCommentAtom);
	const [cart, setCart] = useRecoilState(cartAtom);

	async function fetchHomePostings() {
		dbService
			.collection("Posting")
			.orderBy("createdAt", "desc")
			.onSnapshot((snapshot) => {
				// console.log(snapshot);
				const postingSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(postingSnapshot);
				setPostings(postingSnapshot);
			});
	}

	function fetchLike() {
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

	function fetchCart() {
		dbService
			.collection("Cart")
			.where("cartOwnerUid", "==", userObject.uid)
			.onSnapshot((snapshot) => {
				const cartSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setCart(cartSnapshot.splice(0));
			});
	}

	useEffect(() => {
		fetchLike();
		fetchCart();
		setIsLoading(false);
		fetchHomePostings();
	}, []);

	function Item(props) {
		// console.log(props);
		return (
			<Paper>
				<img style={{ height: 430, width: 430 }} src={props.item} />
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
			const cart = {
				cartOwnerUid: userObject.uid,
				items: [
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
			};
			await dbService.collection("Cart").add(cart);
			console.log("cart added");
		} else {
			let itemsArr = cart[0].items;
			let alreadyIn = false;
			console.log(itemsArr);
			itemsArr.forEach((element) => {
				if (element.postingId == postingInfo.id) {
					console.log("duplicated item");
					alreadyIn = true;
				}
			});
			console.log(cart);
			console.log("cart exsist");
			if (!alreadyIn) {
				dbService.doc(`Cart/${cart[0].id}`).update({
					items: firebaseInstance.firestore.FieldValue.arrayUnion({
						postingId: postingInfo.id,
						creatorUid: postingInfo.creatorUid,
						creatorDisplayName: postingInfo.creatorDisplayName,
						itemPhoto: postingInfo.photoUrl[0],
						itemName: postingInfo.itemName,
						itemCategory: postingInfo.category,
						itemPrice: postingInfo.price,
					}),
				});
				// custom message box
				Swal.fire({
					title: "Item Added to your Cart!",
					showDenyButton: true,
					confirmButtonText: "Got It",
					denyButtonText: `Go to Cart`,
				}).then((result) => {
					/* Read more about isConfirmed, isDenied below */
					if (result.isConfirmed) {
						// Swal.fire("Saved!", "", "success");
					} else if (result.isDenied) {
						// Swal.fire("Changes are not saved", "", "info");
						history.push("/cart");
					}
				});
			} else {
				Swal.fire({
					title: "Item is Already in Your Cart!",
					showDenyButton: true,
					confirmButtonText: "Got It",
					denyButtonText: `Go to Cart`,
				}).then((result) => {
					/* Read more about isConfirmed, isDenied below */
					if (result.isConfirmed) {
						// Swal.fire("Saved!", "", "success");
					} else if (result.isDenied) {
						// Swal.fire("Changes are not saved", "", "info");
						history.push("/cart");
					}
				});
			}
		}
		fetchCart();
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
			console.log("like clicked");
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

	return (
		<div>
			{isLoading ? (
				"Loading..."
			) : (
				<>
					{postings && (
						<Container>
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
												<Link
													to={`/${item?.creatorUid}/profile`}
													onClick={() => PostingIconClicked(item)}
												>
													{item.creatorDisplayName}
												</Link>
											</ProfileTag>
											{item.soldOut ? (
												<SaleTag>
													<LoyaltyIcon style={{ fill: "#b81414" }} />
												</SaleTag>
											) : item.forSale ? (
												<SaleTag>
													<LoyaltyIcon style={{ fill: "#206a22" }} />
													<span>Price: ${item.price}</span>
												</SaleTag>
											) : (
												<SaleTag>
													<LoyaltyIcon style={{ fill: "#827C76" }} />
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
											{item.creatorUid !== userObject?.uid && (
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
																		style={{ color: "red" }}
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
														<a
															href="#"
															onClick={(event) => LikeIconClicked(event, item)}
														>
															<FavoriteBorderIcon />
														</a>
													)}
												</LikeAndComment>
											)}

											<LikeAndComment>
												<a
													href="#"
													onClick={(event) => CommentIconClicked(event, item)}
												>
													<CommentIcon />
												</a>

												{item.creatorUid !== userObject?.uid &&
													item.forSale === true && (
														<CartIcon onClick={() => AddCartIconClicked(item)}>
															<AddShoppingCartIcon />
														</CartIcon>
													)}
											</LikeAndComment>
										</PostingFooter>
										<PostingFooter>
											{!isCommenting && (
												<TextBox>
													<span>{item.text}</span>
												</TextBox>
											)}
											{isCommenting && item.id == selectedPosting.id && (
												<>
													<InputField
														onChange={CommentOnChange}
														type="text"
														placeholder="enter comment"
													/>
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
