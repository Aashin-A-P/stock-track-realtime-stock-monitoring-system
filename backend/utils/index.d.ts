export type User = {
    userId: number;
    userName: string;
    role: string | null;
    password: string;
    createdAt: Date | null;
};
export type TokenData = {
    user: User;
    privileges: String[];
};
export declare const generateUserToken: ({ user, privileges }: TokenData) => string;
export declare const uploadSingleImage: (fieldName: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
