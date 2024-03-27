// AuthService.js
export const loginUser = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const data = await response.json();
      return data; // Contains the token and any other data
    } catch (error) {
      throw error;
    }
  };
  