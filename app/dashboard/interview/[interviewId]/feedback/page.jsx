"use client"
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { LucideChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

function Feedback({ params }) {
    const [feedbackList, setFeedbackList] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [ratingSuggestion, setRatingSuggestion] = useState('');
    const totalQuestions = 10; // Total number of questions
    const maxRating = 5; // Maximum rating per question
    const router = useRouter();

    useEffect(() => {
        GetFeedback();
    }, []);

    const GetFeedback = async () => {
        try {
            const result = await db.select()
                .from(UserAnswer)
                .where(eq(UserAnswer.mockIdRef, params.interviewId))
                .orderBy(UserAnswer.id);

            setFeedbackList(result);

            // Calculate total rating and average based on total number of questions
            const totalRating = result.reduce((acc, item) => acc + (item.rating || 0), 0);
            const avgRating = (totalRating / (totalQuestions * maxRating)) * 10; // Scale to 10
            const roundedRating = Math.round(avgRating / 2); // Convert to integer format 0-5

            setAverageRating(roundedRating);

            // Determine the rating suggestion based on the average rating
            let suggestion = '';
            if (roundedRating >= 4) {
                suggestion = 'Excellent! Keep up the great work.';
            } else if (roundedRating >= 3) {
                suggestion = 'Good job! There is room for improvement.';
            } else if (roundedRating >= 2) {
                suggestion = 'Fair. You need to work on some areas.';
            } else if (roundedRating >= 1) {
                suggestion = 'Poor. You have to work on it.';
            } else {
                suggestion = 'No feedback received.';
            }
            setRatingSuggestion(suggestion);

        } catch (error) {
            console.error("Failed to fetch feedback:", error);
        }
    }

    return (
        <div className='p-10'>
            {feedbackList.length === 0 ?
                <h2 className='font-bold text-xl text-gray-500'>No Interview Feedback Record Found</h2>
                :
                <>
                    <h2 className='text-3xl font-bold text-green-500'>Congratulations</h2>
                    <h2 className='font-bold text-2xl'>Here is your interview feedback</h2>
                    
                    <div className='my-6 p-4 bg-white shadow-lg rounded-lg'>
                        <h2 className='text-xl font-semibold text-blue-800'>Your Overall Rating:</h2>
                        <div className='text-4xl font-bold text-blue-600 mt-2'>{averageRating}/5</div>
                        <div className='mt-4 p-4 bg-gray-100 border rounded-lg'>
                            <h3 className='text-lg font-semibold'>Feedback:</h3>
                            <p className='text-gray-700 mt-2'>{ratingSuggestion}</p>
                        </div>
                    </div>

                    <h2 className='text-sm text-gray-800'>
                        Find below interview questions with correct answers, your answers, and feedback for improvement
                    </h2>
                    {feedbackList.map((item, index) => (
                        <Collapsible key={index} className='mt-7'>
                            <CollapsibleTrigger className='p-2 bg-secondary rounded-lg flex justify-between my-2 text-left w-full gap-7'>
                                {item.question} 
                                <LucideChevronsUpDown className='h-5 w-5'/>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className='flex flex-col gap-2'>
                                    <div className='p-2 border rounded-lg bg-yellow-100'>
                                        <strong className='text-yellow-800'>Rating:</strong> {item.rating}
                                    </div>
                                    <div className='p-2 border rounded-lg bg-red-100'>
                                        <strong className='text-red-800'>Your Answer:</strong> {item.userAns}
                                    </div>
                                    <div className='p-2 border rounded-lg bg-green-100'>
                                        <strong className='text-green-800'>Correct Answer:</strong> {item.correctAns}
                                    </div>
                                    <div className='p-2 border rounded-lg bg-blue-100'>
                                        <strong className='text-blue-800'>Feedback:</strong> {item.feedback}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </>
            }

            <Button onClick={() => router.replace('/dashboard')} className='mt-4'>Go Home</Button>
        </div>
    )
}

export default Feedback
