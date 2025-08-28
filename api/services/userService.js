
import client from '../apiClient';

export const userService = {
  getBookings: async () => {
    const { data } = await client.get('/booking/user/bookings');
    return data.bookings || [];
  },
  getReviews: async (userId) => {
    const { data } = await client.get('/review/trek/all');
    return (data.reviews || []).filter((r) => {
      const id = typeof r.userId === 'string' ? r.userId : r.userId?._id;
      return id?.toString() === userId?.toString();
    });
  },
  getWishlist: async () => {
    const { data } = await client.get('/wishlist/get');
    return data.wishlist?.treks || [];
  },
};
    