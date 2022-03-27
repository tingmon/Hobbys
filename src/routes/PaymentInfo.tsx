// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
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
// import { Collapse } from "react-bootstrap";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import Paper from "@mui/material/Paper";
import Collapse from "@mui/material/Collapse";
import FormControlLabel from "@mui/material/FormControlLabel";
import AddressForm from "../components/AddressForm";
import Checkbox from "@mui/material/Checkbox";
import { pink } from "@mui/material/colors";
import Swal from "sweetalert2";

const Container = styled.div`
	max-width: 480px;
	margin: 0 auto;
	width: 100%;
	height: 80vh;
	display: flex;
	flex-direction: column;
`;

const ItemContainer = styled.div`
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	z-index: 0;
`;

const Item = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: start;
	min-height: 100px;
	background-color: ${(props) => props.theme.postingBgColor};
	margin: 5px 5px;
	width: 100%;
`;

const HeaderText = styled.span`
	margin: 2px 5px;
	font-weight: bold;
`;

const Text = styled.span`
	margin: 2px 5px;
`;

const PaymentForm = styled.form`
	font-family: "Noto Sans", sans-serif;
	color: #000;
	width: 100%;
	max-width: 320px;
	display: flex;
	flex-direction: column;
`;

const InputField = styled.input`
	max-width: 295px;
	width: 100%;
	padding: 10px;
	border-radius: 30px;
	background-color: rgba(255, 255, 255, 1);
	margin-bottom: 10px;
	font-size: 12px;
	color: black;
	font-weight: bold;
`;

const SubmitBtn = styled.button`
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
	margin-bottom: 10px;
	font-size: 12px;
	color: black;
	font-weight: bold;
`;

const ErrorMessage = styled.span`
	color: red;
`;

interface IForm {
	cardOwner: string;
	cardNumber: string;
	expiryMonth: string;
	expiryYear: string;
	cvv: string;
}

function PaymentInfo({ fromCheckout }) {
	const [paymentInfo, setPaymentInfo] = useRecoilState(paymentInfoAtom);
	const userObject = useRecoilValue(userObjectAtom);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		setError,
	} = useForm<IForm>({
		defaultValues: {
			cardOwner: paymentInfo[0]?.cardOwner || "",
			cardNumber: paymentInfo[0]?.cardNumber || "",
			expiryMonth: paymentInfo[0]?.expiryMonth || "",
			expiryYear: paymentInfo[0]?.expiryYear || "",
			cvv: paymentInfo[0]?.cvv || "",
		},
	});

	function fetchPaymentInfo(uid) {
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

	useEffect(() => {
		fetchPaymentInfo(userObject.uid);
	}, []);

	const onValid = async (data: IForm) => {
		let cardVendor = "";
		if (/^3[47][0-9]{13}$/.test(data.cardNumber)) {
			cardVendor = "Amex";
		}
		if (/^3[47][0-9]{13}$/.test(data.cardNumber)) {
			cardVendor = "Master";
		}
		if (/^(62[0-9]{14,17})$/.test(data.cardNumber)) {
			cardVendor = "Visa";
		}
		if (/^3[47][0-9]{13}$/.test(data.cardNumber)) {
			cardVendor = "UnionPay";
		}
		if (/^3[47][0-9]{13}$/.test(data.cardNumber)) {
			cardVendor = "JCB";
		}
		console.log(data, " onShippingValid");
		dbService.doc(`PaymentInfo/${paymentInfo[0].id}`).update({
			cardOwner: data.cardOwner,
			cardNumber: data.cardNumber,
			expiryMonth: data.expiryMonth,
			expiryYear: data.expiryYear,
			cvv: data.cvv,
			vendor: cardVendor,
		});
		Swal.fire({
			title: "Your Payment Info is Updated",
			confirmButtonText: "Got It",
		}).then((result) => {
			/* Read more about isConfirmed, isDenied below */
			if (result.isConfirmed) {
				// Swal.fire("Saved!", "", "success");
			}
		});
	};
	// backup testing

	return (
		<Container>
			{fromCheckout && <button>Back to checkout</button>}
			<HeaderText>ENTER CARD DETAILS</HeaderText>
			<ItemContainer>
				<Item>
					<PaymentForm onSubmit={handleSubmit(onValid)}>
						<InputField
							type="text"
							{...register("cardOwner", {
								required: "Owner Name is Required",
								minLength: { value: 2, message: "Name is too Short" },
							})}
							placeholder="Enter Owner Name"
						/>
						<ErrorMessage>{errors?.cardOwner?.message}</ErrorMessage>
						<InputField
							type="text"
							{...register("cardNumber", {
								required: "Last Name is Required",
								// exact 12 digits
							})}
							placeholder="Enter Last Name"
						/>
						<ErrorMessage>{errors?.cardNumber?.message}</ErrorMessage>
						<InputField
							type="text"
							{...register("expiryMonth", {
								required: "Month is Required",
								// 01 - 12
							})}
							placeholder="Enter Month"
						/>
						<ErrorMessage>{errors?.expiryMonth?.message}</ErrorMessage>
						<InputField
							type="text"
							{...register("expiryYear", {
								required: "Year is Required",
								// 2021 < x < 2028
							})}
							placeholder="Enter Year"
						/>
						<ErrorMessage>{errors?.expiryYear?.message}</ErrorMessage>
						<InputField
							type="text"
							{...register("cvv", {
								required: "CVV is Required",
								// exact 3 digits
							})}
							placeholder="Enter CVV"
						/>
						<ErrorMessage>{errors?.cvv?.message}</ErrorMessage>
						<SubmitBtn>Submit</SubmitBtn>
					</PaymentForm>
				</Item>
			</ItemContainer>
		</Container>
	);
}

export default PaymentInfo;
