// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPlus,
	faTimes,
	faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";
import { authService, dbService, storageService } from "../fbase";
import react, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { selectedPostingAtom, userObjectAtom } from "../atoms";
import { Link } from "react-router-dom";

const Container = styled.div`
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const GoPaymentBtn = styled.button`
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
	margin-bottom: 3px;
	font-size: 12px;
	color: black;
	font-weight: bold;
`;

const GoPaymentBtnRed = styled.button`
	text-align: center;
	background: #EA2027;
	color: white;
	margin-top: 10px;
	pointer
	cursor: pointer;

	max-width: 320px;
	width: 100%;
	padding: 10px;
	border-radius: 30px;
	background-color: #EA2027;

	font-size: 12px;
	color: white;
	font-weight: bold;
`;

const Tabs = styled.div`
	display: grid;
	width: 80%;
	justify-content: center;
	grid-template-columns: repeat(2, 1fr);
	margin: 5px 0px;
	gap: 10px;
`;

const Tab = styled.span<{ isActive: boolean }>`
	text-align: center;
	text-transform: uppercase;
	font-size: 12px;
	font-weight: 400;
	background-color: ${(props) => props.theme.textColor};
	padding: 7px 7px;
	border-radius: 10px;
	color: ${(props) =>
			props.isActive ? props.theme.secondColor : props.theme.textColor}
		a {
		display: block;
	}
`;

const RecordContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	grid-template-rows: repeat(1, 200px);
	grid-auto-rows: 200px;
	z-index: 0;
`;

function TradeRecord() {
	const [isLoading, setIsLoading] = useState(true);
	const [userInfo, setUserInfo] = useState<any>(null);
	const [paymentInfo, setPaymentInfo] = useState<any>(null);
	const [sellingRecord, setSellingRecord] = useState<any>([]);
	const [buyingRecord, setBuyingRecord] = useState<any>([]);
	const [transactionRecord, setTransactionRecord] = useState<any>([]);
	const [showBuyingRecord, setShowBuyingRecord] = useState(false);
	const [showSellingRecord, setShowSellingRecord] = useState(false);

	const userObject = useRecoilValue(userObjectAtom);
	const setSelectedPosting = useSetRecoilState(selectedPostingAtom);

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

	async function fetchSellTransactions(uid) {
		dbService
			.collection("TransactionInfo")
			.where("sellerUid", "==", uid)
			.orderBy("timeStamp", "desc")
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setSellingRecord(recordSnapshot);
			});
	}

	async function fetchBuyTransactions(uid) {
		dbService
			.collection("TransactionInfo")
			.where("buyerUid", "==", uid)
			.orderBy("timeStamp", "desc")
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setBuyingRecord(recordSnapshot);
			});
	}

	async function fetchPaymentInfo(uid) {
		dbService
			.collection("PaymentInfo")
			.where("uid", "==", uid)
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(recordSnapshot);
				setPaymentInfo(recordSnapshot);
			});
	}

	async function fetchAllTransactions(uid) {
		dbService
			.collection("TransactionInfo")
			.where("combinedUid", "array-contains", uid)
			.orderBy("timeStamp", "desc")
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setTransactionRecord(recordSnapshot);
			});
	}

	useEffect(() => {
		fetchAllTransactions(userObject.uid).then(
			console.log("fetching transaction record done")
		);
		fetchPaymentInfo(userObject.uid).then(
			console.log("payment info: ", paymentInfo)
		);
		fetchUserInfo(userObject.uid).then(console.log("user info: ", userInfo));

		setIsLoading(false);
	}, []);

	const onPaymentClick = async () => {
		if (paymentInfo.length == 0 || paymentInfo === undefined) {
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
		}
	};

	console.log(userInfo);
	console.log(paymentInfo);
	console.log(sellingRecord);
	console.log(buyingRecord);

	return (
		<Container>
			{isLoading ? (
				"Please Wait..."
			) : (
				<>
					<Link to={`/${userObject.uid}/profile/payment`}>
						<GoPaymentBtn
							onClick={() => {
								onPaymentClick();
							}}
						>
							Go to Payment Info
						</GoPaymentBtn>
					</Link>

					<Tabs>
						<Tab isActive={true}>
							<Link
								onClick={() => {
									setShowBuyingRecord(true);
									setShowSellingRecord(false);
								}}
								to={`/${userObject.uid}/profile/record/buy`}
							>
								Buy
							</Link>
						</Tab>
						<Tab isActive={true}>
							<Link
								onClick={() => {
									setShowBuyingRecord(false);
									setShowSellingRecord(true);
								}}
								to={`/${userObject.uid}/profile/record/sell`}
							>
								Sell
							</Link>
						</Tab>
					</Tabs>

					{sellingRecord.length == 0 && buyingRecord.length == 0 ? (
						<>"You have no transaction record"</>
					) : (
						<>
							"There are some transaction record"
							{showBuyingRecord && <RecordContainer>buy</RecordContainer>}
							{showSellingRecord && <RecordContainer>sell</RecordContainer>}
						</>
					)}
				</>
			)}
		</Container>
	);
}

export default TradeRecord;
