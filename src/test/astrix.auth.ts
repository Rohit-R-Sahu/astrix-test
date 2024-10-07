import pino from "pino";
import path from "path";
import { User } from "./interface";
import fs from "fs";
import { error } from "console";

const auth_api = "http://localhost:8000";
const logPath = path.join(path.resolve(), "test.log");
fs.writeFileSync(logPath, "", "utf-8");

const logger = pino(pino.destination({ dest: logPath, flags: "w" }));

const oAuthcode =
  "4%2F0AQlEd8zn8UlDYVyISF-97nMKED5z4c62LYxRyxNGZ33Wtz0JQ2lW_tnZFWSTRurzEh8OHg";

let loginToken =
  "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjE1NTcsInVzZXJOYW1lIjoiYXN0cml4XzJhNWY4YzUxX2FiMGFfNDZjM185YTQ0X2VkMTc5MzJhYjZlZiIsImlzT25ib2FyZGVkIjpmYWxzZSwidHlwZSI6ImFjY2VzcyIsImV4cCI6MTcyODQ4NDQwNH0.x0clZNDwAL_ZEDbmuYrDtdna-eofvuOL7Okpx400v48";

let onboardToken = "";

let userName: string = "";

const { pass, fail } = { pass: "PASS", fail: "FAIL" };

class AuthMethods {
  // checks server health
  async serverHealth() {
    try {
      const res = await fetch(`${auth_api}/`, { method: "GET" });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "Route Working",
      });

      logger.info({
        desc: "Checking if server running or not",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Checking if server running or not",
        state: fail,
        error: error.message,
      });

