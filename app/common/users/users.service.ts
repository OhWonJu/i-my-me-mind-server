import { APIError, ErrCode } from "encore.dev/api";
import { prisma } from "../../database";
import { CommonResponse } from "../../types/commonResponse";
import {
  CreateUserDTO,
  UpdateUserDTO,
  UpdateUserResponse,
} from "./users.interface";
import { Prisma, User } from "@prisma/client";
import { INTERNAL_ERROR, NOT_FOUND } from "../../lib/errorCodes";

const UsersService = {
  createUser: async (createUserDTO: CreateUserDTO): Promise<User | null> => {
    const email = createUserDTO.email;

    const existUser = await prisma.user.findUnique({ where: { email } });
    if (existUser) return null;

    const newUser = prisma.user.create({
      data: createUserDTO,
    });

    const result = await prisma.$transaction([newUser]);

    if (result.length > 0) {
      return result[0];
    } else {
      throw new APIError(ErrCode.Internal, "create new user faild");
    }
  },

  updateUser: async (
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    updateUserDTO: UpdateUserDTO
  ): Promise<CommonResponse<UpdateUserResponse>> => {
    const updatedUser = await prisma.user.update({
      where: userWhereUniqueInput,
      data: { ...updateUserDTO },
    });

    if (updatedUser) {
      return {
        ok: true,
        data: {
          name: updatedUser.name,
          email: updatedUser.email,
          updatedAt: updatedUser.updatedAt,
        },
      };
    } else {
      return {
        ok: false,
        errorMessage: INTERNAL_ERROR.message,
        errorCode: INTERNAL_ERROR.code,
      };
    }
  },

  findUser: async (
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<CommonResponse<User>> => {
    const user = await prisma.user.findUnique({
      where: userWhereUniqueInput,
    });

    if (user)
      return {
        ok: true,
        data: user,
      };
    else
      return {
        ok: false,
        errorMessage: NOT_FOUND.messages,
        errorCode: NOT_FOUND.code,
      };
  },

  count: async (): Promise<number> => {
    const count = await prisma.user.count();
    return count;
  },
};

export default UsersService;
