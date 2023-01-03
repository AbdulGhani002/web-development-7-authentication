const express = require("express");

const db = require("../data/database");

const bcrypt = require("bcryptjs");

const router = express.Router();

router.get("/", function (req, res) {
  res.render("welcome");
});

router.get("/signup", async function (req, res) {
  res.render("signup");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const email = userData.email; // userData['email']
  const confirmEmail = userData["confirm-email"];
  const password = userData.password;
  if (
    !email ||
    !confirmEmail ||
    !password ||
    password.trim() < 6 ||
    email !== confirmEmail ||
    !email.includes("@")
  ) {
    console.log("Incorrect Data");
    return res.redirect("/signup");
  }
  const existingUser = db.getDb().collection("users").findOne({ email: email });
  if (existingUser) {
    console.log("User already exists");
    return res.redirect("/signup");
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    email: email,
    password: hashedPassword,
  };
  await db.getDb().collection("users").insertOne(user);
  res.redirect("/login");
});

router.post("/login", async function (req, res) {
  const userData = req.body;
  const email = userData.email; // userData['email']
  const password = userData.password;
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: email });

  if (!existingUser) {
    console.log(`Couldn't Login`);
    return res.redirect("/login");
  }
  const isPasswordSame = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordSame) {
    console.log("Could not login - Password is not correct!");
    return res.redirect("/login");
  }
  console.log("User is authenticated!");
  res.redirect("/admin");
});

router.get("/admin", function (req, res) {
  res.render("admin");
});

router.post("/logout", function (req, res) {});

module.exports = router;
