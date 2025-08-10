import React from "react";

interface WelcomeCardProps {
    user: {
        displayName?: string;
        email?: string;
        name?: string;
        firstName?: string;
    };
}

export default function WelcomeCard({ user }: WelcomeCardProps) {
    // Try multiple ways to get the user's name
    const getName = () => {
        if (user.displayName) {
            return user.displayName.split(' ')[0];
        }
        if (user.firstName) {
            return user.firstName;
        }
        if (user.name) {
            return user.name.split(' ')[0];
        }
        if (user.email) {
            // Extract name from email (before @)
            const emailName = user.email.split('@')[0];
            // Capitalize first letter
            return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        return 'there';
    };

    const firstName = getName();

    return (
        <p className="text-gray-400 text-3xl font-medium">
            Welcome back, {firstName}!
        </p>
    );
}
