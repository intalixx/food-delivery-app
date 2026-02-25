import { Request, Response } from 'express';
import { UserModel, User } from '../models/userModel';
import { AddressModel, Address } from '../models/addressModel';
import { OtpModel } from '../models/otpModel';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt';

export const AuthController = {
    // @desc    Send OTP to user
    // @route   POST /api/auth/send-otp
    // @access  Public
    async sendOtp(req: Request, res: Response): Promise<void> {
        const { mobile_number } = req.body;

        if (!mobile_number || mobile_number.length !== 10) {
            res.status(400).json({ success: false, errors: ['Valid 10-digit mobile number is required'] });
            return;
        }

        // Generate a 6-digit random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            await OtpModel.createOrUpdate(mobile_number, otp);

            console.log(`\n======================================`);
            console.log(`🔑 OTP for +91 ${mobile_number} is: ${otp}`);
            console.log(`======================================\n`);

            res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                otp // Send back to client for easy toast
            });
        } catch (error) {
            console.error('Error creating OTP:', error);
            res.status(500).json({ success: false, errors: ['Failed to generate OTP'] });
        }
    },

    // @desc    Verify OTP and login or indicate signup needed
    // @route   POST /api/auth/verify-otp
    // @access  Public
    async verifyOtp(req: Request, res: Response): Promise<void> {
        const { mobile_number, otp } = req.body;

        if (!mobile_number || !otp) {
            res.status(400).json({ success: false, errors: ['Mobile number and OTP are required'] });
            return;
        }

        try {
            // Check against DB
            const storedOtpRecord = await OtpModel.getByMobile(mobile_number);

            if (!storedOtpRecord) {
                res.status(401).json({ success: false, errors: ['No OTP requested or OTP expired'] });
                return;
            }

            if (new Date() > storedOtpRecord.expires_at) {
                res.status(401).json({ success: false, errors: ['OTP has expired'] });
                await OtpModel.deleteByMobile(mobile_number); // Clean up expired
                return;
            }

            if (storedOtpRecord.otp !== otp) {
                res.status(401).json({ success: false, errors: ['Invalid OTP'] });
                return;
            }

            // OTP valid, remove it
            await OtpModel.deleteByMobile(mobile_number);
            // Check if user exists
            const user = await UserModel.getByMobile(mobile_number);

            if (user) {
                // User exists -> Login
                const token = generateToken(user.id);
                setAuthCookie(res, token);
                res.status(200).json({
                    success: true,
                    isNewUser: false,
                    user,
                    token
                });
            } else {
                // User doesn't exist -> Needs to signup
                res.status(200).json({
                    success: true,
                    isNewUser: true,
                    message: 'User not found, please proceed to signup',
                    mobile_number
                });
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            res.status(500).json({ success: false, errors: ['Internal server error'] });
        }
    },

    // @desc    Signup new user after verifying OTP
    // @route   POST /api/auth/signup
    // @access  Public
    async signup(req: Request, res: Response): Promise<void> {
        try {
            const { mobile_number, user_name, house_number, street_locality, city, state, pincode } = req.body;

            // Simple validation
            if (!mobile_number || !user_name || !house_number || !street_locality || !city || !state || !pincode) {
                res.status(400).json({ success: false, errors: ['All fields are required'] });
                return;
            }

            // Check if user already exists
            const existingUser = await UserModel.getByMobile(mobile_number);
            if (existingUser) {
                res.status(400).json({ success: false, errors: ['User already exists with this mobile number'] });
                return;
            }

            // Create User
            const user = await UserModel.create(user_name, mobile_number, null, 'male', null);

            // Create Address for the User
            const address = await AddressModel.create({
                user_id: user.id,
                save_as: 'Home',
                pincode,
                city,
                state,
                house_number,
                street_locality,
                mobile: mobile_number
            });

            // Generate token and cookie
            const token = generateToken(user.id);
            setAuthCookie(res, token);

            res.status(201).json({
                success: true,
                user,
                address,
                token
            });
        } catch (error) {
            console.error('Signup Error:', error);
            res.status(500).json({ success: false, errors: ['Internal server error during signup'] });
        }
    },

    // @desc    Logout user and clear cookie
    // @route   POST /api/auth/logout
    // @access  Private
    async logout(req: Request, res: Response): Promise<void> {
        clearAuthCookie(res);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    },

    // @desc    Get current logged in user
    // @route   GET /api/auth/me
    // @access  Private
    async getMe(req: any, res: Response): Promise<void> {
        const user = req.user;
        if (user) {
            res.status(200).json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, errors: ['User not found'] });
        }
    }
};
