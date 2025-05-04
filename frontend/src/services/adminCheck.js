/**
 * Checks if the current user is an admin with a valid, non-expired token
 * @returns {Object} Authentication status object
 */
const isAdminWithValidToken = () => {
    try {
      // Get token from local storage
      const token = localStorage.getItem("token");
      
      // If no token exists, return early
      if (!token) {
        return {
          isAuthenticated: false,
          isAdmin: false,
          error: "No authentication token found"
        };
      }
      
      // Decode the token payload
      // Note: This only decodes the token but does not verify its signature
      // For production, use a proper JWT library
      const payload = JSON.parse(atob(token.split(".")[1]));
      
      // Check if token has expired
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (payload.exp && payload.exp < currentTime) {
        return {
          isAuthenticated: false,
          isAdmin: false,
          error: "Token has expired",
          expired: true
        };
      }
      
      // Check if user has admin role
      const isAdmin = payload.role === "Admin";
      
      return {
        isAuthenticated: true,
        isAdmin: isAdmin,
        userId: payload.userId || payload.sub,
        username: payload.username,
        role: payload.role,
        error: null
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: "Invalid token format"
      };
    }
  };
  
  export default isAdminWithValidToken;
  