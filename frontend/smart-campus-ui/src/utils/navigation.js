/**
 * Returns the correct home path based on the user's role.
 * @param {import('../auth/AuthContext').User} user
 * @returns {string}
 */
export const getRoleBasedPath = (user) => {
  return user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
};
