// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { cartAtom, priceTotalInfoAtom, totalInfoAtom } from "../atoms";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { dbService, firebaseInstance } from "../fbase";
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
	const totalInfo = useRecoilValue(priceTotalInfoAtom);

	console.log(totalInfo);

	//
	useEffect(() => {}, []);

	const onSubmitClick = () => {};

	return (
		<Container>
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
	);
}

export default Checkout;
