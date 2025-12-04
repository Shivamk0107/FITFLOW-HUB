export interface ProgressData {
  user_id: string;
  exercise: string;
  reps: number;
  sets: number;
  calories_burned: number;
  duration?: number;
}

const API_BASE_URL = "http://127.0.0.1:8000"; // or your deployed backend URL

export async function saveProgress(data: ProgressData) {
  try {
    const response = await fetch(`${API_BASE_URL}/progress/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save progress");
    }

    return await response.json();
  } catch (err) {
    console.error("Error saving progress:", err);
    return null;
  }
}

export async function getUserProgress(userId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/progress/${userId}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching progress:", err);
    return null;
  }
}
