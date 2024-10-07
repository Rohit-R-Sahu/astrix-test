import { expect, test } from "vitest";
import { User } from "./interface";
import AuthMethods from "./astrix.auth";

// instantiating the AuthMethods class
const authMethods = new AuthMethods();

// ASTRIX AUTH SERVER API URL
const auth_api = "http://localhost:8000";

const user1: User = {
  username: "testUser111",
  name: "user1",
  email: "user1@example.com",
};

const user2: User = {
  username: "testUser222",
  name: "user1",
  email: "user2@example.com",
};

describe(`Running tests for ${auth_api} server for Astrix Authentications...`, () => {
  describe("Checking server running health status", () => {
    // Checking server running status for ${auth_api}
    test("test 1: checking if server running or not", authMethods.serverHealth);
  });

  describe("Checking for user registration: /register", () => {
    test("test 1: creating a user", async () => {
      await authMethods.registerUser(user1);
    });

    test("test 2: creating a user with a duplicate username", async () => {
      await authMethods.registerDupUser(user1);
    });

    test("test 3: creating a user with a duplicate email", async () => {
      await authMethods.createDupEmail(user1, user2);
    });
  });

  describe("Checking for user login: /login", () => {
    test("test 1: Generating OTP for user", async () => {
      await authMethods.generateOTP(user1);
    });

    test(
      "test 2: Logging in with invalid email",
      authMethods.loginInvalidEmail
    );
  });

  describe("Checking for user WhatsApp login: /whatsAppLogin", () => {
    test(
      "test 1: Generating OTP for valid phone and countryCode",
      authMethods.whatsAppLogin
    );

    test(
      "test 2: Logging in with invalid phone number",
      authMethods.invalidWhatsappNum
    );

    test(
      "test 3: Logging in with missing phone number",
      authMethods.missingWPNumber
    );

    test(
      "test 4: Logging in with invalid country code",
      authMethods.invalidWPCountryCode
    );
    //------------------------------------------ NOT WORKING DUE TO TWILIO ------------------------------ //
    // test("test 5: Logging in with phone number already associated with an account", async () => {
    //   const res = await fetch(`${auth_api}/whatsAppLogin`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       phone: "8249505060",
    //       countryCode: "+91",
    //     }),
    //   });

    //   expect(res.ok).toBeFalsy();
    //   expect(res.status).toBe(500);

    //   const result = await res.json();
    //   expect(result.message).toBe(
    //     "phone number is already associated with an account"
    //   );
    // });
  });

  describe("Checking for artist onboarding: /onboard", () => {
    test(
      "test 1: Onboarding artist with valid data",
      authMethods.onBoardArtist
    );

    test(
      "test 2: Onboarding artist with duplicate username",
      authMethods.duplicateUserNameOnboard
    );

    test(
      "test 3: Onboarding artist with duplicate email",
      authMethods.duplicateEmailOnboard
    );

    test(
      "test 4: Onboarding artist with duplicate phone number",
      authMethods.duplicateNumberOnboard
    );

    test(
      "test 5: Onboarding artist with invalid phone number",
      authMethods.invalidNumberOnboard
    );

    test(
      "test 6: Onboarding artist with invalid date of birth",
      authMethods.invalidDOBOnboard
    );
  });

  describe("Checking Google login : /google-login", () => {
    // test(
    //   "test 1: Google login with valid code",
    //   authMethods.googleLoginValidCode
    // );
    test(
      "test 2: Google login with missing code",
      authMethods.googleLoginMissingCode
    );
    test(
      "test 3: Google login with invalid OAuth code",
      authMethods.googleLoginInvalidCode
    );
    // test(
    //   "test 4: Google login for existing user",
    //   authMethods.googleExistingUserLogin
    // );
    // test(
    //   "test 5: Google login for new user (sign up)",
    //   authMethods.googleNewUserSignup
    // );
    test(
      "test 6: Google login with query parameters",
      authMethods.googleLoginUsingParams
    );
  });

  describe("Validation for user onboarding: /onboarding", () => {
    test(
      "test 1: Valid request with all required fields",
      authMethods.validUserOnboarding
    );

    test("test 2: Missing role", authMethods.missingRoleOnboarding);

    test("test 3: Invalid date format for dob", authMethods.invalidDOBFormat);

    test("test 4: Invalid gender value", authMethods.invalidGender);

    test("test 5: Invalid avatar URL format", authMethods.invalidAvatarUrl);

    test("test 6: Invalid favArtists usernames", authMethods.invalidFavArtists);

    test(
      "test 7: Request without Authorization token",
      authMethods.missingAuthToken
    );

    test("test 8: Empty body request", authMethods.emptyBodyRequest);
  });

  describe("Checking if user is onboarded : /isOnboarded", () => {
    test(
      "test 1: Checking for user onboarding with valid token",
      authMethods.userOnboarded
    );
    test(
      "test 2: Checking for user onboarding with invalid token",
      authMethods.userUnboardedInvalidToken
    );
  });

  describe("Validation for edit profile: /editProfile", () => {
    test(
      "test 1: Valid request with all required fields",
      authMethods.validEditProfile
    );

    test(
      "test 2: Missing username in request",
      authMethods.missingUsernameEditProfile
    );

    test(
      "test 3: Invalid date format for dob",
      authMethods.invalidDOBEditProfile
    );

    test(
      "test 4: Invalid phone number",
      authMethods.invalidPhoneNumberEditProfile
    );

    test(
      "test 5: Invalid avatar URL format",
      authMethods.invalidAvatarUrlEditProfile
    );

    test(
      "test 6: Request without Authorization token",
      authMethods.missingAuthTokenEditProfile
    );

    test("test 7: Empty body request", authMethods.emptyBodyEditProfile);
  });

  describe("Validation for get user profile: /getUserProfile", () => {
    test(
      "test 1: Valid request to get user profile",
      authMethods.validGetUserProfile
    );

    test(
      "test 2: Unauthorized request due to missing token",
      authMethods.unauthorizedGetUserProfile
    );

    test(
      "test 3: Invalid username in request",
      authMethods.invalidUsernameInParams
    );

    test(
      "test 4: Get user profile without params",
      authMethods.noParamsGetUserProfile
    );
  });

  describe("Validation for get user profile with username: /getUserProfile/:username", () => {
    test(
      "test 1: Valid request to get user profile with valid username",
      authMethods.validGetUserProfileWithUsername
    );

    test(
      "test 2: Unauthorized request due to missing token",
      authMethods.unauthorizedGetUserProfileWithUsername
    );

    test(
      "test 3: Invalid username format in request",
      authMethods.invalidUsernameFormat
    );

    test(
      "test 4: Request with non-existent username",
      authMethods.nonExistentUsername
    );
  });

  describe("Validation for user follow: /follow", () => {
    test(
      "test 1: Valid request for following a user",
      authMethods.validFollowUser
    );
    test("test 2: Attempting to follow yourself", authMethods.followYourself);
    test(
      "test 3: Attempting to follow a non-existent user",
      authMethods.followNonExistentUser
    );
    test(
      "test 4: Following with an invalid username format",
      authMethods.followUserInvalidUsernameFormat
    );
    test(
      "test 5: Missing username in the request body",
      authMethods.followUserMissingUsername
    );
  });

  describe("Validation for removing a follower: /removeFollower", () => {
    test(
      "test 1: Valid request for removing a follower",
      authMethods.validRemoveFollower
    );
    test(
      "test 2: Attempting to remove yourself as a follower",
      authMethods.removeYourself
    );
    test(
      "test 3: Attempting to remove a non-existent follower",
      authMethods.removeNonExistentFollower
    );
    test(
      "test 4: Removing a follower with an invalid username format",
      authMethods.removeFollowerInvalidUsernameFormat
    );
    test(
      "test 5: Missing username in the request body",
      authMethods.removeFollowerMissingUsername
    );
  });

  describe("Validation for fetching the follower list: /getFollowerList", () => {
    test(
      "test 1: Fetching follower list with valid request",
      authMethods.validGetFollowerList
    );
    test(
      "test 2: Fetching follower list with invalid page query",
      authMethods.invalidPageQuery
    );
    test(
      "test 3: Fetching follower list with missing page query",
      authMethods.missingPageQuery
    );
    test(
      "test 4: Fetching follower list with an empty follower list",
      authMethods.emptyFollowerList
    );
  });

  describe("Validation for fetching the following list: /getFollowingList", () => {
    test(
      "test 1: Fetching following list with valid request",
      authMethods.validGetFollowingList
    );
    test(
      "test 2: Fetching following list with invalid page query",
      authMethods.invalidPageQuery2
    );
    test(
      "test 3: Fetching following list with missing page query (default page)",
      authMethods.missingPageQuery2
    );
    test(
      "test 4: Fetching following list with an empty following list",
      authMethods.emptyFollowingList
    );
  });
});
