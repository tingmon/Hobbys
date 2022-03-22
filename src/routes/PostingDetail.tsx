// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Link, useHistory } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
	postingsObject,
	selectedPostingAtom,
	isNewUserAtom,
	userObjectAtom,
} from "../atoms";
import {
	authService,
	dbService,
	firebaseInstance,
	storageService,
} from "../fbase";
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
import { Prev } from "react-bootstrap/esm/PageItem";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import EditPostingForm from "../components/EditPostingForm";
import CommentList from "../components/CommentList";

const PreviewImg = styled.img`
	border-radius: 50%;
	width: 50px;
	height: 50px;
`;

const Container = styled.div`
	max-width: 450px;
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
// max-width: 330px;
// max-hight: 490px;

const Posting = styled.div`
	margin-bottom: 10px;
	padding: 10px;
	width: 90%;
	height: 100vh;
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

const LikeAndComment = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const TextBox = styled.div`
	word-wrap: break-word;
	overflow: auto;
	max-height: 50px;
`;

const IconElement = styled.a`
	margin: 10px;
`;

const GoBackBtn = styled.button`
text-align: center;
background: #04aaff;
color: white;
margin-top: 10px;
pointer
cursor: pointer;

max-width: 320px;
width: 100%;
padding: 10px;
border-radius: 30px;
background-color: rgba(255, 255, 255, 1);
margin-bottom: 10px;
font-size: 12px;
color: black;
font-weight: bold;
`;

const FormContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 320px;
`;

const CommentListContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: space-between;
`;

