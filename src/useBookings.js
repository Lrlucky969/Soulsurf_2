// SoulSurf – useBookings v7.4 (Sprint 38: Booking History)
// Fetches user's past bookings from Supabase. Returns empty array if not logged in.
import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./supabase.js";

export default function useBookings(userEmail) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !userEmail) {
      setBookings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("bookings")
        .select("id, school_name, course_name, date, people, amount_total, currency, status, created_at")
        .eq("customer_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(20);

      if (err) {
        console.error("Bookings fetch error:", err);
        setError(err.message);
        setBookings([]);
      } else {
        setBookings(data || []);
      }
    } catch (e) {
      console.error("Bookings fetch failed:", e);
      setError(e.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Fetch on mount and when email changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
}
