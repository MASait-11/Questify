import React, { useState } from 'react';

/**
 * NudgeButton Component
 * Allows sending AI-generated encouragement messages to friends
 * Generates personalized messages based on goals using Gemini AI
 */
function NudgeButton({ fromUserId, toUserId, goalId, friendName, friendId }) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Use provided IDs or fall back to alternative prop names
  const actualToUserId = toUserId || friendId;

  // Handle sending nudge
  const handleSendNudge = async () => {
    setIsSending(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/social/nudge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          from_user_id: fromUserId,
          to_user_id: actualToUserId,
          goal_id: goalId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        // Reset after 3 seconds
        setTimeout(() => {
          setSent(false);
        }, 3000);
      } else {
        setError(data.error || 'Failed to send nudge');
      }
    } catch (error) {
      console.error('Error sending nudge:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="nudge-button-wrapper">
      <button
        className={`btn-nudge ${sent ? 'sent' : ''}`}
        onClick={handleSendNudge}
        disabled={isSending || sent}
        title={`Send encouragement to ${friendName}`}
      >
        {sent ? '✓ Sent!' : isSending ? 'Sending...' : '💬 Send Nudge'}
      </button>
      {error && <p className="nudge-error">{error}</p>}
    </div>
  );
}

export default NudgeButton;