function PostingDetail() {
	const history = useHistory();
	const [isLoading, setIsLoading] = useState(true);
	const [isOwner, setIsOwner] = useState(false);
	const selectedPosting = useRecoilValue(selectedPostingAtom);
	const userObject = useRecoilValue(userObjectAtom);
	const [isEdit, setIsEdit] = useState(false);
	const [comments, setComments] = useState([]);
	const [isLike, setIsLike] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [isCommenting, setIsCommenting] = useState(false);

	useEffect(() => {
		if (selectedPosting.creatorUid == userObject.uid) {
			setIsOwner(true);
		}
		console.log(userObject);
		console.log(selectedPosting);
		console.log(selectedPosting.likes?.likerUid);
		if (selectedPosting.likes.likerUid?.includes(userObject.uid)) {
			console.log("like true");
			setIsLike(true);
		}
		dbService
			.collection("Comment")
			.where("postingId", "==", selectedPosting.id)
			.orderBy("timeStamp", "desc")
			.onSnapshot((snapshot) => {
				// console.log(snapshot);
				const commentSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setComments(commentSnapshot);
			});
		console.log(comments);
		setIsLoading(false);

		//posting
		//comment
		//like
	}, []);

	function Item(props) {
		// console.log(props);
		return (
			<Paper>
				<img style={{ height: 400, width: 400 }} src={props.item} />
			</Paper>
		);
	}

	const onGoBackClicked = () => {
		history.push("/");
	};

	const LikeIconClicked = async (event, postingInfo) => {
		event.preventDefault();
		// setSelectedPosting(postingInfo);
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
		setIsLike((prev) => !prev);
	};

	const onCancelClicked = () => {
		setIsEdit(false);
	};

	const CommentIconClicked = (event, postingInfo) => {
		event.preventDefault();

		setIsCommenting((prev) => !prev);
	};

	const CommentOnChange = (event) => {
		const {
			target: { value },
		} = event;
		setNewComment(value);
	};

	const CommentSubmitClicked = async (event, postingInfo) => {
		event.preventDefault();
		console.log(newComment);

		const addComment = {
			commenterUid: userObject.uid,
			commenterPhotoURL: userObject.photoURL,
			commeterDisplayName: userObject.displayName,
			postingId: postingInfo.id,
			text: newComment,
			timeStamp: Date.now(),
		};
		await dbService.collection("Comment").add(addComment);
		console.log(addComment);
		// setComments((prev) => [...prev, addComment]);
	};

	const onDeleteClick = async () => {
		const ok = window.confirm("Are you sure?");
		if (ok) {
			// doc = documentReference
			// it is like path on the file system(explorer)
			await dbService.doc(`Posting/${selectedPosting.id}`).delete();
			if (selectedPosting.photoUrl !== "") {
				await storageService.refFromURL(selectedPosting.photoUrl).delete();
				history.push("/");
			}
			history.push("/");
			alert("Posting Deleted");
		}
	};

	const toggleEditing = () => setIsEdit((prev) => !prev);

	console.log(comments);

	return (
		<>
			{isLoading ? (
				"Loading..."
			) : (
				<>
					{isOwner ? (
						<>
							<Container>
								<GoBackBtn onClick={onGoBackClicked}>Back to Home</GoBackBtn>

								<Posting>
									<PostingHeader>
										<ProfileTag>
											<Link to={`/${selectedPosting?.creatorUid}/profile`}>
												<PreviewImg
													src={selectedPosting.creatorImgUrl}
												></PreviewImg>
											</Link>
											{selectedPosting.creatorDisplayName}
										</ProfileTag>
										{selectedPosting.soldOut ? (
											<SaleTag>
												<LoyaltyIcon />
												<span>Sold out</span>
											</SaleTag>
										) : selectedPosting.forSale ? (
											<SaleTag>
												<LoyaltyIcon />
												<span>For Sale / </span>
												<span>Price: ${selectedPosting.price}</span>
											</SaleTag>
										) : (
											<SaleTag>
												<LoyaltyIcon />
												<span>Not for Sale</span>
											</SaleTag>
										)}
									</PostingHeader>

									<Carousel
										className={carouselStyle.detailCarousel}
										navButtonsAlwaysVisible={false}
										autoPlay={false}
									>
										{selectedPosting.photoUrl.map((photo) => (
											<Item item={photo}></Item>
										))}
									</Carousel>
									{isEdit && (
										<FormContainer>
											<EditPostingForm />
											<GoBackBtn onClick={onCancelClicked}>Cancel</GoBackBtn>
										</FormContainer>
									)}
									<PostingFooter>
										<LikeAndComment>
											<div>
												{isLike ? (
													<>
														<IconElement
															href="#"
															onClick={(event) =>
																LikeIconClicked(event, selectedPosting)
															}
														>
															<FavoriteBorderIcon
																style={{ backgroundColor: "red" }}
															/>
														</IconElement>
													</>
												) : (
													<>
														<IconElement
															href="#"
															onClick={(event) =>
																LikeIconClicked(event, selectedPosting)
															}
														>
															<FavoriteBorderIcon />
														</IconElement>
													</>
												)}
												<IconElement
													href="#"
													onClick={(event) =>
														CommentIconClicked(event, selectedPosting)
													}
												>
													<CommentIcon />
												</IconElement>

												{selectedPosting.creatorUid !== userObject.uid &&
													selectedPosting.forSale === true && (
														<Link
															to="/editposting"
															onClick={() =>
																PostingIconClicked(selectedPosting)
															}
														>
															<AddShoppingCartIcon />
														</Link>
													)}
											</div>
											<div>
												<IconElement href="#" onClick={toggleEditing}>
													<FontAwesomeIcon icon={faPencilAlt} />
												</IconElement>
												<IconElement href="#" onClick={onDeleteClick}>
													<FontAwesomeIcon icon={faTrash} />
												</IconElement>
											</div>
										</LikeAndComment>
										<TextBox>
											<span>Item Name: {selectedPosting.itemName}</span>
										</TextBox>
										<TextBox>
											<span>Category: {selectedPosting.category}</span>
										</TextBox>
										<TextBox>
											<span>Text: {selectedPosting.text}</span>
										</TextBox>

										{isCommenting && (
											<>
												<p>add comment</p>
												<InputField onChange={CommentOnChange} type="text" />

												{newComment && (
													<button
														href="#"
														onClick={(event) =>
															CommentSubmitClicked(event, selectedPosting)
														}
													>
														submit
													</button>
												)}
											</>
										)}
									</PostingFooter>
									<CommentListContainer>
										<ul>
											{comments?.map((comment) => (
												<CommentList key={comment.id} comment={comment} />
											))}
										</ul>
									</CommentListContainer>

									<div style={{ width: 300, height: 100 }}></div>
								</Posting>
							</Container>
						</>
					) : (
						<>
							<Container>
								<GoBackBtn onClick={onGoBackClicked}>Back to Home</GoBackBtn>

								<Posting>
									<PostingHeader>
										<ProfileTag>
											<Link to={`/${selectedPosting?.creatorUid}/profile`}>
												<PreviewImg
													src={selectedPosting.creatorImgUrl}
												></PreviewImg>
											</Link>
											{selectedPosting.creatorDisplayName}
										</ProfileTag>
										{selectedPosting.soldOut ? (
											<SaleTag>
												<LoyaltyIcon />
												<span>Sold out</span>
											</SaleTag>
										) : selectedPosting.forSale ? (
											<SaleTag>
												<LoyaltyIcon />
												<span>On Sale / </span>
												<span>Price: ${selectedPosting.price}</span>
											</SaleTag>
										) : (
											<SaleTag>
												<LoyaltyIcon />
												<span>Not for Sale</span>
											</SaleTag>
										)}
									</PostingHeader>

									<Carousel
										className={carouselStyle.detailCarousel}
										navButtonsAlwaysVisible={false}
										autoPlay={false}
									>
										{selectedPosting.photoUrl.map((photo) => (
											<Item item={photo}></Item>
										))}
									</Carousel>

									<PostingFooter>
										<LikeAndComment>
											<div>
												{isLike ? (
													<>
														<IconElement
															href="#"
															onClick={(event) =>
																LikeIconClicked(event, selectedPosting)
															}
														>
															<FavoriteBorderIcon
																style={{ backgroundColor: "red" }}
															/>
														</IconElement>
													</>
												) : (
													<>
														<IconElement
															href="#"
															onClick={(event) =>
																LikeIconClicked(event, selectedPosting)
															}
														>
															<FavoriteBorderIcon />
														</IconElement>
													</>
												)}
												<IconElement
													href="#"
													onClick={(event) =>
														CommentIconClicked(event, selectedPosting)
													}
												>
													<CommentIcon />
												</IconElement>

												{selectedPosting.creatorUid !== userObject.uid &&
													selectedPosting.forSale === true && (
														<Link
															to="/editposting"
															onClick={() =>
																PostingIconClicked(selectedPosting)
															}
														>
															<AddShoppingCartIcon />
														</Link>
													)}
											</div>
										</LikeAndComment>
										<TextBox>
											<span>Item Name: {selectedPosting.itemName}</span>
										</TextBox>
										<TextBox>
											<span>Category: {selectedPosting.category}</span>
										</TextBox>
										<TextBox>
											<span>Text: {selectedPosting.text}</span>
										</TextBox>
										{isCommenting && (
											<>
												<p>add comment</p>
												<InputField onChange={CommentOnChange} type="text" />
												{newComment && (
													<a
														href="#"
														onClick={(event) =>
															CommentSubmitClicked(event, selectedPosting)
														}
													>
														submit
													</a>
												)}
											</>
										)}
									</PostingFooter>

									<CommentListContainer>
										<ul>
											{comments?.map((comment) => (
												<CommentList key={comment.id} comment={comment} />
											))}
										</ul>
									</CommentListContainer>
									<div style={{ width: 300, height: 100 }}></div>
								</Posting>
							</Container>
						</>
					)}
				</>
			)}
		</>
	);
}

export default PostingDetail;
