const assert = require("assert");
const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("../app/models/user.model");
const sequelize = new Sequelize("sqlite::memory:");

const User = UserModel(sequelize, Sequelize, DataTypes);
const sampleUserData = {
  firstname: "John",
  lastname: "Doe",
  email: "john.doe@example.com",
  password: "securepassword",
  retypepassword: "securepassword",
};

describe("User Model Tests", function () {
  beforeEach(async function () {
    await sequelize.sync({ force: true });
  });

  it("should create a user", async function () {
    const createdUser = await User.create(sampleUserData);

    const retrievedUser = await User.findOne({
      where: { email: sampleUserData.email },
    });

    assert.strictEqual(createdUser.email, sampleUserData.email);
    assert.strictEqual(retrievedUser.email, sampleUserData.email);
  });
});