      throw error;
    }
  }

  // checks user registration
  async registerUser(user: User) {
    try {
      const res = await fetch(`${auth_api}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...user, secretKey: "abhishek" }), // user1 will hold new user data
      });

      const result = await res.json();

      if (res.ok && result) {
        expect(res.ok).toBeTruthy();
        expect(result.status).toBeTruthy();

        logger.info({
          desc: "Creating a new user",
          state: pass,
          result,
        });
      } else {
        // should not go to else incase of new user creation
        expect(res.ok).toBeFalsy();
        expect(result.status).toBeFalsy();
        expect(result.message).toContain(
          "duplicate key value violates unique constraint"
        );
        logger.error({
          desc: "Error creating a new user",
          state: pass,
          result,
        });
      }
    } catch (error: any) {
      logger.error({
        desc: "Creating a new user",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async registerDupUser(user: User) {
    try {
      const res = await fetch(`${auth_api}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...user, secretKey: "abhishek" }),
      });

      expect(res.ok).toBeFalsy();
      const result = await res.json();

      expect(result.status).toBeFalsy();
      expect(result.message).toContain(
        "duplicate key value violates unique constraint"
      );

      logger.info({
        desc: "Creating a user with a duplicate username",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Creating a user with a duplicate username",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async createDupEmail(user1: User, user2: User) {
    try {
      const res = await fetch(`${auth_api}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...user2,
          email: user1.email,
          secretKey: "abhishek",
        }),
      });

      const result = await res.json();
      if (res.ok && result) {
        expect(res.ok).toBeTruthy();
        expect(result.status).toBeTruthy();
        logger.info({
          desc: "Creating a user with a duplicate email",
          state: pass,
          result,
        });
      } else {
        expect(res.ok).toBeFalsy();
        expect(result.status).toBeFalsy();
        expect(result.message).toContain(
          "duplicate key value violates unique constraint"
        );
        logger.error({
          desc: "Unexpected success in creating a user with a duplicate email",
          state: pass,
          result,
        });
      }
    } catch (error: any) {
      logger.error({
        desc: "Creating a user with a duplicate email",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async generateOTP(user: User) {
    try {
      const res = await fetch(`${auth_api}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      expect(res.ok).toBeTruthy();
      const result = await res.json();
      expect(result).toMatchObject({
        status: true,
        message: "OTP Sent SuccessFully",
        token: expect.any(String),
      });

      logger.info({
        desc: "Generating OTP for user",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Generating OTP for user",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async loginInvalidEmail() {
    try {
      const res = await fetch(`${auth_api}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "abcdefghi" }),
      });
      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();
      expect(result.errors).toMatchObject({ "body.email": "Invalid email" });
      logger.info({
        desc: "Logging in with invalid email",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Logging in with invalid email",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async whatsAppLogin() {
    try {
      const res = await fetch(`${auth_api}/whatsAppLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "12345678",
          countryCode: "+91",
        }),
      });

      expect(res.ok).toBeTruthy();
      const result = await res.json();
      expect(result).toMatchObject({
        status: true,
        message: "We have sent you an otp over whatsapp",
        token: expect.any(String),
      });

      logger.info({
        desc: "Logging in using Whatsapp otp",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Logging in using Whatsapp otp",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }
  async invalidWhatsappNum() {
    try {
      const res = await fetch(`${auth_api}/whatsAppLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "abcdefghi",
          countryCode: "+91",
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      const result = await res.json();
      expect(result.errors).toMatchObject({
        "body.phone": "Invalid input",
      });

      logger.info({
        desc: "Logging in with invalid whatsapp number",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Logging in with invalid whatsapp number",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async missingWPNumber() {
    try {
      const res = await fetch(`${auth_api}/whatsAppLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "",
          countryCode: "+91",
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      const result = await res.json();
      expect(result.errors).toMatchObject({
        "body.phone": "Invalid input",
      });

      logger.info({
        desc: "Logging in with missing Whatsapp number",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Logging in with missing Whatsapp number",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidWPCountryCode() {
    try {
      const res = await fetch(`${auth_api}/whatsAppLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "12345678",
          countryCode: "91",
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();
      expect(result.errors).toMatchObject({
        "body.countryCode": "Invalid",
      });

      logger.info({
        desc: "Logging in with invalid country code",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Logging in with invalid country code",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async onBoardArtist() {
    try {
      const res = await fetch(`${auth_api}/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artists: [
            {
              username: "testuser121",
              name: "Test user",
              location: "India",
              gender: "male",
              role: "artist",
              dob: "2000-01-01",
              email: "artist1@example.com",
              preferences: ["painting", "sculpture"],
              phone: "1234567892",
              description: "An emerging artist",
              avatar: "https://example.com/avatar.jpg",
            },
          ],
        }),
      });

      // expect(res.ok).toBeTruthy(); // to be true in case of new user addition

      const result = await res.json();
      if (res.ok) {
        expect(result).toMatchObject({
          status: true,
          message: "Artists Onboarded",
        });
        logger.info({
          desc: "Onboarding artist with valid data",
          state: pass,
          result,
        });
      } else {
        expect(res.ok).toBeFalsy();
        logger.error({
          desc: "Unexpected error while onboarding artist with valid data",
          state: pass,
          result,
        });
      }
    } catch (error: any) {
      logger.error({
        desc: "Onboarding artist with valid data",
        state: fail,
        error: error.message,
      });

      throw error;
    }
  }

  async duplicateUserNameOnboard() {
    try {
      const res = await fetch(`${auth_api}/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artists: [
            {
              username: "testuser1",
              name: "New Test User",
              location: "USA",
              gender: "male",
              role: "artist",
              dob: "1990-01-01",
              email: "newartist@example.com",
              preferences: ["photography"],
              phone: "1234567893",
              description: "A photographer",
              avatar: "https://example.com/avatar2.jpg",
            },
          ],
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(500);

      const result = await res.json();
      expect(result).toMatchObject({
        status: false,
        message: expect.stringContaining(
          "duplicate key value violates unique constraint"
        ),
      });

      logger.info({
        desc: "Onboarding artist with duplicate username",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Onboarding artist with duplicate username",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async duplicateEmailOnboard() {
    try {
      const res = await fetch(`${auth_api}/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artists: [
            {
              username: "testuser122",
              name: "New Test User",
              location: "USA",
              gender: "male",
              role: "artist",
              dob: "1990-01-01",
              email: "artist1@example.com",
              preferences: ["photography"],
              phone: "1234567894",
              description: "A photographer",
              avatar: "https://example.com/avatar2.jpg",
            },
          ],
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(500);

      const result = await res.json();
      expect(result).toMatchObject({
        status: false,
        message: expect.stringContaining(
          "duplicate key value violates unique constraint"
        ),
      });

      logger.info({
        desc: "Onboarding artist with duplicate email",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Onboarding artist with duplicate email",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async duplicateNumberOnboard() {
    try {
      const res = await fetch(`${auth_api}/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artists: [
            {
              username: "testuser123",
              name: "Another Test User",
              location: "USA",
              gender: "female",
              role: "artist",
              dob: "1992-01-01",
              email: "newartist2@example.com",
              preferences: ["digital art"],
              phone: "1234567892",
              description: "A digital artist",
              avatar: "https://example.com/avatar3.jpg",
            },
          ],
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(500);

      const result = await res.json();
      expect(result).toMatchObject({
        status: false,
        message: expect.stringContaining(
          "duplicate key value violates unique constraint"
        ),
      });

      logger.info({
        desc: "Onboarding artist with duplicate phone number",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Onboarding artist with duplicate phone number",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidNumberOnboard() {
    try {
      const res = await fetch(`${auth_api}/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artists: [
            {
              username: "testuser124",
              name: "Another Test User",
              location: "USA",
              gender: "female",
              role: "artist",
              dob: "1992-01-01",
              email: "artist5@example.com",
              preferences: ["digital art"],
              phone: "invalidPhone",
              description: "A digital artist",
              avatar: "https://example.com/avatar3.jpg",
            },
          ],
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      const result = await res.json();
      expect(result.errors).toMatchObject({
        "body.artists.0.phone": "Invalid Phone Number",
      });
      logger.info({
        desc: "Onboarding artist with invalid phone number",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Onboarding artist with invalid phone number",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidDOBOnboard() {
    try {
      const res = await fetch(`${auth_api}/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artists: [
            {
              username: "testuser125",
              name: "Another Test User",
              location: "USA",
              gender: "female",
              role: "artist",
              dob: "invalid-date",
              email: "artist6@example.com",
              preferences: ["fashion design"],
              phone: "1098765432",
              description: "A fashion designer",
              avatar: "https://example.com/avatar4.jpg",
            },
          ],
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      const result = await res.json();
      expect(result.errors).toMatchObject({
        "body.artists.0.dob": "Invalid input",
      });

      logger.info({
        desc: "Onboarding artist with invalid date of birth",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Onboarding artist with invalid date of birth",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async googleLoginValidCode() {
    try {
      const res = await fetch(`${auth_api}/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: oAuthcode,
        }),
      });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: expect.any(String),
        token: expect.any(String),
        username: expect.any(String),
        role: expect.any(String),
        name: expect.any(String),
        isOnboarded: expect.any(Boolean),
        artistDetails: expect.any(Array),
      });
      logger.info({
        desc: "Google login with valid code",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Google login with valid code",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }
  async googleLoginMissingCode() {
    try {
      const res = await fetch(`${auth_api}/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      const result = await res.json();
      expect(result.errors).toMatchObject({
        "body.code": "code is required",
      });
      logger.info({
        desc: "Google login with missing code",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Google login with missing code",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async googleLoginInvalidCode() {
    try {
      const res = await fetch(`${auth_api}/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "invalid_oauth_code",
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(500);
      const result = await res.json();
      expect(result).toMatchObject({
        status: false,
        message: "Error fetching email please try again",
      });
      logger.info({
        desc: "Google login with invalid OAuth code",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Google login with invalid OAuth code",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async googleExistingUserLogin() {
    try {
      const res = await fetch(`${auth_api}/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: oAuthcode,
        }),
      });

      expect(res.ok).toBeTruthy();
      const result = await res.json();
      expect(result).toMatchObject({
        status: true,
        message: "User Logged In",
        username: expect.any(String),
        role: expect.any(String),
        name: expect.any(String),
        isOnboarded: expect.any(Boolean),
        artistDetails: expect.any(Array),
      });
      logger.info({
        desc: "Google login for existing user",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Google login for existing user",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async googleNewUserSignup() {
    try {
      const res = await fetch(`${auth_api}/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: oAuthcode,
        }),
      });

      expect(res.ok).toBeTruthy();
      const result = await res.json();
      expect(result).toMatchObject({
        status: true,
        message: "User Signed Up",
        token: expect.any(String),
        username: expect.any(String),
        role: expect.any(String),
        name: expect.any(String),
        isOnboarded: false,
        artistDetails: expect.any(Array),
      });

      logger.info({
        desc: "Google login for new user (sign up)",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Google login for new user (sign up)",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async googleLoginUsingParams() {
    try {
      const res = await fetch(`${auth_api}/google-login?foo=bar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "valid_oauth_code",
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();
      expect(result.errors).toMatchObject({
        query: "query is not required",
      });

      logger.info({
        desc: "Google login with query parameters",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Google login with query parameters",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async validUserOnboarding() {
    try {
      const validRequestBody = {
        updateBody: {
          dob: "1990-05-15",
          description: "A brief description",
          gender: "male",
          role: "fan",
          preferences: ["rock", "pop"],
          avatar: "https://example.com/avatar.jpg",
          name: "John Doe",
        },
        favArtists: ["artist123", "artist456"],
      };

      const res = await fetch(`${auth_api}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify(validRequestBody),
      });

      const result = await res.json();

      // In case of new user onboarding
      if (res.ok) {
        expect(res.ok).toBeTruthy();
        expect(result.status).toBeTruthy();
        logger.info({
          desc: "Onboarding with Valid request with all required fields",
          state: pass,
          result,
        });
      } else {
        expect(res.ok).toBeFalsy();
        expect(result.status).toBeFalsy();
        logger.error({
          desc: "Onboarding an user who is already onboarded...",
          state: pass,
          result,
        });
      }
    } catch (error: any) {
      logger.error({
        desc: "Onboarding with Valid request with all required fields",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }
  async missingRoleOnboarding() {
    try {
      const invalidRequestBody = {
        updateBody: {
          dob: "1990-05-15",
          description: "A brief description",
          gender: "male",
          preferences: ["rock", "pop"],
          avatar: "https://example.com/avatar.jpg",
          name: "John Doe",
        },
        favArtists: ["artist123", "artist456"],
      };

      const res = await fetch(`${auth_api}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify(invalidRequestBody),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody.role": "role is required",
      });

      logger.info({
        desc: "Missing role in onboarding request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Missing role in onboarding request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidDOBFormat() {
    try {
      const invalidRequestBody = {
        updateBody: {
          dob: "15-05-1990",
          role: "fan",
        },
      };

      const res = await fetch(`${auth_api}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify(invalidRequestBody),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody.dob": "Invalid input",
      });

      logger.info({
        desc: "Invalid date format in onboarding request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid date format in onboarding request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidGender() {
    try {
      const invalidRequestBody = {
        updateBody: {
          dob: "1990-05-15",
          gender: "unknown",
          role: "fan",
        },
      };

      const res = await fetch(`${auth_api}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify(invalidRequestBody),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody.gender":
          "Gender must be either 'male' or 'female'or 'nonBinary' or 'notSpecified' ",
      });

      logger.info({
        desc: "Invalid gender value in onboarding request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid gender value in onboarding request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidAvatarUrl() {
    try {
      const invalidRequestBody = {
        updateBody: {
          dob: "1990-05-15",
          role: "fan",
          avatar: "invalid_url",
        },
      };

      const res = await fetch(`${auth_api}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify(invalidRequestBody),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody.avatar": "Invalid URL Format",
      });

      logger.info({
        desc: "Invalid avatar URL in onboarding request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid avatar URL in onboarding request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidFavArtists() {
    try {
      const invalidRequestBody = {
        updateBody: {
          dob: "1990-05-15",
          role: "fan",
        },
        favArtists: ["a", "valid_artist"],
      };

      const res = await fetch(`${auth_api}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify(invalidRequestBody),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.favArtists.0": "String must contain at least 4 character(s)",
      });

      logger.info({
        desc: "Invalid favArtists usernames in onboarding request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid favArtists usernames in onboarding request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async missingAuthToken() {
    try {
      const validRequestBody = {
        updateBody: {
          dob: "1990-05-15",
          role: "fan",
          avatar: "https://example.com/avatar.jpg",
        },
      };

      const res = await fetch(`${auth_api}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validRequestBody),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400); // Unauthorized due to missing token

      logger.info({
        desc: "Missing Authorization token in onboarding request",
        state: pass,
      });
    } catch (error: any) {
      logger.error({
        desc: "Missing Authorization token in onboarding request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async emptyBodyRequest() {
    try {
      const res = await fetch(`${auth_api}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody": "Required",
      });

      logger.info({
        desc: "Empty body request in onboarding",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Empty body request in onboarding",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async userOnboarded() {
    try {
      const res = await fetch(`${auth_api}/isOnboarded`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loginToken}`,
          "Content-Type": "application/json",
        },
      });

      expect(res.ok).toBeTruthy();
      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        isOnboarded: true,
      });
      logger.info({
        desc: "Checking for user onboarding with valid token",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Checking for user onboarding with valid token",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async userUnboardedInvalidToken() {
    try {
      const res = await fetch(`${auth_api}/isOnboarded`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loginToken}K`,
          "Content-Type": "application/json",
        },
      });

      expect(res.ok).toBeFalsy();
      const result = await res.json();

      expect(result).toMatchObject({
        status: false,
        message: "UNAUTHOURIZED USER",
      });
      logger.info({
        desc: "Checking for user onboarding with invalid token",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Checking for user onboarding with invalid token",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async validEditProfile() {
    try {
      const res = await fetch(`${auth_api}/editProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({
          updateBody: {
            username: "rohit_1418",
            gender: "male",
            dob: "2000-08-12",
            phone: "0000181313",
            avatar: "https://example.com/avatar.jpg",
            name: "Rohit Sahu",
            locality: "Central",
            city: "Delhi",
            description: "This is a description",
            coverImg: "https://example.com/cover.jpg",
            state: "Delhi",
            pincode: "110001",
            country: "India",
          },
        }),
      });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "Profile Updated Successfully",
      });

      logger.info({
        desc: "Edit profile with valid request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Edit profile with valid request : Duplicate Username or Phone Number",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async missingUsernameEditProfile() {
    try {
      const res = await fetch(`${auth_api}/editProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({
          updateBody: {
            gender: "male",
            dob: "1990-05-15",
            phone: "1234567890",
          },
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody.username": "userName is required",
      });

      logger.info({
        desc: "Missing username in edit profile request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Missing username in edit profile request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidDOBEditProfile() {
    try {
      const res = await fetch(`${auth_api}/editProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({
          updateBody: {
            username: "JohnDoe_123",
            gender: "male",
            dob: "15-05-1990",
          },
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody.dob": "Invalid input",
      });

      logger.info({
        desc: "Invalid dob format in edit profile request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid dob format in edit profile request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidPhoneNumberEditProfile() {
    try {
      const res = await fetch(`${auth_api}/editProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({
          updateBody: {
            username: "JohnDoe_123",
            phone: "12345",
          },
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody.phone": "Invalid Phone Number",
      });

      logger.info({
        desc: "Invalid phone number in edit profile request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid phone number in edit profile request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidAvatarUrlEditProfile() {
    try {
      const res = await fetch(`${auth_api}/editProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({
          updateBody: {
            username: "JohnDoe_123",
            avatar: "invalid_url",
          },
        }),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody.avatar": "Invalid URL Format",
      });

      logger.info({
        desc: "Invalid avatar URL in edit profile request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid avatar URL in edit profile request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async missingAuthTokenEditProfile() {
    try {
      const validRequestBody = {
        updateBody: {
          username: "JohnDoe_123",
          dob: "1990-05-15",
          phone: "1234567890",
        },
      };

      const res = await fetch(`${auth_api}/editProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validRequestBody),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      logger.info({
        desc: "Missing Authorization token in edit profile request",
        state: pass,
      });
    } catch (error: any) {
      logger.error({
        desc: "Missing Authorization token in edit profile request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async emptyBodyEditProfile() {
    try {
      const res = await fetch(`${auth_api}/editProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);
      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.updateBody": "Required",
      });

      logger.info({
        desc: "Empty body request in edit profile",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Empty body request in edit profile",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async validGetUserProfile() {
    try {
      const res = await fetch(`${auth_api}/getUserProfile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
      });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "User Fetched Successfully",
      });

      userName = result.userExist.username;

      logger.info({
        desc: "Get user profile with valid request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Get user profile with valid request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async unauthorizedGetUserProfile() {
    try {
      const res = await fetch(`${auth_api}/getUserProfile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      logger.info({
        desc: "Unauthorized get user profile request (Missing token)",
        state: pass,
      });
    } catch (error: any) {
      logger.error({
        desc: "Unauthorized get user profile request (Missing token)",
        state: fail,
        error: error.message,
      });

      throw error;
    }
  }

  async invalidUsernameInParams() {
    try {
      const invalidUsername = "invalidUser";

      const res = await fetch(`${auth_api}/getUserProfile/${invalidUsername}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(404);

      const result = await res.json();

      expect(result).toMatchObject({
        status: false,
        message: "User not found",
      });

      logger.info({
        desc: "Invalid username in get user profile request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid username in get user profile request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async noParamsGetUserProfile() {
    try {
      const res = await fetch(`${auth_api}/getUserProfile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
      });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "User Fetched Successfully",
      });

      logger.info({
        desc: "Get user profile with no additional params",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Get user profile with no additional params",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async validGetUserProfileWithUsername() {
    try {
      const res = await fetch(`${auth_api}/getUserProfile/${userName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
      });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "User Fetched Successfully",
      });

      logger.info({
        desc: "Get user profile with valid username",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Get user profile with valid username",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async unauthorizedGetUserProfileWithUsername() {
    try {
      const res = await fetch(`${auth_api}/getUserProfile/${userName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      logger.info({
        desc: "Unauthorized get user profile request with username (Missing token)",
        state: pass,
      });
    } catch (error: any) {
      logger.error({
        desc: "Unauthorized get user profile request with username (Missing token)",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidUsernameFormat() {
    try {
      const invalidUsername = "invalid@user";

      const res = await fetch(`${auth_api}/getUserProfile/${invalidUsername}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
      });

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(400);

      const result = await res.json();

      // expect(result).toMatchObject({
      //   status: false,
      //   message: expect.stringContaining("Invalid UserName"),
      //   errors: {
      //     "params.username": expect.stringContaining(
      //       "Invalid UserName can only contains alphabets and _"
      //     ),
      //   },
      // });
      expect(result).toMatchObject({
        errors: {
          "params.username": expect.stringContaining(
            "Invalid UserName can only contains alphabets and _"
          ),
        },
      });

      logger.info({
        desc: "Invalid username format in get user profile request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Invalid username format in get user profile request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async nonExistentUsername() {
    try {
      const nonExistentUsername = "nonExistentUser123";

      const res = await fetch(
        `${auth_api}/getUserProfile/${nonExistentUsername}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginToken}`,
          },
        }
      );

      expect(res.ok).toBeFalsy();
      expect(res.status).toBe(404);

      const result = await res.json();

      expect(result).toMatchObject({
        status: false,
        message: "User not found",
      });

      logger.info({
        desc: "Non-existent username in get user profile request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Non-existent username in get user profile request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async validFollowUser() {
    try {
      const res = await fetch(`${auth_api}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({
          username: "rohit_123",
        }),
      });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "Follow Updated",
      });

      logger.info({
        desc: "TEST 1: Following a valid user",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "TEST 1: Following a valid user",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async followYourself() {
    try {
      const res = await fetch(`${auth_api}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({ username: userName }),
      });

      expect(res.status).toBe(400);

      const result = await res.json();

      expect(result).toMatchObject({
        status: false,
        message: "You cannot follow yourself",
      });

      logger.info({
        desc: "Attempting to follow yourself",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Attempting to follow yourself",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async followNonExistentUser() {
    try {
      const res = await fetch(`${auth_api}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({ username: "nonExistentUser" }),
      });

      expect(res.status).toBe(404);

      const result = await res.json();

      expect(result).toMatchObject({
        status: false,
        message: "User not found",
      });

      logger.info({
        desc: "Attempting to follow a non-existent user",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Attempting to follow a non-existent user",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async followUserInvalidUsernameFormat() {
    try {
      const res = await fetch(`${auth_api}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({ username: "invalid@Username" }),
      });

      expect(res.status).toBe(400);

      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.username": "Invalid UserName can only contains alphabets and _",
      });

      logger.info({
        desc: "Following with an invalid username format",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Following with an invalid username format",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async followUserMissingUsername() {
    try {
      const res = await fetch(`${auth_api}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);

      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.username": "Follower userName is required",
      });

      logger.info({
        desc: "Missing username in the request body",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Missing username in the request body",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async validRemoveFollower() {
    try {
      const validUsername = "astrix_c99be293_c109_42f0_8bc7_bfeb79272b8a";

      const res = await fetch(`${auth_api}/removeFollower`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({ username: validUsername }),
      });

      const result = await res.json();

      if (res.ok) {
        expect(res.ok).toBeTruthy();
        expect(result).toMatchObject({
          status: true,
          message: "Removed Follower",
        });
        logger.info({
          desc: "Removing a valid follower",
          state: pass,
          result,
        });
      } else {
        expect(res.ok).toBeFalsy();

        expect(result).toMatchObject({
          status: false,
          message: "Error: Invalid Request: removal of invalid follower",
        });

        logger.info({
          desc: "Unable to find the follower",
          state: pass,
          result,
        });
      }
    } catch (error: any) {
      logger.error({
        desc: "Removing a valid follower",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async removeYourself() {
    try {
      const username = userName;

      const res = await fetch(`${auth_api}/removeFollower`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({ username }),
      });

      expect(res.status).toBe(400);

      const result = await res.json();

      expect(result).toMatchObject({
        status: false,
        message: "You cannot unfollow yourself",
      });

      logger.info({
        desc: "Attempting to unfollow yourself",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Attempting to unfollow yourself",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async removeNonExistentFollower() {
    try {
      const res = await fetch(`${auth_api}/removeFollower`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({ username: "nonExistentUsername" }),
      });

      expect(res.status).toBe(404);

      const result = await res.json();

      expect(result).toMatchObject({
        status: false,
        message: "User not found",
      });

      logger.info({
        desc: "Attempting to remove a non-existent follower",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Attempting to remove a non-existent follower",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async removeFollowerInvalidUsernameFormat() {
    try {
      const res = await fetch(`${auth_api}/removeFollower`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({ username: "invalid@username" }),
      });

      expect(res.status).toBe(400);

      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.username": "Invalid UserName can only contains alphabets and _",
      });

      logger.info({
        desc: "Removing with an invalid username format",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Removing with an invalid username format",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async removeFollowerMissingUsername() {
    try {
      const res = await fetch(`${auth_api}/removeFollower`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);

      const result = await res.json();

      expect(result.errors).toMatchObject({
        "body.username": "Follower userName is required",
      });

      logger.info({
        desc: "Missing username in the request body",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Missing username in the request body",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async validGetFollowerList() {
    try {
      const query = { page: "1" };

      const res = await fetch(
        `${auth_api}/getFollowerList?page=${query.page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginToken}`,
          },
        }
      );

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "followers Fetched",
      });

      expect(result.followers.length).toBeGreaterThanOrEqual(0);

      logger.info({
        desc: "Fetching the follower list with a valid request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Fetching the follower list with a valid request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidPageQuery() {
    try {
      const invalidPage = { page: "invalid" };

      const res = await fetch(
        `${auth_api}/getFollowerList?page=${invalidPage.page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginToken}`,
          },
        }
      );

      expect(res.status).toBe(200);

      const result = await res.json();

      expect(result).toMatchObject({
        message: "followers Fetched",
        status: true,
      });

      logger.info({
        desc: "Fetching follower list with invalid page query format",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Fetching follower list with invalid page query format",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async missingPageQuery() {
    try {
      const res = await fetch(`${auth_api}/getFollowerList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
      });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "followers Fetched",
      });

      expect(result.followers.length).toBeGreaterThanOrEqual(0);

      logger.info({
        desc: "Fetching follower list with missing page query (default page)",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Fetching follower list with missing page query (default page)",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async emptyFollowerList() {
    try {
      const query = { page: "1" };

      const res = await fetch(
        `${auth_api}/getFollowerList?page=${query.page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginToken}`,
          },
        }
      );

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "followers Fetched",
        followers: [],
      });

      logger.info({
        desc: "Fetching the follower list with an empty result",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "TEST 4: Fetching the follower list with an empty result",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async validGetFollowingList() {
    try {
      const query = { page: "1" }; // valid page query

      const res = await fetch(
        `${auth_api}/getFollowingList?page=${query.page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginToken}`, // Use an actual token
          },
        }
      );

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "following Fetched",
      });

      expect(result.following.length).toBeGreaterThanOrEqual(0);

      logger.info({
        desc: "Fetching the following list with a valid request",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Fetching the following list with a valid request",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async invalidPageQuery2() {
    try {
      const invalidPage = "invalidPage";

      const res = await fetch(
        `${auth_api}/getFollowingList?page=${invalidPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginToken}`,
          },
        }
      );

      expect(res.status).toBe(200);

      const result = await res.json();

      expect(result).toMatchObject({
        message: "following Fetched",
        status: true,
      });

      logger.info({
        desc: "Fetching following list with invalid page query format",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Fetching following list with invalid page query format",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async missingPageQuery2() {
    try {
      const res = await fetch(`${auth_api}/getFollowingList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginToken}`,
        },
      });

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "following Fetched",
      });

      expect(result.following.length).toBeGreaterThanOrEqual(0);

      logger.info({
        desc: "Fetching following list with missing page query (default page)",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Fetching following list with missing page query (default page)",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }

  async emptyFollowingList() {
    try {
      const query = { page: "1" };
      const res = await fetch(
        `${auth_api}/getFollowingList?page=${query.page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginToken}`,
          },
        }
      );

      expect(res.ok).toBeTruthy();

      const result = await res.json();

      expect(result).toMatchObject({
        status: true,
        message: "following Fetched",
        following: expect.any(Object),
      });

      logger.info({
        desc: "Fetching the following list with an empty result",
        state: pass,
        result,
      });
    } catch (error: any) {
      logger.error({
        desc: "Fetching the following list with an empty result",
        state: fail,
        error: error.message,
      });
      throw error;
    }
  }
}

export default AuthMethods;
