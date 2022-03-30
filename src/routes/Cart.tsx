// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import styled from "styled-components";
import {
	addressInfoAtom,
	cartAtom,
	cartItemsAtom,
	paymentInfoAtom,
	priceTotalInfoAtom,
	totalInfoAtom,
	userObjectAtom,
} from "../atoms";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dbService, firebaseInstance } from "../fbase";
import { Link, useHistory } from "react-router-dom";
import { Collapse, FormControlLabel, Switch } from "@mui/material";
import carouselStyle from "../styles/Carousel.module.css";
import Swal from "sweetalert2";

const Container = styled.div`
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const ItemContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	grid-template-rows: repeat(1, 110px);
	grid-auto-rows: 110px;
	z-index: 0;
`;

const Item = styled.div`
	display: flex;
	justify-content: start;
	align-items: center;
	margin-bottom: 10px;
	width: 100%;
	background-color: ${(props) => props.theme.postingBgColor};
`;

const CashBackContainer = styled.div`
	display: flex;
	justify-content: start;
	align-items: center;
	margin-bottom: 10px;
	width: 100%;
	background-color: ${(props) => props.theme.postingBgColor};
	flex-direction: column;
`;

const CashBack = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
	width: 100%;
	background-color: ${(props) => props.theme.postingBgColor};
`;

const Description = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: start;
	width: 200px;
	background-color: ${(props) => props.theme.postingBgColor};
`;

const PreviewImg = styled.img`
	width: 100px;
	height: 100px;
	margin-right: 10px;
`;

const IconElement = styled.a`
	margin-left: 50px;
	margin-right: 10px;
	display: flex;
	align-items: center;
`;

const Text = styled.span`
	margin: 2px 5px;
`;

const SubTotalShipping = styled.div`
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	align-items: start;
	width: 100%;
	background-color: ${(props) => props.theme.postingBgColor};
`;

const Total = styled.div`
	margin-top: 15px;
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	align-items: start;
	width: 100%;
	background-color: ${(props) => props.theme.postingBgColor};
`;

const Label = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
`;

const SubmitBtn = styled.button`
	font-family: "Hammersmith One", sans-serif;
	color: #000;
	display: block;
	text-align: center;
	border-color: ${(props) => props.theme.secondColor};

	background-color: ${(props) => props.theme.secondColor};

	cursor: pointer;
	max-width: 320px;
	width: 100%;
	padding: 10px;
	border-radius: 15px;

	font-size: 12px;
	color: black;
`;

const CashbackSubmitBtn = styled.button`
	font-family: "Hammersmith One", sans-serif;
	color: #000;
	display: block;
	text-align: center;
	border-color: ${(props) => props.theme.secondColor};

	// background-color: ${(props) => props.theme.secondColor};

	cursor: pointer;
	max-width: 320px;
	width: 30%;
	padding: 10px;
	border-radius: 15px;

	font-size: 12px;
	color: black;
	display: inline;
`;

const ExpiryDateInputField = styled.input`
	max-width: 295px;
	width: 50%;
	padding: 10px;
	border-radius: 30px;
	background-color: rgba(255, 255, 255, 1);
	margin-bottom: 10px;
	font-size: 12px;
	color: black;
	font-weight: bold;
