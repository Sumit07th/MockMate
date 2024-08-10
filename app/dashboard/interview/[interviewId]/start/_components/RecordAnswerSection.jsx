"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModal'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import moment from 'moment'

function RecordAnswerSection({ mockInterviewQuestion, ActiveQuIndex, interviewData }) {
    const [userAnswer, setUserAnswer] = useState(''); // Initialize as an empty string
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    useEffect(() => {
        results.forEach((result) => {
            setUserAnswer((prevAns) => prevAns + (result?.transcript || '')); // Ensure undefined is handled
        });
    }, [results]);

    useEffect(() => {
        if (!isRecording && userAnswer.length > 10) {
            UpdateUserAnswer();
        }
    }, [userAnswer]);

    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
        } else {
            startSpeechToText();
        }
    }

    const UpdateUserAnswer = async () => {
        console.log(userAnswer);
        setLoading(true);
        
        const feedbackPrompt = `Question: ${mockInterviewQuestion[ActiveQuIndex]?.question}, User Answer: ${userAnswer}. Based on the question and user answer for the given interview question, please provide a rating and feedback for improvement in JSON format with fields 'rating' and 'feedback'.`;

        try {
            const result = await chatSession.sendMessage(feedbackPrompt);

            // Log the response to debug formatting issues
            console.log("Chat session response:", result.response.text());

            const mockJsonResp = (result.response.text())
                .replace('```json', '')
                .replace('```', '');

            console.log("Processed JSON response:", mockJsonResp);

            const JsonFeedbackResp = JSON.parse(mockJsonResp);

            const resp = await db.insert(UserAnswer)
                .values({
                    mockIdRef: interviewData?.mockId,
                    question: mockInterviewQuestion[ActiveQuIndex]?.question,
                    correctAns: mockInterviewQuestion[ActiveQuIndex]?.answer,
                    userAns: userAnswer,
                    feedback: JsonFeedbackResp?.feedback,
                    rating: JsonFeedbackResp?.rating,
                    userEmail: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-yyyy')
                });

            if (resp) {
                toast.success('User answer recorded successfully');
                setUserAnswer('');
                setResults([]);
            }
        } catch (error) {
            console.error("Failed to update user answer:", error);
            toast.error('Failed to record answer');
        } finally {
            setLoading(false);
            setResults([]);
        }
    }

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col justify-center items-center bg-secondary rounded-lg p-5 bg-black mt-10'>
                <Image src={'/webcam.png'} width={200} height={200} className='absolute' />
                <Webcam
                    mirrored={true}
                    style={{
                        height: 350,
                        width: '100%',
                        zIndex: 10,
                    }}
                />
            </div>

            <Button 
                disabled={loading}
                className='my-10'
                onClick={StartStopRecording}
            >
                {isRecording ?
                    <h2 className='text-red-600 animate-pulse flex gap-2 items-center'>
                        <StopCircle /> Stop Recording
                    </h2>
                    :
                    <h2 className='text-blue-600 animate-pulse flex gap-2 items-center'>
                        <Mic /> Record
                    </h2>}
            </Button>
        </div>
    )
}

export default RecordAnswerSection
