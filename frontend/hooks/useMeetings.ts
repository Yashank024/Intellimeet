"use client";

import { useState, useEffect } from 'react';
import { Meeting } from '../types/meeting';
import { meetingService } from '../services/meetingService';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getMeetings();
      setMeetings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const uploadMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    try {
      setError(null);
      const newMeeting = await meetingService.uploadMeeting(meeting);
      setMeetings(prev => [...prev, newMeeting]);
      return newMeeting;
    } catch (err: any) {
      setError(err.message || 'Failed to upload meeting');
      throw err;
    }
  };

  return { meetings, loading, error, uploadMeeting, refetch: fetchMeetings };
}
