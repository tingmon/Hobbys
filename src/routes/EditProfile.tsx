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

	// const userInfo = await dbService
	// 	.collection("UserInfo")
	// 	.where("uid", "==", userObject?.uid)
	// 	.get();

	console.log(userInfo.docs[0].data());

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		setError,
	} = useForm<IForm>({
		defaultValues: {
			userName: userInfo.docs[0].data().displayName,
			streetName: userInfo.docs[0].data().streetName,
			city: userInfo.docs[0].data().city,
			province: userInfo.docs[0].data().province,
			postalCode: userInfo.docs[0].data().postalCode,
		},
	});

	const onLogOutClick = () => {
		authService.signOut();
		history.push("/");
	};

	const onValid = async (data: IForm) => {
		// make your own error conditions(address validation)
		// one address input filled? -> every address inputs required
		// 		if (data.password !== data.passwordConfirm) {
		// 			setError(
		// 				"passwordConfirm",
		// 				{ message: "password inputs are not same" },
		// 				{ shouldFocus: true }
		// 			);
		// 		}
		//
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
		if (
			data.streetName !== "" ||
			data.city !== "" ||
			data.province !== "" ||
			data.postalCode !== "" ||
			data.userName !== ""
		) {
			console.log(data);
			const userUpdate = {
				displayName: data.userName,
				streetName: data.streetName,
				city: data.city,
				province: data.province,
				postalCode: data.postalCode,
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
				console.log(error);
				return;
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
				<InputField
					type="text"
					{...register("streetName")}
					placeholder="Edit Street Name"
				/>
				<InputField type="text" {...register("city")} placeholder="Edit City" />
				<InputField
					type="text"
					{...register("province")}
					placeholder="Edit Province"
				/>
				<InputField
					type="text"
					{...register("postalCode", {
						pattern: {
							value:
								/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
							message: "Invalid Postal Code Pattern",
						},
					})}
					placeholder="Edit Postal Code"
				/>
				<SubmitBtn>Edit Profile</SubmitBtn>
				<LogoutBtn className="formBtn cancelBtn logOut" onClick={onLogOutClick}>
					Log Out
				</LogoutBtn>
			</EditForm>
		</Container>
	);
}

export default EditProfile;
