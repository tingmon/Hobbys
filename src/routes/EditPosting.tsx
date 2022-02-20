// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { useRecoilValue } from "recoil";
import { selectedPostingAtom, userObjectAtom } from "../atoms";

// @ts-nocheck
function EditPosting() {
	const selectedPostingInfo = useRecoilValue(selectedPostingAtom);
	const userObject = useRecoilValue(userObjectAtom);
	console.log(selectedPostingInfo);
	console.log(userObject);

	return "EditPosting";
}

export default EditPosting;
