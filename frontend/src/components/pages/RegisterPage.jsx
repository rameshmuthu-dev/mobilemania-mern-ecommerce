import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../ui/Message' 
import Spinner from '../ui/Spinner'
import Button from '../ui/Button'
import { toast } from 'react-toastify'; 

import { requestOtp, register, reset } from '../../redux/slices/authSlice'

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { user, isLoading, isError, message } = useSelector((state) => state.auth);

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (user) {
            navigate(redirect);
        }

        dispatch(reset());

        return () => {
            dispatch(reset());
        };
    }, [navigate, user, redirect, dispatch]);

    const submitHandler = (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Passwords do not match'); 
            return;
        }

        if (step === 1) {

            const requestData = {
                firstName: firstName,
                lastName: lastName,
                email: email
            };

            dispatch(requestOtp(requestData))
                .unwrap()
                .then(() => {
                    setStep(2);
                })
                .catch(() => {
                });
        }

        else if (step === 2) {
            if (!otp) {
                toast.error('Please enter the OTP to complete registration.');
                return;
            }

            const finalData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                otp: otp
            };

            dispatch(register(finalData));
        }
    };

    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h1 className="text-3xl font-bold text-center text-gray-800">Sign Up</h1>

                {isError && <Message variant="danger">{message}</Message>}
                
                {isLoading && <Spinner />}

                <form onSubmit={submitHandler} className="space-y-4">
                    
                    {step === 1 && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter first name"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Enter last name"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                            <input
                                type="text"
                                placeholder="Enter the 6-digit OTP"
                                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-lime-500 focus:border-lime-500"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="success"
                        className="w-full text-lg"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <Spinner />
                            : (step === 1 ? 'Register & Send OTP' : 'Complete Registration')
                        }
                    </Button>

                    {step === 2 && (
                        <div className="text-center">
                            <Link
                                onClick={() => { setStep(1); setOtp(''); }}
                                className="text-sm text-lime-600 hover:text-lime-800 font-medium cursor-pointer"
                            >
                                Re-enter details or Resend OTP
                            </Link>
                        </div>
                    )}

                </form>


                <div className="text-center pt-4 border-t mt-4">
                    <p className="text-sm text-gray-600">
                        Have an account?{' '}
                        <Link
                            to={redirect ? `/login?redirect=${redirect}` : '/login'}
                            className="text-lime-600 hover:text-lime-800 font-medium"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;