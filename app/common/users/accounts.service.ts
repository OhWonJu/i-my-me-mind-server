import { Account, Prisma } from "@prisma/client";
import { prisma } from "../../database";
import { CreateAccountDTO } from "./accounts.interface";
import { CommonResponse } from "../../types/commonResponse";
import { APIError, ErrCode } from "encore.dev/api";

const AccountsService = {
  createAccount: async (
    createAccountDTO: CreateAccountDTO
  ): Promise<Account | null> => {
    const existAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: createAccountDTO.provider,
          providerAccountId: createAccountDTO.provider,
        },
      },
    });

    if (existAccount) {
      return existAccount;
    }

    const newAccount = await prisma.account.create({
      data: createAccountDTO,
    });

    if (newAccount) {
      return newAccount;
    } else {
      throw new APIError(ErrCode.Internal, "create new account faild");
    }
  },

  findAccount: async (
    accountWhereUniqueInput: Prisma.AccountWhereUniqueInput
  ): Promise<Account | null> => {
    return await prisma.account.findUnique({
      where: accountWhereUniqueInput,
    });
  },

  updateAccount: async (account: Account): Promise<Account | null> => {
    const updatedAccount = prisma.account.update({
      where: {
        id: account.id,
      },
      data: { ...account },
    });
    const result = await prisma.$transaction([updatedAccount]);

    if (result.length > 0) {
      return updatedAccount;
    } else throw new APIError(ErrCode.Internal, "create new account faild");
  },
};

export default AccountsService;
