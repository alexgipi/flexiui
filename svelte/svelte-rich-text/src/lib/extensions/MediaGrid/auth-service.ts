const API_URL = "http://localhost:3500/api/";

export async function refreshUserToken(refreshToken:any) {
  const response = await fetch(API_URL + "users/refresh-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "refresh": refreshToken,
    },
  });

  return await response?.json();
}