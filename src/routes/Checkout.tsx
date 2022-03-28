// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import {
	addressInfoAtom,
	cartAtom,
	paymentInfoAtom,
	priceTotalInfoAtom,
	totalInfoAtom,
	userObjectAtom,
} from "../atoms";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dbService, firebaseInstance } from "../fbase";
import { Link } from "react-router-dom";
import { Collapse, FormControlLabel, Switch } from "@mui/material";

const Container = styled.div`
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const Shipto = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: start;
	background-color: ${(props) => props.theme.postingBgColor};
	margin: 5px 5px;
	width: 100%;
`;

const PaymentDetails = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: start;
	background-color: ${(props) => props.theme.postingBgColor};
	margin: 5px 5px;
	width: 100%;
`;

const BillingAddress = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: start;
	background-color: ${(props) => props.theme.postingBgColor};
	margin: 5px 5px;
	width: 100%;
`;

const Total = styled.div`
	margin-top: 5px;
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

const Text = styled.span`
	margin: 2px 5px;
`;

const TotalText = styled.span`
	margin: 20px 5px;
	font-weight: bold;
`;

const HeaderText = styled.span`
	margin: 2px 5px;
	font-weight: bold;
`;

const SubmitBtn = styled.button`
	text-align: center;
	background: #04aaff;
	color: white;
	margin-top: 10px;
	cursor: pointer;

	max-width: 320px;
	width: 300px;
	padding: 10px;
	border-radius: 30px;
	background-color: rgba(255, 255, 255, 1);
	margin-bottom: 10px;
	font-size: 12px;
	color: black;
	font-weight: bold;
`;

function Checkout() {
	const [isLoading, setIsLoading] = useState(true);
	const [userInfo, setUserInfo] = useState<any>(null);
	const [isShipping, setIsShipping] = useState(true);
	const [isBilling, setIsBilling] = useState(false);

	const userObject = useRecoilValue(userObjectAtom);
	const totalInfo = useRecoilValue(priceTotalInfoAtom);
	const [paymentInfo, setPaymentInfo] = useRecoilState(paymentInfoAtom);
	const [addressInfo, setAddressInfo] = useRecoilState(addressInfoAtom);

	async function fetchUserInfo(uid) {
		dbService
			.collection("UserInfo")
			.where("uid", "==", uid)
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setUserInfo(recordSnapshot[0]);
			});
	}

	async function fetchPaymentInfo(uid) {
		dbService
			.collection("PaymentInfo")
			.where("uid", "==", uid)
			.onSnapshot((snapshot) => {
				const paymentSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setPaymentInfo(paymentSnapshot[0]);
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
				setAddressInfo(addressSnapshot[0]);
			});
	}

	const createPaymentInfo = () => {
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

	const createAddressInfo = () => {
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

	const handleIsShipping = () => {
		setIsShipping((prev) => !prev);
	};
	const handleIsBilling = () => {
		setIsBilling((prev) => !prev);
	};

	//
	useEffect(() => {
		fetchUserInfo(userObject.uid);
		fetchPaymentInfo(userObject.uid);
		fetchAddressInfo(userObject.uid);
		setIsLoading(false);
	}, []);

	// make new transaction record / userinfo -> update buyer point, seller point, rank
	const onSubmitClick = () => {};

	console.log("userInfo: ", userInfo);
	console.log("paymentInfo: ", paymentInfo);
	console.log("addressInfo: ", addressInfo);

	return (
		<>
			{isLoading ? (
				"Please Wait..."
			) : (
				<>
					{/* {paymentInfo == null && createPaymentInfo() : <></>} */}
					<Container>
						<FormControlLabel
							control={
								<Switch checked={isShipping} onChange={handleIsShipping} />
							}
							label="SHIPPING ADDRESS"
						/>
						<Collapse></Collapse>
						<Shipto>
							<HeaderText>SHIP TO</HeaderText>
							<Text>recipient</Text>
							<Text>address1(street)</Text>
							<Text>address2(addtional)</Text>
							<Text>city</Text>
							<Text>postalcode</Text>
						</Shipto>
						<PaymentDetails>
							<HeaderText>CREDIT CARD DETAILS</HeaderText>
							<Text>Visa **** 7209</Text>
						</PaymentDetails>
						<BillingAddress>
							<HeaderText>BILLING ADDRESS</HeaderText>
							<Text>recipient</Text>
							<Text>address1(street)</Text>
							<Text>address2(addtional)</Text>
							<Text>city</Text>
							<Text>postalcode</Text>
						</BillingAddress>
						<Total>
							<Label>
								<Text>Subtotal: </Text>
								<Text>${totalInfo.subtotal}</Text>
							</Label>
							<Label>
								<Text>Shipping: </Text>
								<Text>${totalInfo.shipping}</Text>
							</Label>
							<Label>
								<TotalText>Total: </TotalText>
								<TotalText>${totalInfo.total}</TotalText>
							</Label>
						</Total>
						<Link
							to={{
								pathname: `/`,
							}}
						>
							<SubmitBtn>PLACE ORDER</SubmitBtn>
						</Link>
					</Container>
				</>
			)}
		</>
	);
}

export default Checkout;
