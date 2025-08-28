export const queryKeys = {
  treks: ['treks'],
  trending:['treks','trending'],
    popular:['treks','popular'],
    recommendations:(userId) => ['treks', 'recommendations', userId],
    bookings:(userId) => ['user',userId,'bookings'],
    reviews:(userId) => ['reviews', userId,'reviews'],
    wishlist:(userId) => ['user',userId,'wishlist'],
};