import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { db } from '@/utils/db';  // Import the db instance
import { MockInterview, UserAnswer } from '@/utils/schema'; // Import schemas
import { eq } from 'drizzle-orm';
import { toast } from 'sonner';

function InterviewItemCard({ interview }) {
    const router = useRouter();

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockId);
    };

    const onFeedbackPress = () => {
        router.push('/dashboard/interview/' + interview.mockId + '/feedback');
    };

    const onDeletePress = async () => {
        try {
            // Delete user responses associated with the interview
            await db.delete(UserAnswer).where(eq(UserAnswer.mockIdRef, interview.mockId));

            // Delete the interview itself
            await db.delete(MockInterview).where(eq(MockInterview.mockId, interview.mockId));

            toast.success('Interview deleted successfully');

            // Refresh the page by reloading
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete interview:', error);
        }
    };

    return (
        <div className='border shadow-sm rounded-lg p-3 bg-gray-200'>
            <h2 className='font-bold text-blue-700'>{interview?.jobPosition} Position</h2>
            <h2 className='text-sm text-gray-600'>{interview?.jobExperience} Years of Experience</h2>
            <h2 className='text-xs text-gray-400'>Created At: {interview?.createdAt}</h2>
            <div className='flex justify-between mt-2 gap-5'>
                <Button size='sm' variant='destructive' className='w-full' onClick={onDeletePress}>
                    Delete
                </Button>
                <Button size='sm' variant='outline' className='w-full' onClick={onFeedbackPress}>
                    Feedback
                </Button>
                <Button size='sm' className='w-full' onClick={onStart}>
                    Start
                </Button>
            </div>
        </div>
    );
}

export default InterviewItemCard;
