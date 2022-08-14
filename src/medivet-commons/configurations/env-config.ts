// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

export const envConfig = () => ({
    ENCRYPT_KEY: process.env.ENCRYPT_KEY,
});