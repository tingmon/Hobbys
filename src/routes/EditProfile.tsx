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
import { useRecoilState } from "recoil";
import { addressInfoAtom } from "../atoms";
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

const EditForm = styled.form`
	width: 100%;
	max-width: 320px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const LogoutBtn = styled.button`
	cursor: pointer;
	width: 100%;
	padding: 7px 20px;
	text-align: center;
	color: white;
	border-radius: 20px;
	cursor: pointer;
	background-color: tomato;
`;

const PreviewImg = styled.img`
	border-radius: 50%;
	width: 170px;
	height: 170px;
`;

const PhotoInput = styled.span`
	display: block;
	cursor: pointer;
	background-color: ${(props) => props.theme.textColor};
	padding: 10px;
	border-radius: 40px;
	margin-bottom: 5px;
`;

const ErrorMessage = styled.span`
	color: red;
`;

const GoAddressBtn = styled.button`
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

const GoAddressBtnRed = styled.button`
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

interface IForm {
	userName?: string;
	streetName?: string;
	city?: string;
	province?: string;
	postalCode?: string;
}

function EditProfile({ userObject, refreshUser, userInfo, uid }) {
	const history = useHistory();
	const [newPhotoURL, setNewPhotoURL] = useState(userObject.photoURL);
	const [previewImg, setpreviewImg] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [addressInfo, setAddressInfo] = useRecoilState(addressInfoAtom);

	// const userInfo = await dbService
	// 	.collection("UserInfo")
	// 	.where("uid", "==", userObject?.uid)
	// 	.get();

	console.log(userInfo.docs[0].data());

	async function fetchAddressInfo(uid) {
		dbService
			.collection("AddressInfo")
			.where("uid", "==", uid)
			.onSnapshot((snapshot) => {
				const recordSnapshot = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				console.log(recordSnapshot[0]);
				setAddressInfo(recordSnapshot[0]);
			});
	}

	useEffect(() => {
		fetchAddressInfo(uid);
		setIsLoading(false);
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		setError,
	} = useForm<IForm>({
		defaultValues: {
			userName: userInfo.docs[0].data().displayName,
		},
	});

	const onLogOutClick = () => {
		authService.signOut();
		history.push("/");
	};

	const onEditClick = (event) => {
		event.stopPropagation();
		setIsLoading(true);
	};

	const onValid = async (data: IForm) => {
		// make your own error conditions(address validation)
		// if (data.price > 9999) {
		// 	setError(
		// 		"price",
		// 		{ message: "Too Expensive! Enter Less Than 9999$" },
		// 		{ shouldFocus: true }
		// 	);
		// 	throw "too expensive";
		// }
		const userInfo = await dbService
			.collection("UserInfo")
			.where("uid", "==", userObject?.uid)
			.get();
		const posting = await dbService
			.collection("Posting")
			.where("creatorUid", "==", userObject.uid)
			.orderBy("createdAt", "desc")
			.get();
		const appliedPosting = posting.docs.map((doc) => doc.id);
		if (data.userName !== "") {
			console.log(data);
			const userUpdate = {
				displayName: data.userName,
			};
			await userInfo.docs[0].ref.update(userUpdate);
		}

		if (userObject.displayName !== data.userName && data.userName !== "") {
			await userObject.updateProfile({
				displayName: data.userName,
			});

			appliedPosting.forEach((element) => {
				dbService.doc(`Posting/${element}`).update({
					creatorDisplayName: data.userName,
				});
			});
			// userInfo.docs[0].data().userName = data.userName;
			refreshUser();
		}
		if (userObject.photoURL !== newPhotoURL) {
			let imgFileUrl = "";
			try {
				console.log(userObject.photoURL);
				// google account is not applicable for this occasion
				if (userObject.photoURL !== null) {
					await storageService.refFromURL(userObject.photoURL).delete();
				}
				const imgFileRef = storageService
					.ref()
					.child(`${userObject.uid}/profile/${uuidv4()}`);

				const response = await imgFileRef.putString(newPhotoURL, "data_url");

				imgFileUrl = await response.ref.getDownloadURL();

				await userObject.updateProfile({
					photoURL: imgFileUrl,
				});
				refreshUser();
				setpreviewImg(null);

				//해당 if문의 경우 사진이 변경 되었으므로 유저의 프사정보를 트윗에도 함께 업데이트 해줘야함
				//트윗 콜렉션 불러서 WHERE, MAP 써서 일일이 변경
				console.log("error? 2");

				console.log(posting);
				// appliedTweets는 해당 유저의 게시물의 아이디를 갖는 배열
				if (posting !== null) {
					// 게시물 아이디의 작성자 프사 정보를 전부 수정
					appliedPosting.forEach((element) => {
						dbService.doc(`Posting/${element}`).update({
							creatorImgUrl: imgFileUrl,
						});
					});
				}
			} catch (error) {
				const imgFileRef = storageService
					.ref()
					.child(`${userObject.uid}/profile/${uuidv4()}`);

				const response = await imgFileRef.putString(newPhotoURL, "data_url");

				imgFileUrl = await response.ref.getDownloadURL();

				await userObject.updateProfile({
					photoURL: imgFileUrl,
				});
				refreshUser();
				setpreviewImg(null);

				//해당 if문의 경우 사진이 변경 되었으므로 유저의 프사정보를 트윗에도 함께 업데이트 해줘야함
				//트윗 콜렉션 불러서 WHERE, MAP 써서 일일이 변경
				console.log("error? 2");

				console.log(posting);
				// appliedTweets는 해당 유저의 게시물의 아이디를 갖는 배열
				if (posting !== null) {
					// 게시물 아이디의 작성자 프사 정보를 전부 수정
					appliedPosting.forEach((element) => {
						dbService.doc(`Posting/${element}`).update({
							creatorImgUrl: imgFileUrl,
						});
					});
				}
			}
		}
		alert("Profile Updated!");
		history.push("/");
	};

	const onFileChange = (event) => {
		const {
			target: { files },
		} = event;
		const imgFile = files[0];
		const reader = new FileReader();
		reader.readAsDataURL(imgFile);
		//This onloadend is triggered each time the reading operation is completed
		reader.onloadend = (finishedEvent) => {
			const {
				currentTarget: { result },
			} = finishedEvent;
			setNewPhotoURL(result);
			setpreviewImg(result);
		};
	};

	return (
		<Container className="container">
			<EditForm onSubmit={handleSubmit(onValid)} className="profileForm">
				{addressInfo ? (
					<>
						<Link>
							<GoAddressBtn onClick={() => {}}>Go to Address Info</GoAddressBtn>
						</Link>
					</>
				) : (
					<>
						<Link>
							<GoAddressBtnRed onClick={() => {}}>
								Go to Address Info
							</GoAddressBtnRed>
						</Link>
					</>
				)}
				<label style={{ color: "#04aaff" }}>
					<input
						type="file"
						accept="image/*"
						onChange={onFileChange}
						className="formBtn"
						style={{ marginTop: 10, height: 27, paddingBottom: 3 }}
					/>
					<PhotoInput>
						<FontAwesomeIcon icon={faCloudUploadAlt} />
						<span> Change profile photo</span>
					</PhotoInput>
				</label>

				{previewImg && <PreviewImg src={previewImg}></PreviewImg>}
				<InputField
					type="text"
					{...register("userName", {
						minLength: { value: 2, message: "User Name is too Short" },
					})}
					placeholder="Edit User Name"
				/>
				<ErrorMessage>{errors?.email?.message}</ErrorMessage>
				{isLoading ? (
					<>
						<SubmitBtn disabled style={{ cursor: "wait" }}>
							Applying...
						</SubmitBtn>
						<LogoutBtn
							className="formBtn cancelBtn logOut"
							disabled
							style={{ cursor: "wait" }}
						>
							Log Out
						</LogoutBtn>
					</>
				) : (
					<>
						<SubmitBtn onClick={onEditClick}>Edit Profile</SubmitBtn>
						<LogoutBtn
							className="formBtn cancelBtn logOut"
							onClick={onLogOutClick}
						>
							Log Out
						</LogoutBtn>
					</>
				)}
			</EditForm>
		</Container>
	);
}

export default EditProfile;
