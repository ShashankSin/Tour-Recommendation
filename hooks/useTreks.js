// src/hooks/useTreks.js
import  {useQuery}  from '@tanstack/react-query';
import { trekService } from '../api/services/trekServices';
import { queryKeys } from '../api/queries';

export function useAllTreks() {
  return useQuery({
    queryKey: queryKeys.treks,
    queryFn: trekService.getAllTreks,
  });
}

export function useTrendingTreks() {
  return useQuery({
    queryKey: queryKeys.trending,
    queryFn: trekService.getTrending,
  });

}

export function usePopularTreks() {
  return useQuery({
    queryKey: queryKeys.popular,
    queryFn: trekService.getPopular,
  });
}

export function useRecommendations(userId) {
  return useQuery({
    queryKey: queryKeys.recommendations(userId),
    queryFn: () => trekService.getRecommendations(userId),
    enabled: !!userId,
  });
}