`;

const Value = styled.div``;

function Cart() {
	const history = useHistory();
	const [cart, setCart] = useRecoilState(cartAtom);
	const [priceTotal, setPriceTotal] = useRecoilState(priceTotalInfoAtom);
	const userObject = useRecoilValue(userObjectAtom);
	const [paymentInfo, setPaymentInfo] = useRecoilState(paymentInfoAtom);
	const [addressInfo, setAddressInfo] = useRecoilState(addressInfoAtom);
	const [cartItems, setCartItems] = useRecoilState(cartItemsAtom);

	const [checked, setChecked] = useState(false);
	const [isApplied, setIsApplied] = useState(false);
	const [userInfo, setUserInfo] = useState<any>([]);
	const [isDiscount, setIsDiscount] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isEmpty, setIsEmpty] = useState(true);
	// const [items, setItems] = useState<any>([]);
	const [subTotal, setSubTotal] = useState(0);
	const [shipping, setShipping] = useState(0);
	const [cashback, setCashback] = useState(0);
	const [validCashback, setValidCashback] = useState(0);

	const createPaymentInfo = async () => {
		const paymentInfoValue = {
			uid: userObject.uid,
			cardNumber: "",
			expiryMonth: "",
			expiryYear: "",
			cvv: "",
			vendor: "",
		};
		await dbService.collection("PaymentInfo").add(paymentInfoValue);
		console.log("new payment info");
	};

	const createAddressInfo = async () => {
		const addressInfoValue = {
			uid: userObject.uid,
			shippingAddress: {
				firstName: "",
				lastName: "",
				phoneNumber: "",
				address1: "",
				address2: "",
				city: "",
				province: "",
				postalcode: "",
			},
			billingAddress: {
				firstName: "",
				lastName: "",
				phoneNumber: "",
				address1: "",
				address2: "",
				city: "",
				province: "",
				postalcode: "",
			},
		};
		await dbService.collection("AddressInfo").add(addressInfoValue);
		console.log("new address info");
	};

	async function fetchPaymentInfo(uid) {
		dbService
			.collection("PaymentInfo")
			.where("uid", "==", uid)
			.onSnapshot((snapshot) => {
				const paymentSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setPaymentInfo(paymentSnapshot);
			});
	}

	async function fetchAddressInfo(uid) {
		dbService
			.collection("AddressInfo")
			.where("uid", "==", uid)
			.onSnapshot((snapshot) => {
				const addressSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setAddressInfo(addressSnapshot);
			});
	}

	async function fetchUserInfo(uid) {
		dbService
			.collection("UserInfo")
			.where("uid", "==", uid)
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				// console.log(recordSnapshot);
				setUserInfo(recordSnapshot);
			});
	}

	useEffect(() => {
		console.log("useEffect");
		let subTotalValue: number = 0;
		let shippingValue: number = 0;
		fetchAddressInfo(userObject.uid);
		fetchPaymentInfo(userObject.uid);
		fetchUserInfo(userObject.uid);
		if (cart !== null) {
			if (cart.length !== 0) {
				let itemsArray = cart[0].items;
				console.log(itemsArray);
				if (itemsArray.length == 0 || itemsArray == undefined) {
					setIsEmpty(true);
				} else {
					setIsEmpty(false);
					itemsArray.forEach((element) => {
						subTotalValue = subTotalValue + parseFloat(element.itemPrice);
						shippingValue = shippingValue + 10;
					});

					// setCashback(priceTotal.cashback);

					setSubTotal(subTotalValue);
					console.log(subTotalValue);
					console.log(shippingValue);
					console.log(shippingValue + subTotalValue);
					if (subTotalValue > 300) {
						setShipping(0);
						const totalInfo = {
							subtotal: subTotalValue,
							shipping: 0,
							total: subTotalValue + 0 - cashback,
							cashback: cashback,
						};
						console.log(totalInfo);
						setPriceTotal(totalInfo);
					} else {
						setShipping(shippingValue);
						const totalInfo = {
							subtotal: subTotalValue,
							shipping: shippingValue,
							total: subTotalValue + shippingValue - cashback,
							cashback: cashback,
						};
						console.log(totalInfo);
						setPriceTotal(totalInfo);
					}
				}
				setIsLoading(false);
				setCartItems(itemsArray);
			} else {
				setIsEmpty(true);
				setIsLoading(false);
			}
		} else {
			// setIsEmpty(true);
			// setIsLoading(false);
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
	}, [cart, isApplied]);

	const onDeleteClick = (item) => {
		setIsLoading(true);
		dbService.doc(`Cart/${cart[0].id}`).update({
			items: firebaseInstance.firestore.FieldValue.arrayRemove({
				postingId: item.postingId,
				creatorUid: item.creatorUid,
				creatorDisplayName: item.creatorDisplayName,
				itemPhoto: item.itemPhoto,
				itemName: item.itemName,
				itemCategory: item.itemCategory,
				itemPrice: item.itemPrice,
				// soldOut: item.soldOut,
			}),
		});
	};

	const onCheckoutClick = () => {
		if (addressInfo.length == 0) {
			createAddressInfo();
		}
		if (paymentInfo.length == 0) {
			createPaymentInfo();
		}
	};

	const handleChange = () => {
		setChecked((prev) => !prev);
	};

	const cashbackOnChange = (event) => {
		const {
			target: { value },
		} = event;
		setCashback(value);
	};

	const cashbackOnSubmit = (cashback) => {
		// if()
		console.log(cashback);
		if (cashback < 10) {
			Swal.fire({
				title: "Sorry, Minimum 10 points is required",
				confirmButtonText: "Got It",
			}).then((result) => {
				if (result.isConfirmed) {
					setCashback(validCashback);
				}
			});
		} else if (cashback > subTotal + shipping) {
			Swal.fire({
				title: `Do you want to use $${cashback} cashback points?`,
				showDenyButton: true,
				confirmButtonText: "Yes",
				denyButtonText: `No`,
			}).then((result) => {
				if (result.isConfirmed) {
					Swal.fire("Cashback points is bigger than total!", "", "error");
					setCashback(validCashback);
				} else if (result.isDenied) {
					setCashback(validCashback);
				}
			});
		} else if (cashback > userInfo[0].cashback) {
			Swal.fire({
				title: `Do you want to use $${cashback} cashback points?`,
				showDenyButton: true,
				confirmButtonText: "Yes",
				denyButtonText: `No`,
			}).then((result) => {
				if (result.isConfirmed) {
					Swal.fire("You exceeded your available points!", "", "error");
					setCashback(validCashback);
				} else if (result.isDenied) {
					setCashback(validCashback);
				}
			});
		} else {
			Swal.fire({
				title: `Do you want to use $${cashback} cashback points?`,
				showDenyButton: true,
				confirmButtonText: "Yes",
				denyButtonText: `No`,
			}).then((result) => {
				if (result.isConfirmed) {
					Swal.fire("Applied!", "", "success");
					setCashback(cashback);
					setValidCashback(cashback);
					setIsApplied((prev) => !prev);
				} else if (result.isDenied) {
				}
			});
		}
	};

	console.log(userInfo);

	return (
		<Container>
			{isLoading ? (
				"Please Wait..."
			) : (
				<>
					{isEmpty ? (
						"Your Cart is Empty!"
					) : (
						<>
							<CashBackContainer>
								<CashBack>
									<Text>
										You have $ {userInfo[0]?.cashback} cashback points
									</Text>
									<FormControlLabel
										control={
											<Switch checked={checked} onChange={handleChange} />
										}
										label="Use Points"
									/>
								</CashBack>
								<Collapse in={checked} className={carouselStyle.collapsekDiv}>
									<ExpiryDateInputField
										type="number"
										placeholder="Minimum 50"
										onChange={(event) => {
											cashbackOnChange(event);
										}}
										value={cashback}
									/>

									<CashbackSubmitBtn
										onClick={() => {
											cashbackOnSubmit(cashback);
										}}
									>
										APPLY
									</CashbackSubmitBtn>
								</Collapse>
							</CashBackContainer>

							<ItemContainer>
								{cartItems?.map((item, index) => (
									<Item key={index}>
										<PreviewImg src={item.itemPhoto}></PreviewImg>
										<Description>
											<Text>Item Name: {item.itemName}</Text>
											<Text>Category: {item.itemCategory}</Text>
											<Text>Seller: {item.creatorDisplayName}</Text>
											<Text>Price: ${item.itemPrice}</Text>
										</Description>
										<IconElement href="#" onClick={() => onDeleteClick(item)}>
											<FontAwesomeIcon icon={faTrash} />
										</IconElement>
									</Item>
								))}
							</ItemContainer>
							<SubTotalShipping>
								<Label>
									<Text>Subtotal: </Text>
									<Text>${subTotal}</Text>
								</Label>
								<Label>
									<Text>Shipping: </Text>
									<Text>${shipping}</Text>
								</Label>
								<Label>
									<Text>Cashback: </Text>
									<Text>- ${cashback}</Text>
								</Label>
							</SubTotalShipping>
							<Total>
								<Label>
									<Text>Total: </Text>
									<Text>${subTotal + shipping - cashback}</Text>
								</Label>
							</Total>

							<Link
								to={{
									pathname: `/cart/${cart[0].cartOwnerUid}`,
									state: { isDiscount: isDiscount, userInfo: userInfo },
								}}
							>
								<SubmitBtn
									onClick={() => {
										onCheckoutClick();
									}}
								>
									CHECKOUT
								</SubmitBtn>
							</Link>
							<ItemContainer>
								<div style={{ width: 300, height: 90 }}></div>
							</ItemContainer>
						</>
					)}
				</>
			)}
		</Container>
	);
}

export default Cart;
