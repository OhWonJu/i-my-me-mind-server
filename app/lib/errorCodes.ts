export const UNAUTHORIZED = {
  NOT_AUTHORIZED: {
    message: "NOT AUTHORIZED",
    code: 401000,
  },

  ACCESS_TOKEN_EXPIRED: {
    message: "ACCESS TOKEN EXPIRED",
    code: 401001,
  },

  REFRESH_TOKEN_EXPIRED: {
    message: "REFRESH TOKEN EXPIRED",
    code: 401002,
  },

  INVALID_USER: {
    message: "INVALID USER",
    code: 401101,
  },

  INVALID_USER_MATCH: {
    message: "INVALID USER MATCH",
    code: 401102,
  },

  INVALID_ACCOUNT: {
    message: "INVALID ACCOUNT",
    code: 401103,
  },
};

export const NOT_FOUND = {
  messages: "NOT FOUND",
  code: 40400,
};

export const INTERNAL_ERROR = {
  message: "SERVER TASK FAILED",
  code: 500,
};
