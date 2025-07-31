import { useState, useEffect } from "react";
import type { Scholarship, ScholarshipFilters } from "../types";
import scholarshipService from "../services/scholarshipService";

export function useScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchScholarships = async (
    page = 1,
    limit = 10,
    filters: ScholarshipFilters = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await scholarshipService.getScholarships(
        page,
        limit,
        filters
      );

      setScholarships(response.scholarships);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotal(response.total);
    } catch (err) {
      console.error("Error fetching scholarships:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch scholarships"
      );

      // Fallback to empty array if API fails
      setScholarships([]);
      setTotalPages(0);
      setCurrentPage(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  return {
    scholarships,
    isLoading,
    error,
    totalPages,
    currentPage,
    total,
    fetchScholarships,
    refetch: () => fetchScholarships(currentPage),
  };
}

export function useScholarshipById(id: string) {
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarship = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await scholarshipService.getScholarshipById(id);
        setScholarship(data);
      } catch (err) {
        console.error("Error fetching scholarship:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch scholarship"
        );
        setScholarship(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarship();
  }, [id]);

  return { scholarship, isLoading, error };
}

export function useUpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await scholarshipService.getUpcomingDeadlines();
        setDeadlines(data);
      } catch (err) {
        console.error("Error fetching deadlines:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch deadlines"
        );
        setDeadlines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeadlines();
  }, []);

  return { deadlines, isLoading, error };
}
