import { atom, selector } from "recoil";

export interface IUserMetaData {
	creationTime: string;
	lastSignInTime: string;
}

export interface IMultiFactorInfo {
	displayName: string | null;
	enrollmentTime: string;
	factorId: string;
	uid: string;
}

export interface IMultiFactorUser {
	enrolledFactors: IMultiFactorInfo;
}

export interface IUserInfo {
	displayName: string | null;
	email: string | null;
	phoneNumber: string | null;
	photoURL: string | null;
	providerId: string;
	uid: string;
}

export interface IUserObject {
	displayName: string | null;
	email: string | null;
	emailVerified: boolean;
	isAnonymous: boolean;
	metadata: IUserMetaData;
	multiFactor: IMultiFactorUser;
	phoneNumber: string | null;
	photoURL: string | null;
	providerData: IUserInfo[];
	providerId: string;
	refreshToken: string;
	tenantId: string | null;
	uid: string;
}

export enum Ranks {
	"Bronze" = "Bronze",
	"Silver" = "BSilverronze",
	"Gold" = "Gold",
	"Platinum" = "Platinum",
	"Master" = "Master",
	"HallofFamer" = "HallofFamer",
}

export interface ISellerRank {
	rank: Ranks;
}

export const isLoggedInState = atom<boolean>({
	key: "isLoggedIn",
	default: false,
});

// export const userObjectState = atom<IUserObject>({
// 	key: "userObject",
// 	default: {
// 		displayName: "",
// 		email: "",
// 		emailVerified: false,
// 		isAnonymous: false,
// 		metadata: { creationTime: "", lastSignInTime: "" },
// 		multiFactor: {
// 			enrolledFactors: {
// 				displayName: "",
// 				enrollmentTime: "",
// 				factorId: "",
// 				uid: "",
// 			},
// 		},
// 		phoneNumber: "",
// 		photoURL: "",
// 		providerData: [
// 			{
// 				displayName: "",
// 				email: "",
// 				phoneNumber: "",
// 				photoURL: "",
// 				providerId: "",
// 				uid: "",
// 			},
// 		],
// 		providerId: "",
// 		refreshToken: "",
// 		tenantId: "",
// 		uid: "",
// 	},
// });
