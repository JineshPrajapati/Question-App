export const updateUserPermission = async ({ userId, permissionId, isEnabled }) => {
  const response = await fetch(`/api/users/${userId}/permissions`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      permissionId,
      isEnabled,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update permission');
  }

  return response.json();
}; 