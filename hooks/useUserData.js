// src/hooks/useUserData.js
import  {useQuery}  from '@tanstack/react-query';
import { userService } from '../api/services/userService';
import { queryKeys } from '../api/queries';

export function useUserBookings(userId) {
  return useQuery({
    queryKey: queryKeys.bookings(userId),
    queryFn: userService.getBookings,
    enabled: !!userId,
  });
}

export function useUserReviews(userId) {
  return useQuery({
    queryKey: queryKeys.reviews(userId),
    queryFn: () => userService.getReviews(userId),
    enabled: !!userId,
  });
}

export function useUserWishlist(userId) {
  return useQuery({
    queryKey: queryKeys.wishlist(userId),
    queryFn: userService.getWishlist,
    enabled: !!userId,
  });
}
