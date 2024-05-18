const express = require('express');
var router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * Registers a new user.
 *
 * @swagger
 * /api/user/signup:
 *   post:
 *     summary: Register a new user.
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: The firstname of the user.
 *               lastname:
 *                 type: string
 *                 description: The lastname of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password for the user account.
 *     responses:
 *       '201':
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message.
 *                 user:
 *                   type: object
 *                   description: Details of the newly registered user.
 *       '400':
 *         description: User registration not successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: 
 *                 error:
 *                   type: string
 *                   description: Error message for unsuccessful registration.
 */

/**
 * Logs in a user.
 *
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Logs in a user.
 *     description: Logs in an existing user by verifying credentials.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user.
 *     responses:
 *       '200':
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating successful login.
 *                 user:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: The authentication token for the logged-in user.
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Reason for unauthorized access (e.g., invalid password, unverified account).
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message indicating that the user was not found.
 *       '500':
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message indicating a server error.
 */

// authentication

router.post("/signup", userController.registerUser);

router.post("/login", userController.login);

router.get("/profile", authController.verifyToken, authController.checkUser, userController.userProfile);

router.post("/job", authController.verifyToken, authController.checkUser, userController.createJob);

router.get("/job/:id", authController.verifyToken, authController.checkUser, userController.getSingleJob);

router.put("/job/:id", authController.verifyToken, authController.checkUser, userController.updateJob);

router.get("/jobs", authController.verifyToken, authController.checkUser, userController.getCreatedJobsByUser);

router.get("/general-jobs", userController.getJobs);



module.exports = router;