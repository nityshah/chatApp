import { jest } from "@jest/globals";

// --- Mocks ---
jest.unstable_mockModule("./models/user.model.js", () => ({
  default: { findOne: jest.fn(), findByIdAndUpdate: jest.fn() },
}));
jest.unstable_mockModule("bcryptjs", () => ({
  default: { genSalt: jest.fn(), hash: jest.fn(), compare: jest.fn() },
}));
jest.unstable_mockModule("./lib/utils.js", () => ({ generateToken: jest.fn() }));
jest.unstable_mockModule("./lib/cloudinary.js", () => ({
  default: { uploader: { upload: jest.fn() } },
}));

const { default: User } = await import("./models/user.model.js");
const { default: bcrypt } = await import("bcryptjs");
const { signup, login, logout } = await import("./controllers/auth.controller.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => jest.clearAllMocks());

// signup
test("signup - 400 if fields are missing", async () => {
  const res = mockRes();
  await signup({ body: { fullName: "", email: "", password: "" } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
});

test("signup - 400 if password too short", async () => {
  const res = mockRes();
  await signup({ body: { fullName: "Ali", email: "a@b.com", password: "123" } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
});

test("signup - 400 if user already exists", async () => {
  User.findOne.mockResolvedValue({ email: "a@b.com" });
  const res = mockRes();
  await signup({ body: { fullName: "Ali", email: "a@b.com", password: "123456" } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
});

// login
test("login - 400 if user not found", async () => {
  User.findOne.mockResolvedValue(null);
  const res = mockRes();
  await login({ body: { email: "x@x.com", password: "pass" } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
});

test("login - 400 if password is wrong", async () => {
  User.findOne.mockResolvedValue({ _id: "uid", password: "hash" });
  bcrypt.compare.mockResolvedValue(false);
  const res = mockRes();
  await login({ body: { email: "a@b.com", password: "wrong" } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
});

test("login - 200 on valid credentials", async () => {
  User.findOne.mockResolvedValue({ _id: "uid", fullName: "Ali", email: "a@b.com", profilePic: "", createdAt: new Date(), password: "hash" });
  bcrypt.compare.mockResolvedValue(true);
  const res = mockRes();
  await login({ body: { email: "a@b.com", password: "correct" } }, res);
  expect(res.status).toHaveBeenCalledWith(200);
});

// logout
test("logout - 200 and clears cookie", () => {
  const res = mockRes();
  logout({}, res);
  expect(res.cookie).toHaveBeenCalledWith("jwt", "", { maxAge: 0 });
  expect(res.status).toHaveBeenCalledWith(200);
});
