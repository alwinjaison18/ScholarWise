/**
 * Date utility functions for ScholarWise India
 * All dates are formatted according to Indian standard (DD/MM/YYYY)
 */

/**
 * Formats a date string to DD/MM/YYYY format (Indian standard)
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDateIndian = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Formats a date string to long format with DD/MM/YYYY
 * Example: "25 December 2024 (25/12/2024)"
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string with long month name and DD/MM/YYYY
 */
export const formatDateLong = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const longFormat = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const shortFormat = formatDateIndian(dateString);
    return `${longFormat} (${shortFormat})`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Formats a date-time string to DD/MM/YYYY, HH:MM AM/PM format
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date-time string
 */
export const formatDateTimeIndian = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const dateStr = formatDateIndian(dateString);
    const timeStr = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${dateStr}, ${timeStr}`;
  } catch (error) {
    console.error("Error formatting date-time:", error);
    return "Invalid Date";
  }
};

/**
 * Calculates time left until deadline and returns formatted string
 * @param deadline - ISO date string of the deadline
 * @returns Time left string or deadline passed message
 */
export const getTimeLeftFromDeadline = (deadline: string): string => {
  try {
    const now = new Date();
    const deadlineDate = new Date(deadline);

    if (isNaN(deadlineDate.getTime())) {
      return "Invalid deadline";
    }

    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Deadline passed";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;

    // For dates far in future, show the actual date in DD/MM/YYYY format
    return `Due on ${formatDateIndian(deadline)}`;
  } catch (error) {
    console.error("Error calculating time left:", error);
    return "Invalid deadline";
  }
};

/**
 * Formats deadline for display - shows time left for near deadlines, date for far ones
 * @param deadline - ISO date string of the deadline
 * @returns Formatted deadline string
 */
export const formatDeadlineDisplay = (deadline: string): string => {
  try {
    const now = new Date();
    const deadlineDate = new Date(deadline);

    if (isNaN(deadlineDate.getTime())) {
      return "Invalid deadline";
    }

    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Deadline passed";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;

    // For dates more than 30 days away, show the actual date
    return formatDateIndian(deadline);
  } catch (error) {
    console.error("Error formatting deadline display:", error);
    return "Invalid deadline";
  }
};
