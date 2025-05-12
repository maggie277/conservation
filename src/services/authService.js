import { auth } from '../firebaseConfig';
import { 
  sendPasswordResetEmail, 
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';

export const sendResetEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Error sending reset email:", error);
    let errorMessage = "Failed to send reset email. Please try again.";
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "No user found with this email address.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Please enter a valid email address.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Too many attempts. Please try again later.";
        break;
    }
    
    return { error: errorMessage };
  }
};

export const verifyResetToken = async (oobCode) => {
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return { email, success: true };
  } catch (error) {
    console.error("Error verifying reset token:", error);
    let errorMessage = "Invalid or expired reset link. Please request a new one.";
    
    if (error.code === 'auth/expired-action-code') {
      errorMessage = "The reset link has expired. Please request a new one.";
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = "Invalid reset link. Please request a new one.";
    }
    
    return { error: errorMessage };
  }
};

export const resetPassword = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    let errorMessage = "Failed to reset password. Please try again.";
    
    if (error.code === 'auth/weak-password') {
      errorMessage = "Password should be at least 6 characters.";
    }
    
    return { error: errorMessage };
  }
};