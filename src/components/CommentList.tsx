// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// @ts-nocheck

import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
	selectedCommentAtom,
	selectedPostingAtom,
	userObjectAtom,
} from "../atoms";
import styled from "styled-components";
import { useEffect, useState } from "react";

const PreviewImg = styled.img`
	border-radius: 50%;
	width: 30px;
	height: 30px;
`;

const ProfileTag = styled.div`
	display: flex;
	align-items: center;
	img {
		margin-right: 3px;
	}
`;

function CommentList({
	id,
	commenterUid,
	postingId,
	commenterPhotoURL,
	commeterDisplayName,
	text,
	timeStamp,
}) {
	const userObject = useRecoilValue(userObjectAtom);
	const selectedPosting = useRecoilValue(selectedPostingAtom);
	const [selectedComment, setSelectedComment] =
		useRecoilState(selectedCommentAtom);
	const [isOwner, setIsOwner] = useState(false);

	const CommentIconClicked = (commenterUid) => {
		console.log(commenterUid);
		setSelectedComment(commenterUid);
	};

	useEffect(() => {
		if (userObject.uid === selectedPosting.creatorUid) {
			setIsOwner(true);
		}
	}, []);

	//프리뷰이미지와 디스플레이네임 코멘트를 단 유저 것으로 바꿔야함
	return (
		<>
			{userObject.uid == commenterUid ? (
				<>
					<li>
						<ProfileTag>
							<Link
								to={`/${commenterUid}/profile`}
								onClick={() => CommentIconClicked(commenterUid)}
							>
								<PreviewImg src={commenterPhotoURL}></PreviewImg>
							</Link>
							{commeterDisplayName}
						</ProfileTag>
						<span>{text}</span>
						<button>delete</button>
					</li>
				</>
			) : (
				<>
					<li>
						<ProfileTag>
							<Link
								to={`/${commenterUid}/profile`}
								onClick={() => CommentIconClicked(commenterUid)}
							>
								<PreviewImg src={commenterPhotoURL}></PreviewImg>
							</Link>
							{commeterDisplayName}
						</ProfileTag>
						<span>{text}</span>
						{isOwner && <button>delete</button>}
					</li>
				</>
			)}
		</>
	);
}

export default CommentList;
