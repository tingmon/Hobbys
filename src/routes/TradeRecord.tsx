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
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
	paymentInfoAtom,
	selectedPostingAtom,
	transactionAtom,
	userObjectAtom,
} from "../atoms";
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

const TransactionDiv = styled.div`
	width: 100%;
	max-width: 320px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const GoPaymentBtn = styled.button`
	text-align: center;
	background: #04aaff;
	color: white;
	margin-top: 10px;
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

const HeaderText = styled.span`
	margin: 2px 5px;
	font-weight: bold;
`;

const Text = styled.span`
	margin: 2px 5px;
`;

const RecordContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	grid-template-rows: repeat(1, 100px);
	grid-auto-rows: 100px;
	z-index: 0;
	/* background-color: ${(props) => props.theme.postingBgColor}; */
`;

const RowDiv = styled.div`
	display: flex;
	justify-content: start;
`;

const LinkDiv = styled.div`
	display: flex;
	justify-content: end;
	min-width: 320px;
	&:last-child {
		float: right;
	}
	margin-right: 10px;
	font-weight: bold;
`;

const Record = styled.div`
	display: flex;
	justify-content: start;
	align-items: start;
	margin-bottom: 10px;
	width: 100%;
	max-width: 320px;
	flex-direction: column;
	box-shadow: 0px 2px 2px -1px ${(props) => props.theme.secondColor};
`;

function TradeRecord() {
	const history = useHistory();
	const [isLoading, setIsLoading] = useState(true);
	const [userInfo, setUserInfo] = useState<any>(null);
	const [sellingRecord, setSellingRecord] = useState<any>([]);
	const [buyingRecord, setBuyingRecord] = useState<any>([]);
	const [transactionRecord, setTransactionRecord] = useState<any>([]);
	const [showBuyingRecord, setShowBuyingRecord] = useState(false);
	const [showSellingRecord, setShowSellingRecord] = useState(false);

	const userObject = useRecoilValue(userObjectAtom);
	const setSelectedPosting = useSetRecoilState(selectedPostingAtom);
	const [paymentInfo, setPaymentInfo] = useRecoilState(paymentInfoAtom);
	const setTransaction = useSetRecoilState(transactionAtom);

	async function fetchPaymentInfo(uid) {
		dbService
			.collection("PaymentInfo")
			.where("uid", "==", uid)
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setPaymentInfo(recordSnapshot);
			});
	}

	async function fetchAllTransactions(uid) {
		dbService
			.collection("Transaction")
			.where("uidInTransaction", "array-contains", uid)
			.orderBy("timeStamp", "desc")
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(recordSnapshot);
				setTransactionRecord(recordSnapshot);
				console.log(recordSnapshot[0].timeStamp);
				const date = Date.parse(recordSnapshot[0].timeStamp);
				console.log(date);
			});
	}

	const onReceiptClick = (transaction) => {
		console.log(transaction);
		setTransaction(transaction);
		// history.push(`/${userObject.uid}/profile/address`);
		// history.push(`/${userObject.uid}/profile/payment`);
		history.push(`/${userObject.uid}/profile/receipt`);
	};

	useEffect(() => {
		fetchAllTransactions(userObject.uid);
		fetchPaymentInfo(userObject.uid);

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

	// console.log(userInfo);
	// console.log(paymentInfo);
	// console.log(sellingRecord);
	// console.log(buyingRecord);

	return (
		<>
			{isLoading ? (
				"Please Wait..."
			) : (
				<Container>
					<Link to={`/${userObject.uid}/profile/payment`}>
						<GoPaymentBtn
							onClick={() => {
								onPaymentClick();
							}}
						>
							Go to Payment Info
						</GoPaymentBtn>
					</Link>

					{transactionRecord.length == 0 ? (
						<>"You have no transaction record"</>
					) : (
						<TransactionDiv>
							<RecordContainer>
								{transactionRecord.map((transaction, index) => (
									<>
										<Record key={index}>
											<RowDiv>
												<HeaderText>Buyer: </HeaderText>
												<Text>{transaction.buyerDispalyName}</Text>
											</RowDiv>
											<RowDiv>
												<HeaderText>Seller: </HeaderText>
												{transaction.sellerDisplayNames.length > 3 ? (
													<>
														{transaction.sellerDisplayNames
															.slice(0, 2)
															.map((name, index) => (
																<Text key={index}>{name},</Text>
															))}
														<Text>...</Text>
													</>
												) : (
													<>
														{transaction.sellerDisplayNames.map(
															(name, index) => (
																<Text key={index}>{name}</Text>
															)
														)}
													</>
												)}
											</RowDiv>
											<RowDiv>
												<HeaderText>Date: </HeaderText>
												<Text>{transaction.timeString}</Text>
											</RowDiv>
											<LinkDiv>
												<a
													href="#"
													onClick={() => {
														onReceiptClick(transaction);
													}}
												>
													Go to Receipt
												</a>
											</LinkDiv>
											{/* {transaction.timeStamp} */}
										</Record>
									</>
								))}
							</RecordContainer>
						</TransactionDiv>
					)}
				</Container>
			)}
		</>
	);
}

export default TradeRecord;
