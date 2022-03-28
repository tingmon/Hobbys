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
	uidAtom,
	userObjectAtom,
} from "../atoms";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dbService, firebaseInstance } from "../fbase";
import { Link, useHistory } from "react-router-dom";
import { Collapse, FormControlLabel, Switch } from "@mui/material";
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

const DisabledBtn = styled.button`
	text-align: center;
	background: #04aaff;
	color: white;
	margin-top: 10px;
	cursor: not-allowed;

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
	const history = useHistory();
	const [isLoading, setIsLoading] = useState(true);
	const [userInfo, setUserInfo] = useState<any>([]);
	const [isReady, setIsReady] = useState(false);

	const uid = useRecoilValue(uidAtom);
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
				console.log(recordSnapshot);
				setUserInfo(recordSnapshot);
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
				if (paymentSnapshot[0].vendor == "") {
					setIsReady(false);
				} else {
					setIsReady(true);
				}
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
				if (
					addressSnapshot[0].shippingAddress.postalcode == "" ||
					addressSnapshot[0].billingAddress.postalcode == ""
				) {
					setIsReady(false);
				} else {
					setIsReady(true);
				}
				setAddressInfo(addressSnapshot);
			});
	}

	//
	useEffect(() => {
		fetchPaymentInfo(uid);
		fetchAddressInfo(uid);
		fetchUserInfo(uid);
		setIsLoading(false);
	}, []);

	// make new transaction record / userinfo -> update buyer point, seller point, rank
	const onSubmitClick = async () => {
		Swal.fire({
			title: "Your Order is Placed!",
			// showDenyButton: true,
			confirmButtonText: "Got It",
		}).then((result) => {
			/* Read more about isConfirmed, isDenied below */
			if (result.isConfirmed) {
				// Swal.fire("Saved!", "", "success");

				const transactionRecord = {};

				history.push(`/`);
			}
			//  else if (result.isDenied) {
			// 	Swal.fire("Changes are not saved", "", "info");
			// 	// history.push("/cart");
			// }
		});
	};

	console.log("userInfo: ", userInfo);
	console.log("paymentInfo: ", paymentInfo);
	console.log("addressInfo: ", addressInfo);

	return (
		<>
			{isLoading ? (
				"Please Wait..."
			) : (
				<>
					{addressInfo[0] && paymentInfo[0] && (
						<Container>
							{/* <div>
								{addressInfo[0]?.billingAddress.postalcode == "" &&
									addressInfo[0]?.shippingAddress.postalcode == "" && (
										<Link
											to={`/${uid}/profile/`}
											params={{ fromCheckout: true }}
										>
											<button>Go to Address Form</button>
										</Link>
									)}
								{paymentInfo[0]?.vendor == "" && (
									<Link to={`/${uid}/profile/`} params={{ fromCheckout: true }}>
										<button>Go to Payment Form</button>
									</Link>
								)}
							</div> */}

							<Shipto>
								<HeaderText>SHIP TO</HeaderText>
								<Text>
									{addressInfo[0]?.shippingAddress.firstName}{" "}
									{addressInfo[0]?.shippingAddress.lastName}
								</Text>
								<Text>{addressInfo[0]?.shippingAddress.address1}</Text>
								<Text>{addressInfo[0]?.shippingAddress.address2}</Text>
								<Text>{addressInfo[0]?.shippingAddress.city}</Text>
								<Text>{addressInfo[0]?.shippingAddress.postalcode}</Text>
							</Shipto>
							<PaymentDetails>
								<HeaderText>CREDIT CARD</HeaderText>
								<Text>
									{paymentInfo[0]?.vendor} {" **** "}{" "}
									{paymentInfo[0]?.cardNumber.slice(12)}
								</Text>
							</PaymentDetails>
							<BillingAddress>
								<HeaderText>BILLING ADDRESS</HeaderText>
								<Text>
									{addressInfo[0]?.billingAddress.firstName}{" "}
									{addressInfo[0]?.billingAddress.lastName}
								</Text>
								<Text>{addressInfo[0]?.billingAddress.address1}</Text>
								<Text>{addressInfo[0]?.billingAddress.address2}</Text>
								<Text>{addressInfo[0]?.billingAddress.city}</Text>
								<Text>{addressInfo[0]?.billingAddress.postalcode}</Text>
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
							<a>
								{!isReady ? (
									<DisabledBtn disabled>COMPLETE INFO FIRST</DisabledBtn>
								) : (
									<SubmitBtn
										onClick={() => {
											onSubmitClick();
										}}
									>
										PLACE ORDER
									</SubmitBtn>
								)}
							</a>
							<Link
								to={{
									pathname: `/cart`,
								}}
							>
								<SubmitBtn>BACK</SubmitBtn>
							</Link>
						</Container>
					)}
				</>
			)}
		</>
	);
}

export default Checkout;
