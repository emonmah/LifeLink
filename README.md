LifeLink – Smart Blood Donation System

Technology Stack-

Node.js as the runtime

Express.js as the backend framework

MongoDB with Mongoose for database management

JWT (JSON Web Token) for authentication

bcryptjs for password hashing

Multer for NID image upload

Nodemailer for email and OTP verification

User Roles in Your System-

Donor

Seeker

Admin

All donors and seekers are stored in the User collection, differentiated by role.
Admins are stored in a separate Admin collection.

Registration Flow -

Step 1: Temporary Registration

User submits:

Name, email, phone

Password (hashed)

Role (donor or seeker)

Blood group

NID number

NID image

Backend:

Generates an OTP

Sends OTP to email

Generates a temporary JWT

Does not store the user yet

Step 2: Email Verification

User submits:

OTP

Temporary token

Backend:

Verifies OTP and token

Creates user in database

Sets:

emailVerified = true

nidStatus = pending

status = pending


