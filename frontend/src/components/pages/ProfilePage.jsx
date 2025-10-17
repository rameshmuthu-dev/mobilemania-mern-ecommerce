import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';

// Import your reusable components
import Spinner from '../../components/ui/Spinner';
import Message from '../../components/ui/Message';
import Button from '../../components/ui/Button';

// Import Redux thunk/actions (adjust path as needed)
import { updateUserDetails, reset } from '../../redux/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user: userInfo,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.auth);

  // Local form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local error states
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setFirstName(userInfo.firstName || '');
      setLastName(userInfo.lastName || '');
      setEmail(userInfo.email || '');
    }

    return () => {
      dispatch(reset());
    };
  }, [navigate, userInfo, dispatch]);

  // Password validation
  const localValidate = () => {
    let hasError = false;
    setPasswordError(null);
    setConfirmPasswordError(null);

    const isPasswordEntered = !!password.trim();
    const isConfirmPasswordEntered = !!confirmPassword.trim();

    if (isPasswordEntered || isConfirmPasswordEntered) {
      if (!isPasswordEntered) {
        setPasswordError('New Password is required if updating.');
        hasError = true;
      }
      if (!isConfirmPasswordEntered) {
        setConfirmPasswordError('Confirm Password is required if updating.');
        hasError = true;
      }
      if (
        isPasswordEntered &&
        isConfirmPasswordEntered &&
        password !== confirmPassword
      ) {
        setPasswordError('Passwords do not match.');
        setConfirmPasswordError('Passwords do not match.');
        hasError = true;
      }
    }

    return !hasError;
  };

  // Submit handler
  const submitHandler = (e) => {
    e.preventDefault();
    const isValid = localValidate();
    if (!isValid) return;

    const dataToUpdate = {
      firstName,
      lastName,
      email,
    };

    if (password.trim() && confirmPassword.trim()) {
      dataToUpdate.password = password;
    }

    dispatch(updateUserDetails(dataToUpdate));
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3 flex items-center">
        <FaUser className="mr-3 text-lime-600" /> My Profile
      </h1>

      {/* Show error message */}
      {isError && message && (
        <Message variant="danger">{message}</Message>
      )}

      {/* Show loading spinner */}
      {isLoading && <Spinner />}

      <form
        onSubmit={submitHandler}
        className="space-y-6 bg-white p-6 rounded-xl shadow-2xl border border-gray-100"
        noValidate
      >
        {/* First and last name fields */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="Enter First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              placeholder="Enter Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
            />
          </div>
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
            <FaLock className="mr-2 text-gray-500" /> New Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter new password"
            value={password}
            required
            autoComplete='new password'
            onChange={e => setPassword(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none ${
              passwordError
                ? 'border-red-500 ring-red-500'
                : 'border-gray-300 focus:ring-lime-500 focus:border-lime-500'
            }`}
          />
          {passwordError && (
            <Message variant="danger">{passwordError}</Message>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            autoComplete='confirmPassword'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className={`mt-1 block w-full px-3 py-2 border rounded-xl shadow-sm focus:outline-none ${
              confirmPasswordError
                ? 'border-red-500 ring-red-500'
                : 'border-gray-300 focus:ring-lime-500 focus:border-lime-500'
            }`}
          />
          {confirmPasswordError && (
            <Message variant="danger">{confirmPasswordError}</Message>
          )}
        </div>

        {/* Submit Button - use Button component */}
        <Button
          type="submit"
          disabled={isLoading}
          isloading={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
